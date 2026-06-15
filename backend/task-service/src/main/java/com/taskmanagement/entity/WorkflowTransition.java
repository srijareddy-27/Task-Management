package com.taskmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workflow_transitions")
public class WorkflowTransition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transitionId;
    
    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task;
    
    private Long fromStatus;
    private Long toStatus;
    
    @ManyToOne
    @JoinColumn(name = "changed_by")
    private User changedBy;
    
    private LocalDateTime changedAt;
    private String comments;
    
    // Constructors
    public WorkflowTransition() {}
    
    // Getters and Setters
    public Long getTransitionId() { return transitionId; }
    public void setTransitionId(Long transitionId) { this.transitionId = transitionId; }
    
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    
    public Long getFromStatus() { return fromStatus; }
    public void setFromStatus(Long fromStatus) { this.fromStatus = fromStatus; }
    
    public Long getToStatus() { return toStatus; }
    public void setToStatus(Long toStatus) { this.toStatus = toStatus; }
    
    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }
    
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}