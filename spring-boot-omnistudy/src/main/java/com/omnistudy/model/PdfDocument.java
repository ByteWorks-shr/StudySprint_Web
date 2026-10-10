package com.omnistudy.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "pdf_documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PdfDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String title;
    private String fileName;
    private Long fileSize;
    private Integer pageCount;
    private String subject;
    private String storagePath;
    private String topics;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String extractedText;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
