package com.hallbooking.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "otp")
public class OtpRequest {

    @Id
    private String id;
    private String accountId;
    private String destination;
    private String otp;
    private Date createdAt;

    public OtpRequest() {}

    public OtpRequest(String accountId, String destination, String otp, Date createdAt) {
        this.accountId = accountId;
        this.destination = destination;
        this.otp = otp;
        this.createdAt = createdAt;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}