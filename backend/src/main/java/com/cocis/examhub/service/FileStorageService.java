package com.cocis.examhub.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud_name:}")
    private String cloudName;

    @Value("${cloudinary.api_key:}")
    private String apiKey;

    @Value("${cloudinary.api_secret:}")
    private String apiSecret;

    @Value("${cloudinary.folder:examhub/pdfs}")
    private String cloudinaryFolder;

    public StoredFile storeFile(MultipartFile file) {
        validatePdf(file);

        String originalFileName = file.getOriginalFilename();

        try {
            @SuppressWarnings("rawtypes")
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "raw",
                            "folder", cloudinaryFolder,
                            "public_id", UUID.randomUUID().toString(),
                            "format", "pdf"
                    )
            );

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");

            return new StoredFile(secureUrl, publicId, originalFileName);
        } catch (IOException ex) {
            throw new RuntimeException("Could not upload file to Cloudinary", ex);
        }
    }

    public void deleteFile(String cloudinaryPublicId) {
        if (cloudinaryPublicId == null || cloudinaryPublicId.isBlank()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(
                    cloudinaryPublicId,
                    ObjectUtils.asMap("resource_type", "raw", "invalidate", true)
            );
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file from Cloudinary", ex);
        }
    }

    private void validatePdf(MultipartFile file) {
        if (cloudName.isBlank() || apiKey.isBlank() || apiSecret.isBlank()) {
            throw new IllegalStateException("Cloudinary credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
        }

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
