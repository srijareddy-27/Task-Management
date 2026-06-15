from fastapi import FastAPI, HTTPException, Depends, Request, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
from typing import Optional, Dict, Any
import logging
from datetime import datetime, date
import json
import asyncio

from schema import *

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============ Helper function to convert datetime to string ============
def convert_datetime_to_string(obj):
    """Convert datetime objects to ISO format strings for JSON serialization"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, date):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: convert_datetime_to_string(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_datetime_to_string(item) for item in obj]
    if hasattr(obj, 'value'):
        return obj.value
    return obj

# ============ FastAPI App Configuration ============
app = FastAPI(
    title="Task Workflow Management Gateway",
    description="API Gateway for Task Workflow Management System",
    version="1.0.0"
)

# ============ CORS Configuration ============
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ============ Backend Service Configuration ============
SPRING_BOOT_URL = "http://localhost:8082"
NODE_SERVICE_URL = "http://localhost:8083"

AUTH_SERVICE = f"{SPRING_BOOT_URL}/auth"
USER_SERVICE = f"{SPRING_BOOT_URL}/user"
TASK_SERVICE = f"{SPRING_BOOT_URL}/task"
WORKFLOW_SERVICE = f"{SPRING_BOOT_URL}/workflow"

# ============ HTTP Client ============
class BackendClient:
    def __init__(self):
        self.client = None
        self.timeout = 30.0
    
    async def get_client(self):
        """Create new client if none exists or old one is closed"""
        if self.client is None or self.client.is_closed:
            self.client = httpx.AsyncClient(timeout=self.timeout)
        return self.client
    
    async def close(self):
        if self.client and not self.client.is_closed:
            await self.client.aclose()
        self.client = None
    
    async def request(self, method: str, url: str, token: Optional[str] = None, 
                      data: Optional[Dict] = None, params: Optional[Dict] = None):
        
        # Get client (creates new one if needed)
        client = await self.get_client()
        
        headers = {}
        
        if token:
            if token.startswith("Bearer "):
                token = token[7:]
            headers["Token"] = token
        
        headers["Content-Type"] = "application/json"
        
        if data:
            data = convert_datetime_to_string(data)
        
        logger.info(f"Sending {method} request to: {url}")
        
        # Retry logic for dead connections
        for attempt in range(3):
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    json=data,
                    params=params,
                    headers=headers,
                    timeout=30.0
                )
                
                logger.info(f"Response status: {response.status_code}")
                
                try:
                    result = response.json()
                    return convert_datetime_to_string(result)
                except:
                    return {"code": response.status_code, "message": response.text}
                    
            except httpx.ConnectError as e:
                logger.warning(f"Connection error (attempt {attempt+1}/3): {str(e)}")
                if attempt < 2:
                    await self.close()
                    client = await self.get_client()
                    await asyncio.sleep(1)
                else:
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail=f"Backend service unavailable at {url}"
                    )
            except httpx.ReadTimeout as e:
                logger.warning(f"Timeout error (attempt {attempt+1}/3): {str(e)}")
                if attempt < 2:
                    await asyncio.sleep(1)
                else:
                    raise
            except Exception as e:
                logger.error(f"Request failed: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Internal server error: {str(e)}"
                )

client = BackendClient()

async def get_client():
    return client

# ============ Helper to extract token ============
async def get_token(authorization: str = Header(None, alias="Authorization")):
    """Extract token from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Token is required")
    
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    return token

# ============ Middleware to fix sleep issue ============
@app.middleware("http")
async def refresh_client_on_every_request(request: Request, call_next):
    """Refresh HTTPX client if connection died during sleep"""
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        if "Connection" in str(e) or "closed" in str(e) or "timeout" in str(e):
            logger.warning("Connection issue detected, resetting client...")
            await client.close()
        raise e

# ============ Health Check ============
@app.get("/", tags=["Health"])
async def root():
    return {"service": "Task Workflow Management Gateway", "status": "running"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "backend": SPRING_BOOT_URL, "nodejs": NODE_SERVICE_URL}

# ============ Authentication Routes ============
@app.post("/auth/signup", response_model=ApiResponse, tags=["Authentication"])
async def signup(user_data: UserSignup, client: BackendClient = Depends(get_client)):
    signup_data = {
        "email": user_data.email,
        "fullname": user_data.fullname,
        "phone": user_data.phone,
        "password": user_data.password
    }
    result = await client.request(method="POST", url=f"{AUTH_SERVICE}/signup", data=signup_data)
    return result

@app.post("/auth/signin", response_model=LoginResponse, tags=["Authentication"])
async def signin(login_data: UserSignin, client: BackendClient = Depends(get_client)):
    signin_data = {
        "username": login_data.username,
        "password": login_data.password
    }
    result = await client.request(method="POST", url=f"{AUTH_SERVICE}/signin", data=signin_data)
    return result

# ============ User Routes ============
@app.get("/user/profile", response_model=UserProfileResponse, tags=["Users"])
async def get_profile(token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="GET", url=f"{USER_SERVICE}/profile", token=token)
    return result

@app.get("/user/getall/{page}/{limit}", tags=["Users"])
async def get_all_users(page: int, limit: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    logger.info(f"Getting all users - Page: {page}, Limit: {limit}")
    result = await client.request(method="GET", url=f"{USER_SERVICE}/getall/{page}/{limit}", token=token)
    return result

@app.get("/user/get/{user_id}", tags=["Users"])
async def get_user_by_id(user_id: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="GET", url=f"{USER_SERVICE}/get/{user_id}", token=token)
    return result

@app.put("/user/update/{user_id}", tags=["Users"])
async def update_user(user_id: int, user_data: UserSignup, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="PUT", url=f"{USER_SERVICE}/update/{user_id}", token=token, data=user_data.dict())
    return result

@app.delete("/user/delete/{user_id}", tags=["Users"])
async def delete_user(user_id: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="DELETE", url=f"{USER_SERVICE}/delete/{user_id}", token=token)
    return result

@app.put("/user/role/{user_id}", tags=["Users"])
async def update_user_role(user_id: int, role: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="PUT", url=f"{USER_SERVICE}/role/{user_id}?role={role}", token=token)
    return result

# ============ Task Routes ============
@app.get("/task/user/{user_id}", tags=["Tasks"])
async def get_tasks_by_user(user_id: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    logger.info(f"Getting tasks for user: {user_id}")
    result = await client.request(method="GET", url=f"{TASK_SERVICE}/user/{user_id}", token=token)
    return result

@app.post("/task/create", tags=["Tasks"])
async def create_task(task_data: TaskCreate, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    task_dict = task_data.dict(exclude_none=True)
    task_dict = convert_datetime_to_string(task_dict)
    logger.info(f"Creating task with data: {task_dict}")
    result = await client.request(method="POST", url=f"{TASK_SERVICE}/create", token=token, data=task_dict)
    return result

@app.put("/task/status/{task_id}", tags=["Tasks"])
async def update_task_status(task_id: int, status: str, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    logger.info(f"Updating task {task_id} status to: {status}")
    result = await client.request(method="PUT", url=f"{TASK_SERVICE}/status/{task_id}", token=token, params={"status": status})
    return result

@app.delete("/task/delete/{task_id}", tags=["Tasks"])
async def delete_task(task_id: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="DELETE", url=f"{TASK_SERVICE}/delete/{task_id}", token=token)
    return result

@app.get("/task/vectorsearch/{query}", tags=["Tasks"])
async def vector_search(query: str, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    logger.info(f"Vector search query: {query}")
    result = await client.request(method="GET", url=f"{NODE_SERVICE_URL}/tasks/vectorsearch/{query}", token=token)
    return result

# ============ Workflow Routes ============
@app.post("/workflow/create", tags=["Workflows"])
async def create_workflow(workflow_data: WorkflowCreate, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    workflow_dict = workflow_data.dict(exclude_none=True)
    workflow_dict = convert_datetime_to_string(workflow_dict)
    result = await client.request(method="POST", url=f"{WORKFLOW_SERVICE}/create", token=token, data=workflow_dict)
    return result

@app.get("/workflow/get/{workflow_id}", tags=["Workflows"])
async def get_workflow_by_id(workflow_id: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="GET", url=f"{WORKFLOW_SERVICE}/get/{workflow_id}", token=token)
    return result

@app.get("/workflow/owner/{owner_id}", tags=["Workflows"])
async def get_workflows_by_owner(owner_id: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="GET", url=f"{WORKFLOW_SERVICE}/owner/{owner_id}", token=token)
    return result

@app.delete("/workflow/delete/{workflow_id}", tags=["Workflows"])
async def delete_workflow(workflow_id: int, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="DELETE", url=f"{WORKFLOW_SERVICE}/delete/{workflow_id}", token=token)
    return result

# ============ Comment Routes ============
@app.post("/comments/{taskId}", tags=["Comments"])
async def add_comment(taskId: str, request: Request, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    data = await request.json()
    result = await client.request(method="POST", url=f"{NODE_SERVICE_URL}/comments/{taskId}", token=token, data=data)
    return result

@app.get("/comments/task/{taskId}", tags=["Comments"])
async def get_comments_by_task(taskId: str, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="GET", url=f"{NODE_SERVICE_URL}/comments/task/{taskId}", token=token)
    return result

@app.put("/comments/{commentId}", tags=["Comments"])
async def update_comment(commentId: str, request: Request, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    data = await request.json()
    result = await client.request(method="PUT", url=f"{NODE_SERVICE_URL}/comments/{commentId}", token=token, data=data)
    return result

@app.delete("/comments/{commentId}", tags=["Comments"])
async def delete_comment(commentId: str, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="DELETE", url=f"{NODE_SERVICE_URL}/comments/{commentId}", token=token)
    return result

@app.post("/comments/{commentId}/like", tags=["Comments"])
async def like_comment(commentId: str, token: str = Depends(get_token), client: BackendClient = Depends(get_client)):
    result = await client.request(method="POST", url=f"{NODE_SERVICE_URL}/comments/{commentId}/like", token=token)
    return result

# ============ Shutdown Event ============
@app.on_event("shutdown")
async def shutdown_event():
    await client.close()

# ============ Run the application ============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)