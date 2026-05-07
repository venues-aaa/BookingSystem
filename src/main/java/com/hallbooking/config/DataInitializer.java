package com.hallbooking.config;

import com.hallbooking.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * DataInitializer - Automatically creates default users and categories on first startup
 *
 * This component runs on application startup and creates:
 * 1. Default admin, vendor, and user accounts
 * 2. Default Catering category with proper form schema
 *
 * Default Admin Credentials:
 * - Email: admin@hallbooking.com
 * - Password: admin123
 *
 * IMPORTANT: Change the admin password immediately after first login in production!
 */
@Component
@Order(2)  // Run after PasswordMigration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
        initializeCateringCategory();
    }

    /**
     * Initialize default users if none exist
     */
    private void initializeUsers() {
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
            System.out.println("Users already exist in database. Skipping user initialization.");
        }
    }

    /**
     * Initialize Catering category with proper form schema
     *
     * This prevents the MongoDB ID field serialization issue by ensuring
     * the category is created with proper 'id' fields that work with the
     * @Field("id") and @JsonProperty("id") annotations in FormField.java
     */
    private void initializeCateringCategory() {
        // Check if Catering category already exists
        Query query = new Query();
        query.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("name").is("Categering"));
        long categoryCount = mongoTemplate.count(query, ItemType.class);

        if (categoryCount == 0) {
            System.out.println("=== Creating Catering category with proper form schema... ===");

            ItemType catering = new ItemType();
            catering.setName("Categering");
            catering.setDisplayName("Catering Service");
            catering.setDescription("Professional catering services for events and functions");
            catering.setIcon("restaurant");
            catering.setIsActive(true);
            catering.setCreatedOn(new Date());
            catering.setCreatedBy("system");
            catering.setLastModifiedOn(new Date());
            catering.setLastModifiedBy("system");

            // Create form schema with proper 'id' fields (not '_id')
            FormSchema formSchema = new FormSchema();
            formSchema.setVersion(1);
            formSchema.setLayout(new LayoutConfig(12, 60));

            List<FormField> fields = new ArrayList<>();

            // Restaurant Name
            FormField restaurantName = new FormField();
            restaurantName.setId("restaurant_name");
            restaurantName.setType("text");
            restaurantName.setLabel("Restaurant Name");
            restaurantName.setPlaceholder("Enter restaurant name");
            restaurantName.setRequired(true);
            ValidationRules nameValidation = new ValidationRules();
            nameValidation.setMinLength(3);
            nameValidation.setMaxLength(100);
            restaurantName.setValidation(nameValidation);
            restaurantName.setPosition(new GridPosition(0, 0, 6, 1));
            fields.add(restaurantName);

            // Description
            FormField description = new FormField();
            description.setId("description");
            description.setType("textarea");
            description.setLabel("Restaurant Description");
            description.setPlaceholder("Describe your restaurant and specialties");
            description.setRequired(true);
            ValidationRules descValidation = new ValidationRules();
            descValidation.setMinLength(20);
            descValidation.setMaxLength(500);
            description.setValidation(descValidation);
            description.setPosition(new GridPosition(6, 0, 6, 2));
            fields.add(description);

            // Cuisine Type
            FormField cuisineType = new FormField();
            cuisineType.setId("cuisine_type");
            cuisineType.setType("select");
            cuisineType.setLabel("Cuisine Type");
            cuisineType.setRequired(true);
            cuisineType.setOptions(Arrays.asList("Indian", "Chinese", "Continental", "Italian",
                "Mexican", "Japanese", "Thai", "Mediterranean", "Multi-Cuisine"));
            cuisineType.setPosition(new GridPosition(0, 1, 3, 1));
            fields.add(cuisineType);

            // Food Types Available
            FormField foodType = new FormField();
            foodType.setId("food_type");
            foodType.setType("checkbox");
            foodType.setLabel("Food Types Available");
            foodType.setRequired(true);
            foodType.setOptions(Arrays.asList("Vegetarian", "Non-Vegetarian", "Vegan", "Jain", "Gluten-Free"));
            foodType.setPosition(new GridPosition(3, 1, 3, 1));
            fields.add(foodType);

            // Contact Number
            FormField contactNumber = new FormField();
            contactNumber.setId("contact_number");
            contactNumber.setType("text");
            contactNumber.setLabel("Contact Number");
            contactNumber.setPlaceholder("Enter contact number");
            contactNumber.setRequired(true);
            ValidationRules phoneValidation = new ValidationRules();
            phoneValidation.setPattern("^[0-9]{10}$");
            phoneValidation.setCustomMessage("Please enter a valid 10-digit phone number");
            contactNumber.setValidation(phoneValidation);
            contactNumber.setPosition(new GridPosition(0, 2, 3, 1));
            fields.add(contactNumber);

            // Email
            FormField email = new FormField();
            email.setId("email");
            email.setType("text");
            email.setLabel("Email Address");
            email.setPlaceholder("restaurant@example.com");
            email.setRequired(true);
            ValidationRules emailValidation = new ValidationRules();
            emailValidation.setPattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
            emailValidation.setCustomMessage("Please enter a valid email address");
            email.setValidation(emailValidation);
            email.setPosition(new GridPosition(3, 2, 3, 1));
            fields.add(email);

            // Minimum Order
            FormField minOrder = new FormField();
            minOrder.setId("minimum_order");
            minOrder.setType("number");
            minOrder.setLabel("Minimum Order (People)");
            minOrder.setPlaceholder("e.g., 10");
            minOrder.setRequired(true);
            ValidationRules minOrderValidation = new ValidationRules();
            minOrderValidation.setMin(1);
            minOrderValidation.setMax(1000);
            minOrder.setValidation(minOrderValidation);
            minOrder.setPosition(new GridPosition(6, 2, 3, 1));
            fields.add(minOrder);

            // Maximum Capacity
            FormField maxCapacity = new FormField();
            maxCapacity.setId("maximum_capacity");
            maxCapacity.setType("number");
            maxCapacity.setLabel("Maximum Capacity (People)");
            maxCapacity.setPlaceholder("e.g., 500");
            maxCapacity.setRequired(true);
            ValidationRules maxCapValidation = new ValidationRules();
            maxCapValidation.setMin(10);
            maxCapValidation.setMax(10000);
            maxCapacity.setValidation(maxCapValidation);
            maxCapacity.setPosition(new GridPosition(9, 2, 3, 1));
            fields.add(maxCapacity);

            // Menu Items (Repeating Group)
            FormField menuItems = new FormField();
            menuItems.setId("menu_items");
            menuItems.setType("repeatingGroup");
            menuItems.setLabel("Menu Items");
            menuItems.setRequired(true);
            menuItems.setMinItems(3);
            menuItems.setMaxItems(50);
            menuItems.setPosition(new GridPosition(0, 3, 12, 4));

            // Nested fields for menu items
            List<FormField> nestedFields = new ArrayList<>();

            // Menu Item Name
            FormField menuItemName = new FormField();
            menuItemName.setId("menu_item_name");
            menuItemName.setType("text");
            menuItemName.setLabel("Menu Item Name");
            menuItemName.setPlaceholder("e.g., Butter Chicken");
            menuItemName.setRequired(true);
            ValidationRules itemNameValidation = new ValidationRules();
            itemNameValidation.setMinLength(3);
            itemNameValidation.setMaxLength(100);
            menuItemName.setValidation(itemNameValidation);
            nestedFields.add(menuItemName);

            // Menu Category
            FormField menuCategory = new FormField();
            menuCategory.setId("menu_category");
            menuCategory.setType("select");
            menuCategory.setLabel("Category");
            menuCategory.setRequired(true);
            menuCategory.setOptions(Arrays.asList("Appetizer", "Soup", "Main Course - Veg",
                "Main Course - Non-Veg", "Bread", "Rice", "Dessert", "Beverage", "Salad", "Side Dish"));
            nestedFields.add(menuCategory);

            // Food Type Item
            FormField foodTypeItem = new FormField();
            foodTypeItem.setId("food_type_item");
            foodTypeItem.setType("radio");
            foodTypeItem.setLabel("Type");
            foodTypeItem.setRequired(true);
            foodTypeItem.setOptions(Arrays.asList("Veg", "Non-Veg", "Vegan", "Jain"));
            nestedFields.add(foodTypeItem);

            // Price Per Person
            FormField pricePerPerson = new FormField();
            pricePerPerson.setId("price_per_person");
            pricePerPerson.setType("number");
            pricePerPerson.setLabel("Price per Person (₹)");
            pricePerPerson.setPlaceholder("0");
            pricePerPerson.setRequired(true);
            ValidationRules priceValidation = new ValidationRules();
            priceValidation.setMin(0);
            priceValidation.setMax(10000);
            pricePerPerson.setValidation(priceValidation);
            nestedFields.add(pricePerPerson);

            // Item Description
            FormField itemDescription = new FormField();
            itemDescription.setId("item_description");
            itemDescription.setType("textarea");
            itemDescription.setLabel("Description");
            itemDescription.setPlaceholder("Brief description of the dish");
            itemDescription.setRequired(false);
            ValidationRules itemDescValidation = new ValidationRules();
            itemDescValidation.setMaxLength(200);
            itemDescription.setValidation(itemDescValidation);
            nestedFields.add(itemDescription);

            menuItems.setNestedFields(nestedFields);
            fields.add(menuItems);

            // Special Services
            FormField specialServices = new FormField();
            specialServices.setId("special_services");
            specialServices.setType("checkbox");
            specialServices.setLabel("Special Services Offered");
            specialServices.setRequired(false);
            specialServices.setOptions(Arrays.asList("Live Cooking Counter", "Customized Menu",
                "Table Setup", "Serving Staff", "Disposable Crockery", "Premium Crockery",
                "Decorative Food Presentation"));
            specialServices.setPosition(new GridPosition(0, 7, 6, 2));
            fields.add(specialServices);

            // Payment Terms
            FormField paymentTerms = new FormField();
            paymentTerms.setId("payment_terms");
            paymentTerms.setType("radio");
            paymentTerms.setLabel("Payment Terms");
            paymentTerms.setRequired(true);
            paymentTerms.setOptions(Arrays.asList("50% Advance, 50% on Delivery",
                "100% Advance", "Pay After Service"));
            paymentTerms.setPosition(new GridPosition(6, 7, 6, 1));
            fields.add(paymentTerms);

            // Cancellation Policy
            FormField cancellationPolicy = new FormField();
            cancellationPolicy.setId("cancellation_policy");
            cancellationPolicy.setType("textarea");
            cancellationPolicy.setLabel("Cancellation Policy");
            cancellationPolicy.setPlaceholder("Describe your cancellation and refund policy");
            cancellationPolicy.setRequired(true);
            ValidationRules cancelValidation = new ValidationRules();
            cancelValidation.setMinLength(20);
            cancelValidation.setMaxLength(500);
            cancellationPolicy.setValidation(cancelValidation);
            cancellationPolicy.setPosition(new GridPosition(6, 8, 6, 1));
            fields.add(cancellationPolicy);

            formSchema.setFields(fields);
            catering.setFormSchema(formSchema);

            mongoTemplate.save(catering);

            System.out.println("✅ Catering category created successfully!");
            System.out.println("   - Total Fields: " + fields.size());
            System.out.println("   - All fields use 'id' property (not '_id')");
            System.out.println("   - Compatible with @Field(\"id\") annotation in FormField.java");
            System.out.println("=======================================================");
        } else {
            System.out.println("Catering category already exists. Skipping category initialization.");
        }
    }
}
