package com.cocis.examhub.service;

import com.cocis.examhub.dto.ExamPaperDTO;
import com.cocis.examhub.dto.ExamPaperRequestDTO;
import com.cocis.examhub.dto.PagedResponse;
import com.cocis.examhub.entity.CourseUnit;
import com.cocis.examhub.entity.ExamPaper;
import com.cocis.examhub.repository.CourseUnitRepository;
import com.cocis.examhub.repository.ExamPaperRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamPaperService {
    
    private final ExamPaperRepository examPaperRepository;
    private final CourseUnitRepository courseUnitRepository;
    private final FileStorageService fileStorageService;
    
    @Transactional(readOnly = true)
    public PagedResponse<ExamPaperDTO> getExamPapers(
            Long courseId,
            Integer year,
            Integer semester,
            String examType,
            String academicYear,
            String courseUnitName,
            int page,
            int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        
        ExamPaper.ExamType examTypeEnum = null;
        if (examType != null && !examType.isEmpty()) {
            try {
                examTypeEnum = ExamPaper.ExamType.valueOf(examType.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Invalid exam type, ignore
            }
        }
        
        Page<ExamPaper> examPaperPage = examPaperRepository.findByFilters(
                courseId, year, semester, examTypeEnum, academicYear, courseUnitName, pageable);
        
        List<ExamPaperDTO> content = examPaperPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        
        return PagedResponse.<ExamPaperDTO>builder()
                .content(content)
                .page(examPaperPage.getNumber())
                .size(examPaperPage.getSize())
                .totalElements(examPaperPage.getTotalElements())
                .totalPages(examPaperPage.getTotalPages())
                .last(examPaperPage.isLast())
                .first(examPaperPage.isFirst())
                .build();
    }
    
    @Transactional
    public ExamPaperDTO uploadExamPaper(ExamPaperRequestDTO request) {
        CourseUnit courseUnit = courseUnitRepository.findById(request.getCourseUnitId())
                .orElseThrow(() -> new RuntimeException("Course unit not found"));

        FileStorageService.StoredFile storedFile = fileStorageService.storeFile(request.getFile());
        
        ExamPaper examPaper = ExamPaper.builder()
                .courseUnit(courseUnit)
                .examType(request.getExamType())
                .academicYear(request.getAcademicYear())
            .fileUrl(storedFile.getUrl())
            .fileName(storedFile.getOriginalFileName())
            .cloudinaryPublicId(storedFile.getPublicId())
                .build();
        
        ExamPaper saved = examPaperRepository.save(examPaper);
        return mapToDTO(saved);
    }
    
    @Transactional
    public void deleteExamPaper(Long id) {
        ExamPaper examPaper = examPaperRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam paper not found"));

        fileStorageService.deleteFile(examPaper.getCloudinaryPublicId());
        examPaperRepository.delete(examPaper);
    }
    
    @Transactional(readOnly = true)
    public List<String> getAcademicYears(Long courseId) {
        return examPaperRepository.findDistinctAcademicYearsByCourseId(courseId);
    }
    
    private ExamPaperDTO mapToDTO(ExamPaper examPaper) {
        return ExamPaperDTO.builder()
                .id(examPaper.getId())
                .examType(examPaper.getExamType())
                .academicYear(examPaper.getAcademicYear())
                .fileUrl(examPaper.getFileUrl())
                .fileName(examPaper.getFileName())
                .courseUnitId(examPaper.getCourseUnit().getId())
                .courseUnitName(examPaper.getCourseUnit().getName())
                .courseUnitCode(examPaper.getCourseUnit().getCode())
                .courseUnitYear(examPaper.getCourseUnit().getYear())
                .courseUnitSemester(examPaper.getCourseUnit().getSemester())
                .build();
    }
}
