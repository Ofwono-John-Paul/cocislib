package com.cocis.examhub.service;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private static final String UPLOAD_DIR = "uploads";

    public StoredFile storeFile(MultipartFile file) {
        validatePdf(file);

        String originalFileName = file.getOriginalFilename();
        String storedFileName = UUID.randomUUID() + ".pdf";
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        Path destination = uploadPath.resolve(storedFileName);

        try {
            Files.createDirectories(uploadPath);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return new StoredFile("/uploads/" + storedFileName, storedFileName, originalFileName);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file locally", ex);
        }
    }

    public void deleteFile(String storedFileName) {
        if (storedFileName == null || storedFileName.isBlank()) {
            return;
        }

        try {
            Path filePath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize().resolve(storedFileName);
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete local file", ex);
        }
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("PDF file is required");
        }

        String originalFileName = file.getOriginalFilename();
        boolean isPdfByName = originalFileName != null && originalFileName.toLowerCase().endsWith(".pdf");
        boolean isPdfByContentType = "application/pdf".equalsIgnoreCase(file.getContentType());

        if (!isPdfByName && !isPdfByContentType) {
            throw new IllegalArgumentException("Only PDF uploads are allowed");
        }
    }

    @Getter
    @AllArgsConstructor
    public static class StoredFile {
        private String url;
        private String publicId;
        private String originalFileName;
    }
}
