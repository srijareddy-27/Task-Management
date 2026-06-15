package com.taskmanagement.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "task_status")
public class TaskStatus {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long statusId;
    
    private String statusName;
    private Integer stageOrder;
    private String colorCode;
    
    // Constructors
    public TaskStatus() {}
    
    public TaskStatus(String statusName, Integer stageOrder, String colorCode) {
        this.statusName = statusName;
        this.stageOrder = stageOrder;
        this.colorCode = colorCode;
    }
    
    // Getters and Setters
    public Long getStatusId() { return statusId; }
    public void setStatusId(Long statusId) { this.statusId = statusId; }
    
    public String getStatusName() { return statusName; }
    public void setStatusName(String statusName) { this.statusName = statusName; }
    
    public Integer getStageOrder() { return stageOrder; }
    public void setStageOrder(Integer stageOrder) { this.stageOrder = stageOrder; }
    
    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }
}