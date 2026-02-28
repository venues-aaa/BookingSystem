import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/authService';

const RegisterForm = () => {

   const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const [error, setError] = useState('');
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 2) {
      setError('Password must be at least 2 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                          placeholder="Min 2 characters"
                          minLength={2}
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

                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-user-plus" style={{ marginRight: '8px' }}></i>
                      Create Account
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
