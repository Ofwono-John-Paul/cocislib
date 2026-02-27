package com.cocis.examhub.dto;

import com.cocis.examhub.entity.ExamPaper;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamPaperDTO {
    private Long id;
    private ExamPaper.ExamType examType;
    private String academicYear;
    private String fileUrl;
    private String fileName;
    private Long courseUnitId;
    private String courseUnitName;
    private String courseUnitCode;
    private Integer courseUnitYear;
    private Integer courseUnitSemester;
}
