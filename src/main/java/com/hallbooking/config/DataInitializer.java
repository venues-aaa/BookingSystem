package com.hallbooking.config;

import com.hallbooking.model.User;
import com.hallbooking.model.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * DataInitializer - Automatically creates default admin user on first startup
 *
 * This component runs on application startup and creates a default admin user
 * if no users exist in the database. This ensures you can always log in to a
 * fresh installation.
 *
 * Default Admin Credentials:
 * - Email: admin@hallbooking.com
 * - Password: admin123
 *
 * IMPORTANT: Change the admin password immediately after first login in production!
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if any users exist in the database
        long userCount = mongoTemplate.count(new Query(), User.class);

        if (userCount == 0) {
            System.out.println("=== No users found in database. Creating default admin user... ===");

            // Create default admin user
            User admin = new User();
            admin.setId("admin001");
            admin.setEmailId("admin@hallbooking.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setStatus("Active");
            admin.setIsActive(true);
            admin.setCreatedOn(new Date());
            admin.setCreatedUser("system");
            admin.setLastModifiedDate(new Date());
            admin.setLastModifiedUser("system");

            UserDetails adminDetails = new UserDetails();
            adminDetails.setFirstName("Admin");
            adminDetails.setLastName("User");
            adminDetails.setRole("ADMIN");
            admin.setDetails(adminDetails);

            mongoTemplate.save(admin);

            // Create default vendor user
            User vendor = new User();
            vendor.setId("vendor001");
            vendor.setEmailId("vendor@hallbooking.com");
            vendor.setPassword(passwordEncoder.encode("vendor123"));
            vendor.setStatus("Active");
            vendor.setIsActive(true);
            vendor.setCreatedOn(new Date());
            vendor.setCreatedUser("system");
            vendor.setLastModifiedDate(new Date());
            vendor.setLastModifiedUser("system");

            UserDetails vendorDetails = new UserDetails();
            vendorDetails.setFirstName("John");
            vendorDetails.setLastName("Vendor");
            vendorDetails.setRole("VENDOR");
            vendor.setDetails(vendorDetails);

            mongoTemplate.save(vendor);

            // Create default regular user
            User user = new User();
            user.setId("user001");
            user.setEmailId("user@hallbooking.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setStatus("Active");
            user.setIsActive(true);
            user.setCreatedOn(new Date());
            user.setCreatedUser("system");
            user.setLastModifiedDate(new Date());
            user.setLastModifiedUser("system");

            UserDetails userDetails = new UserDetails();
            userDetails.setFirstName("Jane");
            userDetails.setLastName("Doe");
            userDetails.setRole("USER");
            user.setDetails(userDetails);

            mongoTemplate.save(user);

            System.out.println("=== Default users created successfully! ===");
            System.out.println("Admin   - Email: admin@hallbooking.com,  Password: admin123");
            System.out.println("Vendor  - Email: vendor@hallbooking.com, Password: vendor123");
            System.out.println("User    - Email: user@hallbooking.com,   Password: user123");
            System.out.println("=======================================================");
            System.out.println("IMPORTANT: Change the admin password after first login!");
            System.out.println("=======================================================");
        } else {
            System.out.println("Users already exist in database. Skipping initialization.");
        }
    }
}
