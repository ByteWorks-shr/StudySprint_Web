package com.omnistudy.repository;

import com.omnistudy.model.PdfDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PdfRepository extends JpaRepository<PdfDocument, Long> {
    List<PdfDocument> findByUserIdOrderByCreatedAtDesc(String userId);
    List<PdfDocument> findAllByOrderByCreatedAtDesc();
}
