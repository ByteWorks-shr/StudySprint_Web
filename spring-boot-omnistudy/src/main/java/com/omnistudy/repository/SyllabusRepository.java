package com.omnistudy.repository;

import com.omnistudy.model.SyllabusDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusRepository extends JpaRepository<SyllabusDocument, Long> {
    List<SyllabusDocument> findByUserIdOrderByCreatedAtDesc(String userId);
    List<SyllabusDocument> findAllByOrderByCreatedAtDesc();
}
