package com.hallbooking.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // In-memory storage for development
    // Key: phoneNumber, Value: OTP data
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    public String generateOtp(String phoneNumber) {
        // For development: generate a random 4-digit OTP
        String otp = String.format("%04d", (int) (Math.random() * 10000));

        // Store OTP with expiry time (5 minutes)
        OtpData otpData = new OtpData(otp, LocalDateTime.now().plusMinutes(5));
        otpStorage.put(phoneNumber, otpData);

        // In production, you would send this OTP via SMS service
        System.out.println("OTP for " + phoneNumber + ": " + otp);

        return otp;
    }

    public boolean verifyOtp(String phoneNumber, String otp) {
        // For development: accept any 4-digit number as valid
        if (otp != null && otp.matches("^[0-9]{4}$")) {
            // Clear the OTP after verification
            otpStorage.remove(phoneNumber);
            return true;
        }

        /* Production logic (commented out for development):
        OtpData otpData = otpStorage.get(phoneNumber);

        if (otpData == null) {
            return false;
        }

        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(otpData.getExpiryTime())) {
            otpStorage.remove(phoneNumber);
            return false;
        }

        // Check if OTP matches
        if (otpData.getOtp().equals(otp)) {
            otpStorage.remove(phoneNumber);
            return true;
        }
        */

        return false;
    }

    public void clearOtp(String phoneNumber) {
        otpStorage.remove(phoneNumber);
    }

    // Inner class to store OTP with expiry
    private static class OtpData {
        private final String otp;
        private final LocalDateTime expiryTime;

        public OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }

        public String getOtp() {
            return otp;
        }

        public LocalDateTime getExpiryTime() {
            return expiryTime;
        }
    }
}
