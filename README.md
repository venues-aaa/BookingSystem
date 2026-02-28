# Hall Booking System

A full-stack hall booking system built with Java Spring Boot backend and React frontend.

## Features

### User Features
- User registration and authentication (JWT-based)
- Browse available halls with search and filters
- View hall details (capacity, amenities, pricing, location)
- Create bookings (auto-confirmed if time slot available)
- View booking history
- Cancel bookings

### Admin Features
- Manage halls (Create, Read, Update, Delete)
- View all bookings with filters
- View all users
- Dashboard with statistics

### System Features
- JWT-based authentication with role-based access control (USER, ADMIN)
- Booking conflict detection (prevents double bookings)
- H2 in-memory database
- RESTful API
- Soft delete for bookings (maintains history)
- Sample data seeding on startup

## Backend Architecture

### Technology Stack
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 21
- **Database**: H2 (in-memory)
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **ORM**: JPA/Hibernate
- **Validation**: Bean Validation
- **Utilities**: Lombok

### Project Structure

```
src/main/java/com/hallbooking/
├── config/                    # Configuration classes
│   ├── SecurityConfig.java   # Security & CORS configuration
│   └── DataInitializer.java  # Sample data seeding
│
├── controller/                # REST Controllers
│   ├── AuthController.java  # Authentication endpoints
│   ├── HallController.java  # Hall management (public)
│   ├── BookingController.java # Booking operations
│   └── AdminController.java  # Admin-only endpoints
│
├── dto/                       # Data Transfer Objects
│   ├── request/              # Request DTOs
│   └── response/             # Response DTOs
│
├── entity/                    # JPA Entities
│   ├── User.java            # User entity
│   ├── Hall.java            # Hall entity
│   ├── Booking.java         # Booking entity
│   ├── Role.java            # User roles enum
│   └── BookingStatus.java   # Booking status enum
│
├── exception/                 # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BookingConflictException.java
│   └── UnauthorizedException.java
│
├── repository/                # Spring Data JPA Repositories
│   ├── UserRepository.java
│   ├── HallRepository.java
│   └── BookingRepository.java
│
├── security/                  # JWT Security
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtAuthenticationEntryPoint.java
│   └── UserDetailsServiceImpl.java
│
├── service/                   # Business Logic
│   ├── AuthService.java
│   ├── HallService.java
│   └── BookingService.java
│
└── HallBookingApplication.java # Main Spring Boot application
```

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (requires auth)

### Halls
- `GET /api/halls` - List all active halls (public, with pagination & filters)
- `GET /api/halls/{id}` - Get hall details (public)

### Bookings (Authenticated)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/history` - Get booking history
- `GET /api/bookings/{id}` - Get booking details
- `DELETE /api/bookings/{id}` - Cancel booking

### Admin (Admin Role Required)
- `POST /api/admin/halls` - Create hall
- `PUT /api/admin/halls/{id}` - Update hall
- `DELETE /api/admin/halls/{id}` - Delete hall
- `GET /api/admin/bookings` - Get all bookings (with filters)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/statistics` - Get dashboard statistics

## Setup Instructions

### Prerequisites
- Java 21
- Maven 3.6+
- Node.js 16+ (for frontend)

### Backend Setup

1. **Enable Lombok Annotation Processing in IDE**

   **IntelliJ IDEA:**
   - Go to `Settings/Preferences` → `Build, Execution, Deployment` → `Compiler` → `Annotation Processors`
   - Check "Enable annotation processing"
   - Install Lombok plugin if prompted

   **Eclipse:**
   - Install Lombok: Download lombok.jar and run `java -jar lombok.jar`
   - Restart Eclipse

   **VS Code:**
   - Install "Language Support for Java" extension
   - Lombok should work automatically

2. **Build the project:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

4. **Access H2 Console** (optional):
   - URL: http://localhost:8080/h2-console
   - JDBC URL: `jdbc:h2:mem:hallbookingdb`
   - Username: `sa`
   - Password: (leave empty)

### Sample Data

The application automatically creates sample data on startup:

**Users:**
- Admin: username: `admin`, password: `admin123`
- User: username: `john`, password: `password123`

**Halls:**
- Grand Conference Hall (200 capacity)
- Executive Meeting Room (20 capacity)
- Banquet Hall (500 capacity)
- Training Room (50 capacity)

## Configuration

### application.properties

```properties
# Server
server.port=8080

# H2 Database
spring.datasource.url=jdbc:h2:mem:hallbookingdb
spring.h2.console.enabled=true

# JPA
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# JWT
jwt.secret=your-256-bit-secret
jwt.expiration=86400000  # 24 hours
```

## Key Features Implementation

### Booking Conflict Detection

The system prevents double bookings using a custom repository query:

```java
@Query("SELECT b FROM Booking b WHERE b.hall.id = :hallId
       AND b.status = 'CONFIRMED'
       AND ((b.startDateTime < :endDateTime AND b.endDateTime > :startDateTime))")
List<Booking> findOverlappingBookings(...)
```

### JWT Authentication Flow

1. User logs in with credentials
2. Backend validates and generates JWT token
3. Frontend stores token in localStorage
4. Token sent in Authorization header for protected routes
5. Backend validates token on each request

### Role-Based Access Control

- **USER** role: Can browse halls, create/cancel own bookings
- **ADMIN** role: All USER permissions + manage halls, view all bookings/users

## Testing the API

### Example: Register a User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "john",
    "password": "password123"
  }'
```

### Example: Get Halls

```bash
curl http://localhost:8080/api/halls?page=0&size=10
```

### Example: Create Booking (with JWT token)

```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "hallId": 1,
    "startDateTime": "2026-02-01T10:00:00",
    "endDateTime": "2026-02-01T12:00:00",
    "purpose": "Team Meeting",
    "numberOfAttendees": 15
  }'
```

## Frontend Development

The frontend should be built with React and include:

### Required Components
- Authentication pages (Login, Register)
- Hall browsing with search/filters
- Hall details page
- Booking form
- User booking management
- Admin dashboard
- Admin hall management
- Admin booking/user management

### Recommended Libraries
- React Router for routing
- Axios for API calls
- React Toastify for notifications
- date-fns for date handling
- Context API for state management

## Database Schema

### Users Table
- id, username (unique), email (unique), password (encrypted)
- firstName, lastName, role, createdAt, updatedAt

### Halls Table
- id, name, description, capacity, location
- pricePerHour, amenities, imageUrl, isActive
- createdAt, updatedAt

### Bookings Table
- id, userId (FK), hallId (FK)
- startDateTime, endDateTime, status
- totalPrice, purpose, numberOfAttendees
- createdAt, updatedAt

## Next Steps

1. Fix Lombok annotation processing (enable in IDE or configure Java 21)
2. Build and test backend
3. Create React frontend application
4. Implement API service layer in frontend
5. Create authentication flow
6. Build hall browsing and booking components
7. Create admin dashboard
8. End-to-end testing

## Troubleshooting

### Lombok Compilation Issues
- Ensure Java 21 is being used (not Java 25)
- Enable annotation processing in your IDE
- Clean and rebuild: `mvn clean install`

### JWT Token Issues
- Ensure Authorization header format: `Bearer <token>`
- Check token expiration (24 hours default)
- Verify JWT secret is configured

### Database Issues
- H2 console: http://localhost:8080/h2-console
- Database resets on application restart (in-memory)
- Check `spring.jpa.show-sql=true` for SQL debugging

## License

This project is for educational purposes.
