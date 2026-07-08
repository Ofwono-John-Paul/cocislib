package com.cocis.examhub.controller;

import com.cocis.examhub.dto.PagedResponse;
import com.cocis.examhub.dto.PdfMetadataDTO;
import com.cocis.examhub.dto.PdfMetadataRequestDTO;
import com.cocis.examhub.service.PdfMetadataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pdfs")
@RequiredArgsConstructor
public class PdfMetadataController {

    private final PdfMetadataService pdfMetadataService;

    @PostMapping
    public ResponseEntity<PdfMetadataDTO> uploadPdfMetadata(@Valid @RequestBody PdfMetadataRequestDTO request) {
        PdfMetadataDTO created = pdfMetadataService.createPdfMetadata(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<PdfMetadataDTO>> getPdfMetadataPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(pdfMetadataService.getPdfMetadataPage(page, size));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PdfMetadataDTO>> getAllPdfMetadata() {
        return ResponseEntity.ok(pdfMetadataService.getAllPdfMetadata());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PdfMetadataDTO> getPdfMetadataById(@PathVariable Long id) {
        return ResponseEntity.ok(pdfMetadataService.getPdfMetadataById(id));
    }
}
