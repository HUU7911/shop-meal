package com.meal.payment.service;

import com.meal.payment.configuration.VietQrProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VietQrService {

    private final VietQrProperties vietQrProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    public String generatePaymentQr(long amount, String description) {
        Map<String, Object> body = new HashMap<>();
        body.put("accountNo", vietQrProperties.getAccountNumber());
        body.put("accountName", vietQrProperties.getAccountName());
        body.put("acqId", vietQrProperties.getBankBin());
        body.put("amount", amount);
        body.put("addInfo", description);
        body.put("template", "compact2");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        Map response = restTemplate.postForObject(vietQrProperties.getApiUrl(), request, Map.class);
        if (response == null || !"00".equals(String.valueOf(response.get("code")))) {
            throw new RuntimeException("Không tạo được QR thanh toán: " + response);
        }

        Map data = (Map) response.get("data");
        String qrDataURL = (String) data.get("qrDataURL");
        return qrDataURL.substring(qrDataURL.indexOf(",") + 1);
    }
}