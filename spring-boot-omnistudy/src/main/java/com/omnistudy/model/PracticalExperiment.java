package com.omnistudy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "practical_experiments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PracticalExperiment {
    @Id
    private String id;

    private String userId;
    private String syllabusId;
    private String subjectName;
    private String experimentNumber;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String requiredTools;
    private String submissionDeadline;
    private String status; // not_started, in_progress, completed

    private Boolean isCompulsory = false;
    private Boolean labExecuted = false;
    private Boolean journalCertified = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
