package com.omnistudy.controller;

import com.omnistudy.model.PdfDocument;
import com.omnistudy.repository.PdfRepository;
import com.omnistudy.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pdfs")
@CrossOrigin(origins = "*")
public class PdfController {

    @Autowired
    private PdfRepository pdfRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public List<PdfDocument> getAllPdfs(@RequestParam(value = "userId", required = false) String userId) {
        if (userId != null && !userId.isEmpty()) {
            return pdfRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return pdfRepository.findAllByOrderByCreatedAtDesc();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false, defaultValue = "guest_student") String userId,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "subject", required = false, defaultValue = "General") String subject,
            @RequestParam(value = "extractedText", required = false) String extractedText,
            @RequestParam(value = "pageCount", required = false, defaultValue = "1") Integer pageCount
    ) {
        if (file.isEmpty()) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "No file attached to upload request");
            return ResponseEntity.badRequest().body(err);
        }

        try {
            String storagePath = fileStorageService.storePdfFile(file);
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null) originalFileName = "document.pdf";

            String resolvedTitle = title != null && !title.trim().isEmpty()
                    ? title.trim()
                    : originalFileName.replaceFirst("\\.[^.]+$", "").replace("_", " ");

            PdfDocument doc = new PdfDocument();
            doc.setUserId(userId);
            doc.setTitle(resolvedTitle);
            doc.setFileName(originalFileName);
            doc.setFileSize(file.getSize());
            doc.setPageCount(pageCount);
            doc.setSubject(subject);
            doc.setStoragePath(storagePath);
            doc.setExtractedText(extractedText != null ? extractedText : "");
            doc.setCreatedAt(LocalDateTime.now());
            doc.setUpdatedAt(LocalDateTime.now());

            PdfDocument saved = pdfRepository.save(doc);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "PDF stored persistently");
            resp.put("pdf", saved);

            return ResponseEntity.status(201).body(resp);
        } catch (IOException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to store PDF file: " + e.getMessage());
            return ResponseEntity.status(500).body(err);
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadPdf(@PathVariable Long id) {
        return pdfRepository.findById(id).map(doc -> {
            if (doc.getStoragePath() == null) {
                return ResponseEntity.notFound().<Resource>build();
            }
            File file = new File(doc.getStoragePath());
            if (!file.exists()) {
                return ResponseEntity.notFound().<Resource>build();
            }

            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                    .body(resource);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePdf(@PathVariable Long id) {
        return pdfRepository.findById(id).map(doc -> {
            fileStorageService.deleteFile(doc.getStoragePath());
            pdfRepository.delete(doc);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "PDF deleted successfully");
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }
}
