package com.omnistudy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SyllabusDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String title;
    private String fileName;
    private Long fileSize;
    private Integer pageCount;
    private String university;
    private String course;
    private String branch;
    private String semester;
    private String academicYear;
    private String storagePath;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String analysisJson;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
