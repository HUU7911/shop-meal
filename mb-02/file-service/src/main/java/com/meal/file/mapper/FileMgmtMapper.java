package com.meal.file.mapper;

import com.meal.file.dto.FileInfo;
import com.meal.file.entity.FileMgmt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FileMgmtMapper {

    @Mapping(target = "id", source = "name")
    FileMgmt toFileMgmt(FileInfo fileInfor);
}
