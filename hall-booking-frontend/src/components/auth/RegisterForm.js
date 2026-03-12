import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, verifyOtp } from '../../services/authService';

const RegisterForm = () => {

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.phoneNumber.length !== 10) {
      setError('Phone number must be 10 digits');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);

      // Store phone number and OTP for verification
      setPhoneNumber(registerData.phoneNumber);
      setGeneratedOtp(response.otp); // For development - shows OTP
      setShowOtpVerification(true);
      setSuccess(`OTP sent successfully! (Dev mode: ${response.otp})`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 4) {
      setError('OTP must be 4 digits');
      return;
    }

    setLoading(true);

    try {
      await verifyOtp({ phoneNumber, otp });
      setSuccess('Registration completed successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await register(registerData);
      setGeneratedOtp(response.otp);
      setSuccess(`OTP resent successfully! (Dev mode: ${response.otp})`);
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-form animate__animated animate__fadeIn">
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '48px', color: '#dfa974', fontFamily: 'Lora, serif' }}>BookNest</h1>
              </div>

              {!showOtpVerification ? (
                <>
                  <h2>Create Your Account</h2>
                  <p>Join us for an exclusive luxury experience</p>

                  <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-control"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-control"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                    Username <span style={{ color: '#dfa974' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="fa fa-user" style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#dfa974'
                    }}></i>
                    <input
                      type="text"
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Choose a username (min 3 characters)"
                      minLength={3}
                      style={{ paddingLeft: '45px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                    Email <span style={{ color: '#dfa974' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="fa fa-envelope" style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#dfa974'
                    }}></i>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      style={{ paddingLeft: '45px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                    Phone Number <span style={{ color: '#dfa974' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <i className="fa fa-phone" style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#dfa974'
                    }}></i>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className="form-control"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      placeholder="Enter 10-digit phone number"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      style={{ paddingLeft: '45px' }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                        Password <span style={{ color: '#dfa974' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <i className="fa fa-lock" style={{
                          position: 'absolute',
                          left: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#dfa974'
                        }}></i>
                        <input
                          type="password"
                          name="password"
                          className="form-control"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="Min 8 characters"
                          minLength={8}
                          style={{ paddingLeft: '45px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                        Confirm Password <span style={{ color: '#dfa974' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <i className="fa fa-lock" style={{
                          position: 'absolute',
                          left: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#dfa974'
                        }}></i>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Confirm password"
                          style={{ paddingLeft: '45px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div style={{
                    background: '#ffe6e6',
                    border: '1px solid #ff4d4d',
                    color: '#cc0000',
                    padding: '12px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <i className="fa fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                    {error}
                  </div>
                )}

                {success && (
                  <div style={{
                    background: '#d4edda',
                    border: '1px solid #28a745',
                    color: '#155724',
                    padding: '12px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <i className="fa fa-check-circle" style={{ marginRight: '8px' }}></i>
                    {success}
                  </div>
                )}

                    <button type="submit" className="primary-btn" disabled={loading}>
                      {loading ? (
                        <>
                          <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-user-plus" style={{ marginRight: '8px' }}></i>
                          Continue with OTP
                        </>
                      )}
                    </button>
                  </form>

                  <div className="auth-links">
                    <p style={{ marginBottom: '20px', color: '#707079' }}>
                      Already have an account? <Link to="/login" style={{ color: '#dfa974', fontWeight: '600' }}>Sign In</Link>
                    </p>
                    <Link to="/" style={{ color: '#707079', fontSize: '14px' }}>
                      <i className="fa fa-arrow-left" style={{ marginRight: '5px' }}></i>
                      Back to Home
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2>Verify OTP</h2>
                  <p>Enter the 4-digit OTP sent to {phoneNumber}</p>

                  <form onSubmit={handleOtpSubmit}>
                    <div className="form-group">
                      <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                        Enter OTP <span style={{ color: '#dfa974' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <i className="fa fa-key" style={{
                          position: 'absolute',
                          left: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#dfa974'
                        }}></i>
                        <input
                          type="text"
                          className="form-control"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          placeholder="Enter 4-digit OTP"
                          pattern="[0-9]{4}"
                          maxLength="4"
                          style={{ paddingLeft: '45px', fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
                          autoFocus
                        />
                      </div>
                    </div>

                    {error && (
                      <div style={{
                        background: '#ffe6e6',
                        border: '1px solid #ff4d4d',
                        color: '#cc0000',
                        padding: '12px',
                        marginBottom: '20px',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        <i className="fa fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
                        {error}
                      </div>
                    )}

                    {success && (
                      <div style={{
                        background: '#d4edda',
                        border: '1px solid #28a745',
                        color: '#155724',
                        padding: '12px',
                        marginBottom: '20px',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}>
                        <i className="fa fa-check-circle" style={{ marginRight: '8px' }}></i>
                        {success}
                      </div>
                    )}

                    <button type="submit" className="primary-btn" disabled={loading} style={{ marginBottom: '15px' }}>
                      {loading ? (
                        <>
                          <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-check" style={{ marginRight: '8px' }}></i>
                          Verify & Complete Registration
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'transparent',
                        border: '2px solid #dfa974',
                        color: '#dfa974',
                        fontSize: '14px',
                        fontWeight: '700',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#dfa974';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#dfa974';
                      }}
                    >
                      <i className="fa fa-redo" style={{ marginRight: '8px' }}></i>
                      Resend OTP
                    </button>
                  </form>

                  <div className="auth-links" style={{ marginTop: '20px' }}>
                    <button
                      onClick={() => {
                        setShowOtpVerification(false);
                        setOtp('');
                        setError('');
                        setSuccess('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#707079',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      <i className="fa fa-arrow-left" style={{ marginRight: '5px' }}></i>
                      Back to Registration
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
