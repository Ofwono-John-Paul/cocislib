package com.cocis.examhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseUnitRequestDTO {
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    @NotBlank(message = "Course unit name is required")
    private String name;
    
    @NotBlank(message = "Course unit code is required")
    private String code;
    
    @NotNull(message = "Year is required")
    private Integer year;
    
    @NotNull(message = "Semester is required")
    private Integer semester;
}
