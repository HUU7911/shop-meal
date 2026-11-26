package com.meal.file.service;

import org.springframework.stereotype.Component;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Iterator;

@Component
public class ImageConverter {

    public byte[] convertToWebP(InputStream input) throws Exception {
        BufferedImage image = ImageIO.read(input);

        if (image == null) {
            throw new IllegalArgumentException("Invalid image file");
        }

        Iterator<ImageWriter> writers = ImageIO.getImageWritersByMIMEType("image/webp");

        if (!writers.hasNext()) {
            throw new IllegalStateException("WebP writer not found");
        }

        ImageWriter writer = writers.next();

        try (ByteArrayOutputStream output = new ByteArrayOutputStream();
             ImageOutputStream imageOutput = ImageIO.createImageOutputStream(output)) {

            writer.setOutput(imageOutput);
            writer.write(image);

            imageOutput.flush();
            return output.toByteArray();

        } finally {
            writer.dispose();
        }
    }
}
