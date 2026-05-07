package com.hallbooking.config;

import com.hallbooking.model.User;
import com.hallbooking.model.Vendor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * PasswordMigration - One-time migration to hash existing plain text passwords
 *
 * This runs before DataInitializer to ensure all existing users have BCrypt hashed passwords
 */
@Component
@Order(1)  // Run before DataInitializer (which is default order)
public class PasswordMigration implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Checking for passwords that need BCrypt hashing ===");

        // Migrate regular users
        List<User> users = mongoTemplate.findAll(User.class);
        int usersMigrated = 0;

        for (User user : users) {
            if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
                // Password is not BCrypt hashed (BCrypt hashes start with $2a$, $2b$, or $2y$)
                System.out.println("Migrating password for user: " + user.getEmailId());
                user.setPassword(passwordEncoder.encode(user.getPassword()));
                mongoTemplate.save(user);
                usersMigrated++;
            }
        }

        // Migrate vendors
        List<Vendor> vendors = mongoTemplate.findAll(Vendor.class);
        int vendorsMigrated = 0;

        for (Vendor vendor : vendors) {
            if (vendor.getPassword() != null && !vendor.getPassword().startsWith("$2a$")) {
                System.out.println("Migrating password for vendor: " + vendor.getEmailId());
                vendor.setPassword(passwordEncoder.encode(vendor.getPassword()));
                mongoTemplate.save(vendor);
                vendorsMigrated++;
            }
        }

        if (usersMigrated > 0 || vendorsMigrated > 0) {
            System.out.println("=== Password Migration Complete ===");
            System.out.println("Users migrated: " + usersMigrated);
            System.out.println("Vendors migrated: " + vendorsMigrated);
        } else {
            System.out.println("=== All passwords already using BCrypt ===");
        }
    }
}
