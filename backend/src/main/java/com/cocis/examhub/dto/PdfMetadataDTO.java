package com.cocis.examhub.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PdfMetadataDTO {

    private Long id;
    private String title;
    private String description;
    private String fileUrl;
    private Long fileSize;
    private String uploadedBy;
    private LocalDateTime uploadDate;
}
