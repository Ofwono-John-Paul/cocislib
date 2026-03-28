package com.cocis.examhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PdfMetadataRequestDTO {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotBlank(message = "File URL is required")
    @Size(max = 2048, message = "File URL must not exceed 2048 characters")
    private String fileUrl;

    @NotNull(message = "File size is required")
    @Positive(message = "File size must be greater than zero")
    private Long fileSize;

    @NotBlank(message = "Uploaded by is required")
    @Size(max = 100, message = "Uploaded by must not exceed 100 characters")
    private String uploadedBy;
}
