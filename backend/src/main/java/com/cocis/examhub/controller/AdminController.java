package com.cocis.examhub.controller;

import com.cocis.examhub.dto.CourseUnitDTO;
import com.cocis.examhub.dto.CourseUnitRequestDTO;
import com.cocis.examhub.dto.ExamPaperDTO;
import com.cocis.examhub.dto.ExamPaperRequestDTO;
import com.cocis.examhub.entity.ExamPaper;
import com.cocis.examhub.service.CourseService;
import com.cocis.examhub.service.ExamPaperService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final CourseService courseService;
    private final ExamPaperService examPaperService;

    // Course Unit Admin Endpoints
    
    @PostMapping("/course-units")
    public ResponseEntity<CourseUnitDTO> createCourseUnit(@RequestBody CourseUnitRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(courseService.createCourseUnit(request));
    }

    @PutMapping("/course-units/{id}")
    public ResponseEntity<CourseUnitDTO> updateCourseUnit(
            @PathVariable Long id, 
            @RequestBody CourseUnitRequestDTO request) {
        return ResponseEntity.ok(courseService.updateCourseUnit(id, request));
    }

    @DeleteMapping("/course-units/{id}")
    public ResponseEntity<Void> deleteCourseUnit(@PathVariable Long id) {
        courseService.deleteCourseUnit(id);
        return ResponseEntity.noContent().build();
    }

    // Exam Paper Admin Endpoints

    @PostMapping("/exams")
    public ResponseEntity<ExamPaperDTO> uploadExamPaper(
            @RequestParam Long courseUnitId,
            @RequestParam String examType,
            @RequestParam String academicYear,
            @RequestParam MultipartFile file) {
        
        ExamPaperRequestDTO request = ExamPaperRequestDTO.builder()
                .courseUnitId(courseUnitId)
                .examType(ExamPaper.ExamType.valueOf(examType.toUpperCase()))
                .academicYear(academicYear)
                .file(file)
                .build();
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(examPaperService.uploadExamPaper(request));
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<Void> deleteExamPaper(@PathVariable Long id) {
        examPaperService.deleteExamPaper(id);
        return ResponseEntity.noContent().build();
    }
}
