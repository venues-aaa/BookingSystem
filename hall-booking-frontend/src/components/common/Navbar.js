import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      {/* Top Bar */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e5e5',
        padding: '8px 0',
        fontSize: '13px',
        color: '#19191a',
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 1000
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                <div>
                  <i className="fa fa-phone" style={{ color: '#dfa974', marginRight: '8px' }}></i>
                  <span style={{ color: '#707079' }}>0471-2393</span>
                </div>
                <div>
                  <i className="fa fa-map-marker-alt" style={{ color: '#dfa974', marginRight: '8px' }}></i>
                  <span style={{ color: '#707079' }}>Kerala, India</span>
                </div>
                <div>
                  <i className="fa fa-envelope" style={{ color: '#dfa974', marginRight: '8px' }}></i>
                  <span style={{ color: '#707079' }}>info@booknest.com</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <a href="#!" style={{ color: '#707079', fontSize: '14px', transition: 'all 0.3s' }}
                     onMouseEnter={(e) => e.target.style.color = '#dfa974'}
                     onMouseLeave={(e) => e.target.style.color = '#707079'}>
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#!" style={{ color: '#707079', fontSize: '14px', transition: 'all 0.3s' }}
                     onMouseEnter={(e) => e.target.style.color = '#dfa974'}
                     onMouseLeave={(e) => e.target.style.color = '#707079'}>
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#!" style={{ color: '#707079', fontSize: '14px', transition: 'all 0.3s' }}
                     onMouseEnter={(e) => e.target.style.color = '#dfa974'}
                     onMouseLeave={(e) => e.target.style.color = '#707079'}>
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingLeft: '20px',
                  borderLeft: '1px solid #e5e5e5',
                  cursor: 'pointer'
                }}>
                  <img
                    src="https://flagcdn.com/w20/in.png"
                    alt="India Flag"
                    style={{ width: '20px', height: '15px' }}
                  />
                  <span style={{ fontSize: '12px', color: '#707079' }}>IN</span>
                  <i className="fa fa-chevron-down" style={{ fontSize: '9px', color: '#707079' }}></i>
                </div>

                <Link
                  to="/halls"
                  style={{
                    background: '#dfa974',
                    color: '#ffffff',
                    padding: '6px 20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    border: 'none',
                    marginLeft: '15px',
                    transition: 'all 0.3s',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#c7935d';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#dfa974';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Booking Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="header" style={{ top: '70px', background: '#ffffff' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-3">
              <div className="header__logo">
                <Link to="/">
                  <h1>BookNest</h1>
                </Link>
              </div>
            </div>
            <div className="col-lg-9">
              <nav className="header__menu">
                <ul>
                <li>
                  <Link to="/" className={isActive('/')}>
                    HOME
                  </Link>
                </li>
                <li>
                  <Link to="/halls" className={isActive('/halls')}>
                    HALLS
                  </Link>
                </li>

                {isAuthenticated ? (
                  <>
                    <li>
                      <Link to="/my-bookings" className={isActive('/my-bookings')}>
                        MY BOOKINGS
                      </Link>
                    </li>

                    {isAdmin() ? (
                      <li className="header__menu__dropdown">
                        <a href="#!">
                          ADMIN
                        </a>
                        <div className="dropdown__menu">
                          <ul>
                            <li>
                              <Link to="/admin">Dashboard</Link>
                            </li>
                            <li>
                              <Link to="/admin/halls">Manage Halls</Link>
                            </li>
                            <li>
                              <a href="#!" onClick={handleLogout}>
                                <i className="fa fa-sign-out-alt"></i> Logout
                              </a>
                            </li>
                          </ul>
                        </div>
                      </li>
                    ) : (
                      <li className="header__menu__dropdown">
                        <a href="#!">
                          <i className="fa fa-user"></i> {user?.firstName || user?.username}
                        </a>
                        <div className="dropdown__menu">
                          <ul>
                            <li>
                              <a href="#!" onClick={handleLogout}>
                                <i className="fa fa-sign-out-alt"></i> Logout
                              </a>
                            </li>
                          </ul>
                        </div>
                      </li>
                    )}
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/login" className={isActive('/login')}>
                        LOGIN
                      </Link>
                    </li>
                    <li>
                      <Link to="/register" className={isActive('/register')}>
                        REGISTER
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
    </>
  );
};

export default Navbar;
