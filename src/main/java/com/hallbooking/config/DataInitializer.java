package com.hallbooking.config;

import com.hallbooking.entity.Hall;
import com.hallbooking.entity.Role;
import com.hallbooking.entity.User;
import com.hallbooking.dao.impl.HallRepository;
import com.hallbooking.dao.impl.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HallRepository hallRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@hallbooking.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);

            User user = new User();
            user.setUsername("john");
            user.setEmail("john@example.com");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setFirstName("John");
            user.setLastName("Doe");
            user.setRole(Role.USER);
            userRepository.save(user);

            System.out.println("Sample users created:");
            System.out.println("Admin - Username: admin, Password: admin123");
            System.out.println("User - Username: john, Password: password123");
        }

        if (hallRepository.count() == 0) {
            Hall hall1 = new Hall();
            hall1.setName("Grand Conference Hall");
            hall1.setDescription("Large conference hall perfect for corporate events and seminars");
            hall1.setCapacity(200);
            hall1.setLocation("Downtown, Floor 5");
            hall1.setPricePerHour(new BigDecimal("5500.00"));
            hall1.setAmenities("Projector, Sound System, WiFi, Air Conditioning, Whiteboard");
            hall1.setImageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87");
            hall1.setIsActive(true);
            hallRepository.save(hall1);

            Hall hall2 = new Hall();
            hall2.setName("Executive Meeting Room");
            hall2.setDescription("Modern meeting room ideal for board meetings and small gatherings");
            hall2.setCapacity(20);
            hall2.setLocation("West Wing, Floor 3");
            hall2.setPricePerHour(new BigDecimal("7500.00"));
            hall2.setAmenities("Video Conferencing, WiFi, Coffee Machine, Whiteboard");
            hall2.setImageUrl("https://images.unsplash.com/photo-1497366216548-37526070297c");
            hall2.setIsActive(true);
            hallRepository.save(hall2);

            Hall hall3 = new Hall();
            hall3.setName("Banquet Hall");
            hall3.setDescription("Elegant banquet hall suitable for weddings and social events");
            hall3.setCapacity(500);
            hall3.setLocation("Main Building, Ground Floor");
            hall3.setPricePerHour(new BigDecimal("3000.00"));
            hall3.setAmenities("Stage, Sound System, Lighting, Catering Area, Parking");
            hall3.setImageUrl("https://images.unsplash.com/photo-1464366400600-7168b8af9bc3");
            hall3.setIsActive(true);
            hallRepository.save(hall3);

            Hall hall4 = new Hall();
            hall4.setName("Training Room");
            hall4.setDescription("Versatile training room with modern amenities");
            hall4.setCapacity(50);
            hall4.setLocation("East Wing, Floor 2");
            hall4.setPricePerHour(new BigDecimal("5000.00"));
            hall4.setAmenities("Projector, WiFi, Movable Chairs, Whiteboard");
            hall4.setImageUrl("https://images.unsplash.com/photo-1524758631624-e2822e304c36");
            hall4.setIsActive(true);
            hallRepository.save(hall4);

            System.out.println("Sample halls created: 4 halls");
        }
    }
}
