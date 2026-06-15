package com.taskmanagement.service;

import com.taskmanagement.entity.Task;
import com.taskmanagement.entity.TaskStatus;
import com.taskmanagement.entity.User;
import com.taskmanagement.entity.WorkflowTransition;
import com.taskmanagement.repository.TaskRepository;
import com.taskmanagement.repository.TaskStatusRepository;
import com.taskmanagement.repository.UserRepository;
import com.taskmanagement.repository.WorkflowTransitionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskStatusRepository statusRepository;
    
    @Autowired
    private WorkflowTransitionRepository transitionRepository;
    
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    
    public Task getTaskById(Long id) {
        return taskRepository.findById(id).orElse(null);
    }
    
    public Task createTask(Task task) {
        if (task.getCreatedAt() == null) {
            task.setCreatedAt(LocalDateTime.now());
        }
        task.setUpdatedAt(LocalDateTime.now());
        
        // Set default status if not provided
        if (task.getStatus() == null) {
            TaskStatus defaultStatus = statusRepository.findByStatusName("TODO")
                .orElse(null);
            task.setStatus(defaultStatus);
        }
        
        return taskRepository.save(task);
    }
    
    public Task updateTaskStatus(Long taskId, Long newStatusId, Long userId, String comments) {
        Task task = getTaskById(taskId);
        if (task == null) return null;
        
        Long oldStatusId = task.getStatus() != null ? task.getStatus().getStatusId() : null;
        TaskStatus newStatus = statusRepository.findById(newStatusId).orElse(null);
        
        if (newStatus == null) return null;
        
        // Update task status
        task.setStatus(newStatus);
        task.setUpdatedAt(LocalDateTime.now());
        
        // Log transition
        WorkflowTransition transition = new WorkflowTransition();
        transition.setTask(task);
        transition.setFromStatus(oldStatusId);
        transition.setToStatus(newStatusId);
        
        User user = userRepository.findById(userId).orElse(null);
        transition.setChangedBy(user);
        transition.setChangedAt(LocalDateTime.now());
        transition.setComments(comments);
        
        transitionRepository.save(transition);
        
        return taskRepository.save(task);
    }
    
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedTo_UserId(userId);
    }
    
    public List<Task> getTasksByStatus(Long statusId) {
        return taskRepository.findByStatus_StatusId(statusId);
    }
    
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}