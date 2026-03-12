import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    emailId: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="auth-form animate__animated animate__fadeIn">
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '48px', color: '#dfa974', fontFamily: 'Lora, serif' }}>BookNest</h1>
              </div>

              <h2>Welcome Back</h2>
              <p>Sign in to continue to your account</p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                    Username or Email
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
                      name="emailId"
                      className="form-control"
                      value={formData.emailId}
                      onChange={handleChange}
                      required
                      placeholder="Enter username or email"
                      style={{ paddingLeft: '45px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: '600', color: '#19191a', marginBottom: '10px', display: 'block' }}>
                    Password
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
                      placeholder="Enter password"
                      style={{ paddingLeft: '45px' }}
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

                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="auth-links">
                <p style={{ marginBottom: '20px', color: '#707079' }}>
                  Don't have an account? <Link to="/register" style={{ color: '#dfa974', fontWeight: '600' }}>Create Account</Link>
                </p>
                <Link to="/" style={{ color: '#707079', fontSize: '14px' }}>
                  <i className="fa fa-arrow-left" style={{ marginRight: '5px' }}></i>
                  Back to Home
                </Link>
              </div>

              <div style={{
                background: '#f9f9f9',
                padding: '20px',
                marginTop: '30px',
                borderLeft: '3px solid #dfa974'
              }}>
                <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#19191a' }}>
                  <i className="fa fa-info-circle" style={{ marginRight: '5px', color: '#dfa974' }}></i>
                  Demo Credentials:
                </p>
                <p style={{ fontSize: '12px', margin: '5px 0', color: '#707079' }}>
                  <strong>User:</strong> john / password123
                </p>
                <p style={{ fontSize: '12px', margin: '5px 0', color: '#707079' }}>
                  <strong>Admin:</strong> admin / admin123
                </p>
                <p style={{ fontSize: '12px', margin: '5px 0', color: '#707079' }}>
                  <strong>Vendor:</strong> vendor / vendor123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
