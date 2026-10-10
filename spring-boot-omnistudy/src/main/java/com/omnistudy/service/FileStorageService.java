package com.omnistudy.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path pdfStorageDir = Paths.get("uploads", "pdfs").toAbsolutePath().normalize();
    private final Path syllabusStorageDir = Paths.get("uploads", "syllabi").toAbsolutePath().normalize();

    public FileStorageService() {
        try {
            Files.createDirectories(pdfStorageDir);
            Files.createDirectories(syllabusStorageDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create directory for uploads", e);
        }
    }

    public String storePdfFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "document.pdf";
        }
        String safeName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFilename = UUID.randomUUID().toString() + "_" + safeName;
        Path targetLocation = this.pdfStorageDir.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return targetLocation.toString();
    }

    public String storeSyllabusFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "syllabus.pdf";
        }
        String safeName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueFilename = UUID.randomUUID().toString() + "_" + safeName;
        Path targetLocation = this.syllabusStorageDir.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        return targetLocation.toString();
    }

    public void deleteFile(String storagePath) {
        if (storagePath != null) {
            File f = new File(storagePath);
            if (f.exists()) {
                f.delete();
            }
        }
    }
}
