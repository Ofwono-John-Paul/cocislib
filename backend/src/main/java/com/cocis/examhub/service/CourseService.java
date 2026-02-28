package com.cocis.examhub.service;

import com.cocis.examhub.dto.CourseDTO;
import com.cocis.examhub.dto.CourseUnitDTO;
import com.cocis.examhub.dto.CourseUnitRequestDTO;
import com.cocis.examhub.entity.Course;
import com.cocis.examhub.entity.CourseUnit;
import com.cocis.examhub.repository.CourseRepository;
import com.cocis.examhub.repository.CourseUnitRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    
    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;
    
    @PostConstruct
    @Transactional
    public void initCourses() {
        if (courseRepository.count() == 0) {
            // Computer Science - 3 years
            Course cs = Course.builder()
                    .name("Computer Science")
                    .slug("computer-science")
                    .durationYears(3)
                    .description("Bachelor of Science in Computer Science - 3 Year Program")
                    .build();
            courseRepository.save(cs);
            
            // Software Engineering - 4 years
            Course se = Course.builder()
                    .name("Software Engineering")
                    .slug("software-engineering")
                    .durationYears(4)
                    .description("Bachelor of Science in Software Engineering - 4 Year Program")
                    .build();
            courseRepository.save(se);
            
            // BLIS - 3 years
            Course blis = Course.builder()
                    .name("Bachelor of Library and Information Science")
                    .slug("blis")
                    .durationYears(3)
                    .description("Bachelor of Library and Information Science - 3 Year Program")
                    .build();
            courseRepository.save(blis);
            
            // BIST - 3 years
            Course bist = Course.builder()
                    .name("Bachelor of Information Systems and Technology")
                    .slug("bist")
                    .durationYears(3)
                    .description("Bachelor of Information Systems and Technology - 3 Year Program")
                    .build();
            courseRepository.save(bist);
            
            // Add sample course units for Computer Science
            addSampleCourseUnits(cs.getId());
        }
    }
    
    private void addSampleCourseUnits(Long courseId) {
        // Year 1, Semester 1
        courseUnitRepository.save(CourseUnit.builder()
                .name("Introduction to Programming")
                .code("CS101")
                .year(1)
                .semester(1)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        courseUnitRepository.save(CourseUnit.builder()
                .name("Mathematics I")
                .code("CS102")
                .year(1)
                .semester(1)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        // Year 1, Semester 2
        courseUnitRepository.save(CourseUnit.builder()
                .name("Data Structures")
                .code("CS103")
                .year(1)
                .semester(2)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        courseUnitRepository.save(CourseUnit.builder()
                .name("Mathematics II")
                .code("CS104")
                .year(1)
                .semester(2)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        // Year 2, Semester 1
        courseUnitRepository.save(CourseUnit.builder()
                .name("Algorithms")
                .code("CS201")
                .year(2)
                .semester(1)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        courseUnitRepository.save(CourseUnit.builder()
                .name("Database Systems")
                .code("CS202")
                .year(2)
                .semester(1)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        // Year 2, Semester 2
        courseUnitRepository.save(CourseUnit.builder()
                .name("Operating Systems")
                .code("CS203")
                .year(2)
                .semester(2)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        courseUnitRepository.save(CourseUnit.builder()
                .name("Computer Networks")
                .code("CS204")
                .year(2)
                .semester(2)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        // Year 3, Semester 1
        courseUnitRepository.save(CourseUnit.builder()
                .name("Software Engineering")
                .code("CS301")
                .year(3)
                .semester(1)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        courseUnitRepository.save(CourseUnit.builder()
                .name("Artificial Intelligence")
                .code("CS302")
                .year(3)
                .semester(1)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
        
        // Year 3, Semester 2
        courseUnitRepository.save(CourseUnit.builder()
                .name("Project")
                .code("CS303")
                .year(3)
                .semester(2)
                .course(courseRepository.findById(courseId).orElse(null))
                .build());
    }
    
    @Transactional(readOnly = true)
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return mapToDTO(course);
    }
    
    @Transactional(readOnly = true)
    public CourseDTO getCourseBySlug(String slug) {
        Course course = courseRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return mapToDTO(course);
    }
    
    @Transactional(readOnly = true)
    public List<CourseUnitDTO> getCourseUnitsByCourseId(Long courseId) {
        return courseUnitRepository.findByCourseId(courseId).stream()
                .map(this::mapUnitToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<Integer> getYearsByCourseId(Long courseId) {
        return courseUnitRepository.findDistinctYearsByCourseId(courseId);
    }
    
    @Transactional(readOnly = true)
    public List<Integer> getSemestersByCourseIdAndYear(Long courseId, Integer year) {
        return courseUnitRepository.findDistinctSemestersByCourseIdAndYear(courseId, year);
    }
    
    // Course Unit CRUD Operations
    
    @Transactional
    public CourseUnitDTO createCourseUnit(CourseUnitRequestDTO request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        CourseUnit courseUnit = CourseUnit.builder()
                .name(request.getName())
                .code(request.getCode())
                .year(request.getYear())
                .semester(request.getSemester())
                .course(course)
                .build();
        
        CourseUnit saved = courseUnitRepository.save(courseUnit);
        return mapUnitToDTO(saved);
    }
    
    @Transactional
    public CourseUnitDTO updateCourseUnit(Long id, CourseUnitRequestDTO request) {
        CourseUnit courseUnit = courseUnitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course unit not found"));
        
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        courseUnit.setName(request.getName());
        courseUnit.setCode(request.getCode());
        courseUnit.setYear(request.getYear());
        courseUnit.setSemester(request.getSemester());
        courseUnit.setCourse(course);
        
        CourseUnit updated = courseUnitRepository.save(courseUnit);
        return mapUnitToDTO(updated);
    }
    
    @Transactional
    public void deleteCourseUnit(Long id) {
        CourseUnit courseUnit = courseUnitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course unit not found"));
        courseUnitRepository.delete(courseUnit);
    }
    
    @Transactional(readOnly = true)
    public CourseUnitDTO getCourseUnitById(Long id) {
        CourseUnit courseUnit = courseUnitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course unit not found"));
        return mapUnitToDTO(courseUnit);
    }
    
    private CourseDTO mapToDTO(Course course) {
        return CourseDTO.builder()
                .id(course.getId())
                .name(course.getName())
                .slug(course.getSlug())
                .durationYears(course.getDurationYears())
                .description(course.getDescription())
                .build();
    }
    
    private CourseUnitDTO mapUnitToDTO(CourseUnit courseUnit) {
        return CourseUnitDTO.builder()
                .id(courseUnit.getId())
                .name(courseUnit.getName())
                .code(courseUnit.getCode())
                .year(courseUnit.getYear())
                .semester(courseUnit.getSemester())
                .courseId(courseUnit.getCourse().getId())
                .courseName(courseUnit.getCourse().getName())
                .build();
    }
}
