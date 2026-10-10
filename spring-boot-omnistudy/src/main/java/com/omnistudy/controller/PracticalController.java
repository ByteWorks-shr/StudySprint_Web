package com.omnistudy.controller;

import com.omnistudy.model.PracticalExperiment;
import com.omnistudy.repository.PracticalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/practicals")
@CrossOrigin(origins = "*")
public class PracticalController {

    @Autowired
    private PracticalRepository practicalRepository;

    @GetMapping
    public List<PracticalExperiment> getPracticals(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isEmpty() && !"guest_student".equals(userId)) {
            return practicalRepository.findByUserId(userId);
        }
        return practicalRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PracticalExperiment> getPracticalById(@PathVariable String id) {
        return practicalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PracticalExperiment createPractical(@RequestBody PracticalExperiment practical) {
        if (practical.getId() == null || practical.getId().isEmpty()) {
            practical.setId("prac_" + System.currentTimeMillis());
        }
        practical.setCreatedAt(LocalDateTime.now());
        practical.setUpdatedAt(LocalDateTime.now());
        return practicalRepository.save(practical);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PracticalExperiment> updatePractical(@PathVariable String id, @RequestBody PracticalExperiment details) {
        return practicalRepository.findById(id).map(prac -> {
            if (details.getTitle() != null && !details.getTitle().isEmpty()) {
                prac.setTitle(details.getTitle());
            }
            if (details.getSubjectName() != null) {
                prac.setSubjectName(details.getSubjectName());
            }
            if (details.getExperimentNumber() != null) {
                prac.setExperimentNumber(details.getExperimentNumber());
            }
            if (details.getDescription() != null) {
                prac.setDescription(details.getDescription());
            }
            if (details.getRequiredTools() != null) {
                prac.setRequiredTools(details.getRequiredTools());
            }
            if (details.getSubmissionDeadline() != null) {
                prac.setSubmissionDeadline(details.getSubmissionDeadline());
            }
            if (details.getStatus() != null) {
                prac.setStatus(details.getStatus());
            }
            if (details.getIsCompulsory() != null) {
                prac.setIsCompulsory(details.getIsCompulsory());
            }
            if (details.getLabExecuted() != null) {
                prac.setLabExecuted(details.getLabExecuted());
            }
            if (details.getJournalCertified() != null) {
                prac.setJournalCertified(details.getJournalCertified());
            }
            prac.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(practicalRepository.save(prac));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePractical(@PathVariable String id) {
        if (practicalRepository.existsById(id)) {
            practicalRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
