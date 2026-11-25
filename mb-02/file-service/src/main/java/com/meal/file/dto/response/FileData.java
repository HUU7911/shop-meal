package com.meal.file.dto.response;

import java.io.InputStream;

public record FileData(
        String contentType,
        InputStream resource
) {}
