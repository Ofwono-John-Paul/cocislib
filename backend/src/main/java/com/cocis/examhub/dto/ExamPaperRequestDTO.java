package com.cocis.examhub.dto;

import com.cocis.examhub.entity.ExamPaper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamPaperRequestDTO {
    
    @NotNull(message = "Course unit ID is required")
    private Long courseUnitId;
    
    @NotNull(message = "Exam type is required")
    private ExamPaper.ExamType examType;
    
    @NotBlank(message = "Academic year is required")
    private String academicYear;
    
    private MultipartFile file;
}
