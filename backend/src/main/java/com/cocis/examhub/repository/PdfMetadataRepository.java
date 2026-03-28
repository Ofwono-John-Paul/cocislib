package com.cocis.examhub.repository;

import com.cocis.examhub.entity.PdfMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PdfMetadataRepository extends JpaRepository<PdfMetadata, Long> {

    Page<PdfMetadata> findAllByOrderByUploadDateDesc(Pageable pageable);

    List<PdfMetadata> findAllByOrderByUploadDateDesc();
}
