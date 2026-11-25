package com.meal.file.service;

import com.meal.file.dto.response.FileData;
import com.meal.file.dto.response.FileResponse;
import com.meal.file.exception.AppException;
import com.meal.file.exception.ErrorCode;
import com.meal.file.mapper.FileMgmtMapper;
import com.meal.file.repository.FileMgmtRepository;
import com.meal.file.repository.FileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileService {

    FileRepository fileRepository;
    FileMgmtRepository fileMgmtRepository;
    FileMgmtMapper fileMgmtMapper;

    public FileResponse uploadFile(MultipartFile file) throws Exception {
        var fileInfo = fileRepository.store(file);

        var fileMgmt = fileMgmtMapper.toFileMgmt(fileInfo);
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        fileMgmt.setOwnerId(userId);

        fileMgmt = fileMgmtRepository.save(fileMgmt);

        return FileResponse.builder()
                .originalFileName(file.getOriginalFilename())
                .url(fileInfo.getUrl())
                .build();
    }

    public FileData download(String fileId) throws Exception {
        var fileMgmt = fileMgmtRepository.findById(fileId)
                .orElseThrow(() -> new AppException(ErrorCode.FILE_NOT_FOUND));

        InputStream resource = fileRepository.read(fileMgmt.getPath());

        return new FileData(fileMgmt.getContentType(), resource);
    }
}
