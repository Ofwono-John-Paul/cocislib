package com.cocis.examhub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "exam_papers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamPaper {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "exam_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ExamType examType;
    
    @Column(name = "academic_year", nullable = false)
    private String academicYear;
    
    @Column(name = "file_url", nullable = false)
    private String fileUrl;
    
    @Column(name = "file_name")
    private String fileName;

    @Column(name = "cloudinary_public_id")
    private String cloudinaryPublicId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_unit_id", nullable = false)
    private CourseUnit courseUnit;
    
    public enum ExamType {
        MIDTERM,
        FINAL
    }
}
