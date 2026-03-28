package com.cocis.examhub.service;

import com.cocis.examhub.dto.PagedResponse;
import com.cocis.examhub.dto.PdfMetadataDTO;
import com.cocis.examhub.dto.PdfMetadataRequestDTO;
import com.cocis.examhub.entity.PdfMetadata;
import com.cocis.examhub.repository.PdfMetadataRepository;
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
public class PdfMetadataService {

    private final PdfMetadataRepository pdfMetadataRepository;

    @Transactional
    public PdfMetadataDTO createPdfMetadata(PdfMetadataRequestDTO request) {
        PdfMetadata pdfMetadata = PdfMetadata.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .fileUrl(request.getFileUrl())
                .fileSize(request.getFileSize())
                .uploadedBy(request.getUploadedBy())
                .build();

        PdfMetadata saved = pdfMetadataRepository.save(pdfMetadata);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<PdfMetadataDTO> getPdfMetadataPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadDate").descending());
        Page<PdfMetadata> pdfPage = pdfMetadataRepository.findAllByOrderByUploadDateDesc(pageable);

        List<PdfMetadataDTO> content = pdfPage.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return PagedResponse.<PdfMetadataDTO>builder()
                .content(content)
                .page(pdfPage.getNumber())
                .size(pdfPage.getSize())
                .totalElements(pdfPage.getTotalElements())
                .totalPages(pdfPage.getTotalPages())
                .last(pdfPage.isLast())
                .first(pdfPage.isFirst())
                .build();
    }

    @Transactional(readOnly = true)
    public List<PdfMetadataDTO> getAllPdfMetadata() {
        return pdfMetadataRepository.findAllByOrderByUploadDateDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PdfMetadataDTO getPdfMetadataById(Long id) {
        PdfMetadata pdfMetadata = pdfMetadataRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PDF metadata not found"));
        return mapToDTO(pdfMetadata);
    }

    private PdfMetadataDTO mapToDTO(PdfMetadata entity) {
        return PdfMetadataDTO.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .fileUrl(entity.getFileUrl())
                .fileSize(entity.getFileSize())
                .uploadedBy(entity.getUploadedBy())
                .uploadDate(entity.getUploadDate())
                .build();
    }
}
