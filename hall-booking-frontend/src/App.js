import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import GenericBookingPage from './pages/GenericBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import BookingDetailsPage from './pages/BookingDetailsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import AllBookingsPage from './pages/admin/AllBookingsPage';
import VendorDashboard from './pages/vendor/VendorDashboard';

// NEW: Category Management
import CategoriesPage from './pages/admin/CategoriesPage';
import CreateCategoryPage from './pages/admin/CreateCategoryPage';
import EditCategoryPage from './pages/admin/EditCategoryPage';
import FormBuilder from './components/formBuilder/FormBuilder';

// NEW: Dynamic Item Creation
import CreateItemPage from './pages/vendor/CreateItemPage';
import VendorCategoryItemsPage from './pages/vendor/VendorCategoryItemsPage';
import VendorOfflineBookingsPage from './pages/vendor/VendorOfflineBookingsPage';
import VendorBlockedDates from './pages/vendor/VendorBlockedDates';

// NEW: Public Category Browsing
import CategoryItemsPage from './pages/CategoryItemsPage';
import ItemDetailsPage from './pages/ItemDetailsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            {/* NEW: Generic Category Items Page */}
            <Route path="/category/:categoryId/items" element={<CategoryItemsPage />} />

            {/* NEW: Generic Item Details Page (works for ALL categories) */}
            <Route path="/item/:itemId" element={<ItemDetailsPage />} />

            {/* Protected Routes */}
            {/* Universal booking page for all categories */}
            <Route
              path="/booking/:itemId"
              element={
                <ProtectedRoute>
                  <GenericBookingPage />
                </ProtectedRoute>
              }
            />
            {/* OLD: Keep old booking pages for backward compatibility */}
            <Route
              path="/booking/hall/:hallId"
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking-success"
              element={
                <ProtectedRoute>
                  <BookingSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/:bookingId/details"
              element={
                <ProtectedRoute>
                  <BookingDetailsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AllBookingsPage />
                </ProtectedRoute>
              }
            />

            {/* NEW: Category Management Routes */}
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute adminOnly={true}>
                  <CategoriesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/create"
              element={
                <ProtectedRoute adminOnly={true}>
                  <CreateCategoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/:categoryId/edit"
              element={
                <ProtectedRoute adminOnly={true}>
                  <EditCategoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/:categoryId/design"
              element={
                <ProtectedRoute adminOnly={true}>
                  <FormBuilder />
                </ProtectedRoute>
              }
            />

            {/* Vendor Routes */}
            <Route
              path="/vendor"
              element={
                <ProtectedRoute vendorOnly={true}>
                  <VendorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/offline-bookings"
              element={
                <ProtectedRoute vendorOnly={true}>
                  <VendorOfflineBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/blocked-dates"
              element={
                <ProtectedRoute vendorOnly={true}>
                  <VendorBlockedDates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/items/create"
              element={
                <ProtectedRoute vendorOnly={true}>
                  <CreateItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/items/create/:categoryId"
              element={
                <ProtectedRoute vendorOnly={true}>
                  <CreateItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/items/:categoryId"
              element={
                <ProtectedRoute vendorOnly={true}>
                  <VendorCategoryItemsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/items/edit/:itemId"
              element={
                <ProtectedRoute vendorOnly={true}>
                  <CreateItemPage editMode={true} />
                </ProtectedRoute>
              }
            />

            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
