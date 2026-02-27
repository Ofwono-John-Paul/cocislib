package com.cocis.examhub.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseUnitDTO {
    private Long id;
    private String name;
    private String code;
    private Integer year;
    private Integer semester;
    private Long courseId;
    private String courseName;
}
