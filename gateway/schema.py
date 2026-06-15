from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

# ============ Enums ============
class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    BLOCKED = "BLOCKED"

class Priority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class WorkflowStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

class Role(int, Enum):
    ADMIN = 1
    MANAGER = 2
    USER = 3

# ============ User Schemas ============
class UserSignup(BaseModel):
    email: EmailStr
    fullname: str = Field(..., min_length=3, max_length=50)
    phone: str = Field(..., pattern=r'^[0-9]{10}$')
    password: str = Field(..., min_length=6)

class UserSignin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    fullname: str
    phone: str
    role: int
    status: int

class UserProfileResponse(BaseModel):
    code: int
    user: UserResponse

class UserInfoResponse(BaseModel):
    code: int
    fullname: str
    role: int

class ApiResponse(BaseModel):
    code: int
    message: str

class LoginResponse(BaseModel):
    code: int
    jwt: str

class PaginatedUsersResponse(BaseModel):
    code: int
    page: int
    size: int
    totalpages: int
    users: List[UserResponse]

# ============ Task Schemas ============
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = TaskStatus.PENDING
    priority: Optional[Priority] = Priority.MEDIUM
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None
    created_by: int
    workflow_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    completion_percentage: Optional[int] = Field(None, ge=0, le=100)

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    priority: str
    due_date: Optional[datetime]
    assigned_to: Optional[int]
    created_by: int
    workflow_id: Optional[int]
    created_at: datetime
    updated_at: datetime

class TaskListResponse(BaseModel):
    code: int
    tasks: List[TaskResponse]

class TaskSingleResponse(BaseModel):
    code: int
    task: TaskResponse

# ============ Workflow Schemas ============
class WorkflowCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    status: Optional[WorkflowStatus] = WorkflowStatus.ACTIVE
    owner_id: int

class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[WorkflowStatus] = None

class WorkflowResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

class WorkflowListResponse(BaseModel):
    code: int
    workflows: List[WorkflowResponse]

class WorkflowSingleResponse(BaseModel):
    code: int
    workflow: WorkflowResponse

# ============ Common Response ============
class ErrorResponse(BaseModel):
    code: int
    message: str
    detail: Optional[str] = None

# ============ Request Headers ============
class Headers(BaseModel):
    token: str

# ============ Task Status Update ============
class TaskStatusUpdate(BaseModel):
    status: TaskStatus