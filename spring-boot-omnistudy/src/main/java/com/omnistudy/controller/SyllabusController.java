package com.omnistudy.controller;

import com.omnistudy.model.SyllabusDocument;
import com.omnistudy.repository.SyllabusRepository;
import com.omnistudy.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/syllabus")
@CrossOrigin(origins = "*")
public class SyllabusController {

    @Autowired
    private SyllabusRepository syllabusRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public List<SyllabusDocument> getAllSyllabi(@RequestParam(value = "userId", required = false) String userId) {
        if (userId != null && !userId.isEmpty()) {
            return syllabusRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return syllabusRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SyllabusDocument> getSyllabusById(@PathVariable Long id) {
        return syllabusRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/upload-and-analyze")
    public ResponseEntity<?> uploadAndAnalyze(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false, defaultValue = "guest_student") String userId,
            @RequestParam(value = "university", required = false, defaultValue = "SBTE Bihar") String university,
            @RequestParam(value = "course", required = false, defaultValue = "Diploma in Computer Science & Engineering") String course,
            @RequestParam(value = "branch", required = false, defaultValue = "Computer Science & Engineering") String branch,
            @RequestParam(value = "semester", required = false, defaultValue = "5th Semester") String semester,
            @RequestParam(value = "academicYear", required = false, defaultValue = "2024-2025") String academicYear,
            @RequestParam(value = "extractedText", required = false) String extractedText,
            @RequestParam(value = "pageCount", required = false, defaultValue = "1") Integer pageCount
    ) {
        if (file.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "No syllabus document attached");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            String storagePath = fileStorageService.storeSyllabusFile(file);
            String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "syllabus.pdf";

            String resolvedText = extractedText != null ? extractedText : "";
            if (resolvedText.trim().length() < 30) {
                // If scanned or no text
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("error", "Scanned or image-only PDF detected without selectable text. Please upload a digital text-based syllabus PDF.");
                err.put("isScanned", true);
                return ResponseEntity.status(422).body(err);
            }

            SyllabusDocument doc = new SyllabusDocument();
            doc.setUserId(userId);
            doc.setTitle(university + " " + branch + " (" + semester + ")");
            doc.setFileName(fileName);
            doc.setFileSize(file.getSize());
            doc.setPageCount(pageCount);
            doc.setUniversity(university);
            doc.setCourse(course);
            doc.setBranch(branch);
            doc.setSemester(semester);
            doc.setAcademicYear(academicYear);
            doc.setStoragePath(storagePath);
            doc.setExtractedText(resolvedText);
            doc.setCreatedAt(LocalDateTime.now());
            doc.setUpdatedAt(LocalDateTime.now());

            SyllabusDocument saved = syllabusRepository.save(doc);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Syllabus stored persistently");
            resp.put("syllabus", saved);

            return ResponseEntity.status(201).body(resp);
        } catch (IOException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to store syllabus file: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSyllabus(@PathVariable Long id) {
        return syllabusRepository.findById(id).map(doc -> {
            fileStorageService.deleteFile(doc.getStoragePath());
            syllabusRepository.delete(doc);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Syllabus removed successfully");
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }
}
