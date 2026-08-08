package com.hallbooking.service;

import com.hallbooking.model.Vendor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.Base64;

@Service
public class VendorService {

    @Autowired
    private MongoTemplate mongoTemplate;

    public Vendor createVendor(Vendor vendor) {
        if (vendor == null) {
            throw new IllegalArgumentException("Vendor payload is required");
        }
        if (vendor.getEmailId() == null || vendor.getEmailId().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (vendor.getVendorId() == null || vendor.getVendorId().trim().isEmpty()) {
            vendor.setVendorId("VND-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        if (vendor.getCreatedOn() == null) {
            vendor.setCreatedOn(new Date());
        }
        if (vendor.getLastModifiedDate() == null) {
            vendor.setLastModifiedDate(new Date());
        }
        if (vendor.getStatus() == null || vendor.getStatus().trim().isEmpty()) {
            vendor.setStatus("PENDING");
        }
        return mongoTemplate.save(vendor);
    }

    public Vendor updateVendor(String vendorId, Vendor vendor) {
        Vendor existing = getVendorById(vendorId);
        if (existing == null) {
            throw new IllegalArgumentException("Vendor not found");
        }
        if (vendor == null) {
            throw new IllegalArgumentException("Vendor payload is required");
        }

        if (vendor.getPassword() != null) {
            existing.setPassword(vendor.getPassword());
        }
        if (vendor.getStatus() != null) {
            existing.setStatus(vendor.getStatus());
        }
        if (vendor.getEmailId() != null) {
            existing.setEmailId(vendor.getEmailId());
        }
        if (vendor.getEmail() != null) {
            existing.setEmail(vendor.getEmail());
        }
        if (vendor.getBusinessName() != null) {
            existing.setBusinessName(vendor.getBusinessName());
        }
        if (vendor.getOwnerName() != null) {
            existing.setOwnerName(vendor.getOwnerName());
        }
        if (vendor.getPhone() != null) {
            existing.setPhone(vendor.getPhone());
        }
        if (vendor.getAddress() != null) {
            existing.setAddress(vendor.getAddress());
        }
        if (vendor.getCity() != null) {
            existing.setCity(vendor.getCity());
        }
        if (vendor.getState() != null) {
            existing.setState(vendor.getState());
        }
        if (vendor.getPincode() != null) {
            existing.setPincode(vendor.getPincode());
        }
        if (vendor.getLogo() != null) {
            existing.setLogo(vendor.getLogo());
        }
        if (vendor.getAccountHolder() != null) {
            existing.setAccountHolder(vendor.getAccountHolder());
        }
        if (vendor.getBankName() != null) {
            existing.setBankName(vendor.getBankName());
        }
        if (vendor.getAccountNumber() != null) {
            existing.setAccountNumber(vendor.getAccountNumber());
        }
        if (vendor.getIfsc() != null) {
            existing.setIfsc(vendor.getIfsc());
        }
        if (vendor.getUpiId() != null) {
            existing.setUpiId(vendor.getUpiId());
        }
        if (vendor.getGstNumber() != null) {
            existing.setGstNumber(vendor.getGstNumber());
        }
        if (vendor.getPanNumber() != null) {
            existing.setPanNumber(vendor.getPanNumber());
        }
        if (vendor.getBusinessLicense() != null) {
            existing.setBusinessLicense(vendor.getBusinessLicense());
        }
        if (vendor.getVerificationStatus() != null) {
            existing.setVerificationStatus(vendor.getVerificationStatus());
        }
        if (vendor.getEmailNotifications() != null) {
            existing.setEmailNotifications(vendor.getEmailNotifications());
        }
        if (vendor.getSmsNotifications() != null) {
            existing.setSmsNotifications(vendor.getSmsNotifications());
        }
        if (vendor.getBookingAlerts() != null) {
            existing.setBookingAlerts(vendor.getBookingAlerts());
        }
        if (vendor.getReviewAlerts() != null) {
            existing.setReviewAlerts(vendor.getReviewAlerts());
        }
        if (vendor.getPaymentAlerts() != null) {
            existing.setPaymentAlerts(vendor.getPaymentAlerts());
        }
        if (vendor.getMarketingEmails() != null) {
            existing.setMarketingEmails(vendor.getMarketingEmails());
        }
        if (vendor.getSubscriptionPlan() != null) {
            existing.setSubscriptionPlan(vendor.getSubscriptionPlan());
        }
        if (vendor.getSubscriptionStartDate() != null) {
            existing.setSubscriptionStartDate(vendor.getSubscriptionStartDate());
        }
        if (vendor.getSubscriptionEndDate() != null) {
            existing.setSubscriptionEndDate(vendor.getSubscriptionEndDate());
        }
        if (vendor.getRenewalReminder() != null) {
            existing.setRenewalReminder(vendor.getRenewalReminder());
        }
        if (vendor.getAutoRenewal() != null) {
            existing.setAutoRenewal(vendor.getAutoRenewal());
        }
        if (vendor.getReminderDaysBeforeExpiry() != null) {
            existing.setReminderDaysBeforeExpiry(vendor.getReminderDaysBeforeExpiry());
        }
        if (vendor.getDetails() != null) {
            existing.setDetails(vendor.getDetails());
        }
        existing.setLastModifiedDate(new Date());
        existing.setLastModifiedUser(vendor.getLastModifiedUser());
        return mongoTemplate.save(existing);
    }

    public boolean deleteVendor(String vendorId) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            return false;
        }
        vendor.setStatus("DELETED");
        mongoTemplate.save(vendor);
        return true;
    }

    public List<Vendor> getAllAvailableVendors() {
        Query query = new Query();
        query.addCriteria(new Criteria().orOperator(
                Criteria.where("status").exists(false),
                Criteria.where("status").nin("INACTIVE", "REJECTED", "DELETED")
        ));
        return mongoTemplate.find(query, Vendor.class);
    }

    public Vendor getVendorById(String vendorId) {
        if (vendorId == null || vendorId.trim().isEmpty()) {
            return null;
        }

        Query query = new Query();
        query.addCriteria(new Criteria().orOperator(
                Criteria.where("vendorId").is(vendorId.trim()),
                Criteria.where("_id").is(vendorId.trim())
        ));
        return mongoTemplate.findOne(query, Vendor.class);
    }

    public Map<String, Object> getVendorBankingDetails(String vendorId) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            return null;
        }

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("accountHolder", vendor.getAccountHolder());
        details.put("bankName", vendor.getBankName());
        details.put("accountNumber", vendor.getAccountNumber());
        details.put("ifsc", vendor.getIfsc());
        details.put("upiId", vendor.getUpiId());
        return details;
    }

    public Vendor updateVendorBankingDetails(String vendorId, Map<String, Object> bankingDetails) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            throw new IllegalArgumentException("Vendor not found");
        }
        if (bankingDetails == null) {
            throw new IllegalArgumentException("Banking details payload is required");
        }
        if (bankingDetails.get("accountHolder") != null) {
            vendor.setAccountHolder(String.valueOf(bankingDetails.get("accountHolder")));
        }
        if (bankingDetails.get("bankName") != null) {
            vendor.setBankName(String.valueOf(bankingDetails.get("bankName")));
        }
        if (bankingDetails.get("accountNumber") != null) {
            vendor.setAccountNumber(String.valueOf(bankingDetails.get("accountNumber")));
        }
        if (bankingDetails.get("ifsc") != null) {
            vendor.setIfsc(String.valueOf(bankingDetails.get("ifsc")));
        }
        if (bankingDetails.get("upiId") != null) {
            vendor.setUpiId(String.valueOf(bankingDetails.get("upiId")));
        }
        vendor.setLastModifiedDate(new Date());
        return mongoTemplate.save(vendor);
    }

    public Map<String, Object> getVendorNotificationSettings(String vendorId) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            return null;
        }

        Map<String, Object> settings = new LinkedHashMap<>();
        settings.put("emailNotifications", vendor.getEmailNotifications());
        settings.put("smsNotifications", vendor.getSmsNotifications());
        settings.put("bookingAlerts", vendor.getBookingAlerts());
        settings.put("reviewAlerts", vendor.getReviewAlerts());
        settings.put("paymentAlerts", vendor.getPaymentAlerts());
        settings.put("marketingEmails", vendor.getMarketingEmails());
        return settings;
    }

    public Vendor updateVendorNotificationSettings(String vendorId, Map<String, Object> notificationSettings) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            throw new IllegalArgumentException("Vendor not found");
        }
        if (notificationSettings == null) {
            throw new IllegalArgumentException("Notification settings payload is required");
        }
        if (notificationSettings.get("emailNotifications") != null) {
            vendor.setEmailNotifications(Boolean.parseBoolean(String.valueOf(notificationSettings.get("emailNotifications"))));
        }
        if (notificationSettings.get("smsNotifications") != null) {
            vendor.setSmsNotifications(Boolean.parseBoolean(String.valueOf(notificationSettings.get("smsNotifications"))));
        }
        if (notificationSettings.get("bookingAlerts") != null) {
            vendor.setBookingAlerts(Boolean.parseBoolean(String.valueOf(notificationSettings.get("bookingAlerts"))));
        }
        if (notificationSettings.get("reviewAlerts") != null) {
            vendor.setReviewAlerts(Boolean.parseBoolean(String.valueOf(notificationSettings.get("reviewAlerts"))));
        }
        if (notificationSettings.get("paymentAlerts") != null) {
            vendor.setPaymentAlerts(Boolean.parseBoolean(String.valueOf(notificationSettings.get("paymentAlerts"))));
        }
        if (notificationSettings.get("marketingEmails") != null) {
            vendor.setMarketingEmails(Boolean.parseBoolean(String.valueOf(notificationSettings.get("marketingEmails"))));
        }
        vendor.setLastModifiedDate(new Date());
        return mongoTemplate.save(vendor);
    }

    public Map<String, Object> getVendorSubscriptionDetails(String vendorId) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            return null;
        }

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("subscriptionPlan", vendor.getSubscriptionPlan());
        details.put("subscriptionStartDate", vendor.getSubscriptionStartDate());
        details.put("subscriptionEndDate", vendor.getSubscriptionEndDate());
        details.put("renewalReminder", vendor.getRenewalReminder());
        details.put("autoRenewal", vendor.getAutoRenewal());
        details.put("reminderDaysBeforeExpiry", vendor.getReminderDaysBeforeExpiry());
        return details;
    }

    public Vendor updateVendorSubscriptionDetails(String vendorId, Map<String, Object> subscriptionDetails) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            throw new IllegalArgumentException("Vendor not found");
        }
        if (subscriptionDetails == null) {
            throw new IllegalArgumentException("Subscription details payload is required");
        }
        if (subscriptionDetails.get("subscriptionPlan") != null) {
            vendor.setSubscriptionPlan(String.valueOf(subscriptionDetails.get("subscriptionPlan")));
        }
        if (subscriptionDetails.get("subscriptionStartDate") != null) {
            vendor.setSubscriptionStartDate(new Date(String.valueOf(subscriptionDetails.get("subscriptionStartDate"))));
        }
        if (subscriptionDetails.get("subscriptionEndDate") != null) {
            vendor.setSubscriptionEndDate(new Date(String.valueOf(subscriptionDetails.get("subscriptionEndDate"))));
        }
        if (subscriptionDetails.get("renewalReminder") != null) {
            vendor.setRenewalReminder(Boolean.parseBoolean(String.valueOf(subscriptionDetails.get("renewalReminder"))));
        }
        if (subscriptionDetails.get("autoRenewal") != null) {
            vendor.setAutoRenewal(Boolean.parseBoolean(String.valueOf(subscriptionDetails.get("autoRenewal"))));
        }
        if (subscriptionDetails.get("reminderDaysBeforeExpiry") != null) {
            vendor.setReminderDaysBeforeExpiry(Integer.parseInt(String.valueOf(subscriptionDetails.get("reminderDaysBeforeExpiry"))));
        }
        vendor.setLastModifiedDate(new Date());
        return mongoTemplate.save(vendor);
    }

    public Map<String, Object> getVendorBusinessVerificationDetails(String vendorId) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            return null;
        }

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("businessName", vendor.getBusinessName());
        details.put("ownerName", vendor.getOwnerName());
        details.put("gstNumber", vendor.getGstNumber());
        details.put("panNumber", vendor.getPanNumber());
        details.put("businessLicense", vendor.getBusinessLicense());
        details.put("verificationStatus", vendor.getVerificationStatus());
        details.put("verificationDocuments", vendor.getVerificationDocuments());
        details.put("email", vendor.getEmail());
        details.put("phone", vendor.getPhone());
        details.put("address", vendor.getAddress());
        details.put("city", vendor.getCity());
        details.put("state", vendor.getState());
        details.put("pincode", vendor.getPincode());
        details.put("logo", vendor.getLogo());
        return details;
    }

    public Vendor updateVendorBusinessVerificationDetails(String vendorId, Map<String, Object> verificationDetails) {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            throw new IllegalArgumentException("Vendor not found");
        }
        if (verificationDetails == null) {
            throw new IllegalArgumentException("Verification details payload is required");
        }
        if (verificationDetails.get("businessName") != null) {
            vendor.setBusinessName(String.valueOf(verificationDetails.get("businessName")));
        }
        if (verificationDetails.get("ownerName") != null) {
            vendor.setOwnerName(String.valueOf(verificationDetails.get("ownerName")));
        }
        if (verificationDetails.get("gstNumber") != null) {
            vendor.setGstNumber(String.valueOf(verificationDetails.get("gstNumber")));
        }
        if (verificationDetails.get("panNumber") != null) {
            vendor.setPanNumber(String.valueOf(verificationDetails.get("panNumber")));
        }
        if (verificationDetails.get("businessLicense") != null) {
            vendor.setBusinessLicense(String.valueOf(verificationDetails.get("businessLicense")));
        }
        if (verificationDetails.get("verificationStatus") != null) {
            vendor.setVerificationStatus(String.valueOf(verificationDetails.get("verificationStatus")));
        }
        if (verificationDetails.get("verificationDocuments") != null) {
            vendor.setVerificationDocuments((Map<String, String>) verificationDetails.get("verificationDocuments"));
        }
        vendor.setLastModifiedDate(new Date());
        return mongoTemplate.save(vendor);
    }

    public Map<String, String> uploadVerificationDocuments(String vendorId, MultipartFile[] files) throws IOException {
        Vendor vendor = getVendorById(vendorId);
        if (vendor == null) {
            throw new IllegalArgumentException("Vendor not found");
        }
        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("At least one file is required");
        }

        Map<String, String> documentPaths = new HashMap<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String base64Content = Base64.getEncoder().encodeToString(file.getBytes());
            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
            String base64DataUrl = "data:" + contentType + ";base64," + base64Content;
            documentPaths.put("fileContent", base64DataUrl);
            documentPaths.put("fileType", contentType);
            documentPaths.put("fileName", file.getOriginalFilename());
        }

        if (vendor.getVerificationDocuments() == null) {
            vendor.setVerificationDocuments(new HashMap<>());
        }
        vendor.getVerificationDocuments().putAll(documentPaths);
        vendor.setLastModifiedDate(new Date());
        mongoTemplate.save(vendor);
        return documentPaths;
    }
}
