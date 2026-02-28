# Hall Booking System - Frontend

React frontend for the Hall Booking System.

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

The app will run on http://localhost:3000

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

## Configuration

The frontend connects to the backend API at `http://localhost:8080/api` by default.

To change this, set the `REACT_APP_API_URL` environment variable.

## Demo Credentials

**Regular User:**
- Username: `john`
- Password: `password123`

**Admin:**
- Username: `admin`
- Password: `admin123`

## Features

### User Features
- Browse available halls
- Search and filter halls by capacity, location, amenities
- View hall details
- Create bookings
- View and manage bookings
- Cancel bookings

### Admin Features
- Dashboard with statistics
- Create, edit, delete halls
- View all bookings
- View all users

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login, Register forms
│   ├── common/         # Navbar, ProtectedRoute
│   ├── hall/           # HallCard, HallList, HallSearch
│   └── booking/        # Booking-related components
├── pages/
│   ├── admin/          # Admin dashboard and management
│   ├── HomePage.js
│   ├── HallDetailsPage.js
│   ├── BookingPage.js
│   └── MyBookingsPage.js
├── services/           # API service layer
├── context/            # React contexts (Auth)
├── utils/              # Utility functions
└── App.js              # Main app with routing
```

## Dependencies

- React Router DOM - Routing
- Axios - HTTP client
- date-fns - Date formatting
