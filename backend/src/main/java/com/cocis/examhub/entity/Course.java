package com.cocis.examhub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(name = "slug", nullable = false, unique = true)
    private String slug;
    
    @Column(name = "duration_years", nullable = false)
    private Integer durationYears;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CourseUnit> courseUnits = null;
}
