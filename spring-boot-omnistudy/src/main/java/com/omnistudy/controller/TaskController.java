package com.omnistudy.controller;

import com.omnistudy.model.StudyTask;
import com.omnistudy.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping
    public List<StudyTask> getAllTasks() {
        return taskRepository.findAll();
    }

    @PostMapping
    public StudyTask createTask(@RequestBody StudyTask task) {
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyTask> updateTask(@PathVariable Long id, @RequestBody StudyTask taskDetails) {
        return taskRepository.findById(id).map(task -> {
            if (taskDetails.getTitle() != null && !taskDetails.getTitle().isEmpty()) {
                task.setTitle(taskDetails.getTitle());
            }
            if (taskDetails.getSubject() != null) {
                task.setSubject(taskDetails.getSubject());
            }
            if (taskDetails.getTopic() != null) {
                task.setTopic(taskDetails.getTopic());
            }
            if (taskDetails.getDueDate() != null) {
                task.setDueDate(taskDetails.getDueDate());
            }
            if (taskDetails.getPriority() != null) {
                task.setPriority(taskDetails.getPriority());
            }
            if (taskDetails.getStatus() != null) {
                task.setStatus(taskDetails.getStatus());
                if ("completed".equalsIgnoreCase(taskDetails.getStatus())) {
                    task.setCompletedAt(java.time.LocalDateTime.now());
                } else {
                    task.setCompletedAt(null);
                }
            }
            if (taskDetails.getEstimatedMinutes() != null) {
                task.setEstimatedMinutes(taskDetails.getEstimatedMinutes());
            }
            return ResponseEntity.ok(taskRepository.save(task));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
