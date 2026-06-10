import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCategories } from '../../services/categoryService';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin, isVendor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Fetch categories for all users (to show in menu)
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Helper to convert category name to "My Xs" format (plural)
  const getCategoryMenuLabel = (categoryName) => {
    // Add 's' to make it plural, unless it already ends with 's'
    const plural = categoryName.toLowerCase().endsWith('s')
      ? categoryName
      : `${categoryName}s`;
    return `My ${plural}`;
  };

  return (
    <>
      {/* Top Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '10px 0',
        fontSize: '13px',
        color: '#ffffff',
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa fa-phone" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px' }}></i>
                  <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '13px', fontWeight: '500' }}>0471-2393</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa fa-map-marker-alt" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px' }}></i>
                  <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '13px', fontWeight: '500' }}>Kerala, India</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa fa-envelope" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '12px' }}></i>
                  <span style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: '13px', fontWeight: '500' }}>info@booknest.com</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <a href="#!" style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                     onMouseEnter={(e) => {
                       e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                       e.target.style.color = '#ffffff';
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                       e.target.style.color = 'rgba(255, 255, 255, 0.85)';
                       e.target.style.transform = 'translateY(0)';
                     }}>
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#!" style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                     onMouseEnter={(e) => {
                       e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                       e.target.style.color = '#ffffff';
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                       e.target.style.color = 'rgba(255, 255, 255, 0.85)';
                       e.target.style.transform = 'translateY(0)';
                     }}>
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#!" style={{
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                     onMouseEnter={(e) => {
                       e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                       e.target.style.color = '#ffffff';
                       e.target.style.transform = 'translateY(-2px)';
                     }}
                     onMouseLeave={(e) => {
                       e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                       e.target.style.color = 'rgba(255, 255, 255, 0.85)';
                       e.target.style.transform = 'translateY(0)';
                     }}>
                    <i className="fab fa-instagram"></i>
                  </a>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingLeft: '20px',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                  <img
                    src="https://flagcdn.com/w20/in.png"
                    alt="India Flag"
                    style={{ width: '20px', height: '15px', borderRadius: '2px' }}
                  />
                  <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.95)', fontWeight: '500' }}>IN</span>
                  <i className="fa fa-chevron-down" style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.85)' }}></i>
                </div>

                <Link
                  to="/halls"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#667eea',
                    padding: '8px 24px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    border: 'none',
                    borderRadius: '6px',
                    marginLeft: '15px',
                    transition: 'all 0.3s',
                    display: 'inline-block',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#ffffff';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.95)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                  }}
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="header" style={{
        top: '54px',
        background: '#ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-3">
              <div className="header__logo">
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <h1 style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '32px',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: '-1px'
                  }}>
                    DQBooking
                  </h1>
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

                {/* Dynamic Categories as Individual Menu Items */}
                {categories.length > 0 && (
                  <>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/category/${category.id}/items`}
                          className={isActive(`/category/${category.id}/items`)}
                        >
                          {category.displayName?.toUpperCase() || category.name?.toUpperCase()}
                        </Link>
                      </li>
                    ))}
                  </>
                )}

                {isAuthenticated ? (
                  <>
                    {!isAdmin() && !isVendor() && (
                      <li>
                        <Link to="/my-bookings" className={isActive('/my-bookings')}>
                          MY BOOKINGS
                        </Link>
                      </li>
                    )}

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
                              <Link to="/admin/categories">Manage Categories</Link>
                            </li>
                            <li>
                              <Link to="/admin/bookings">All Bookings</Link>
                            </li>
                            <li>
                              <Link to="/admin/users">Manage Users</Link>
                            </li>
                            <li>
                              <Link to="/my-bookings">My Bookings</Link>
                            </li>
                            <li>
                              <a href="#!" onClick={handleLogout}>
                                <i className="fa fa-sign-out-alt"></i> Logout
                              </a>
                            </li>
                          </ul>
                        </div>
                      </li>
                    ) : isVendor() ? (
                      <li className="header__menu__dropdown">
                        <a href="#!">
                          VENDOR
                        </a>
                        <div className="dropdown__menu">
                          <ul>
                            <li>
                              <Link to="/vendor">Dashboard</Link>
                            </li>

                            {/* Dynamic Category Submenus */}
                            {categories.map((category) => (
                              <li key={category.id}>
                                <Link to={`/vendor/items/${category.id}`}>
                                  {getCategoryMenuLabel(category.displayName || category.name)}
                                </Link>
                              </li>
                            ))}

                            <li style={{ borderTop: '1px solid #e5e7eb', marginTop: '8px', paddingTop: '8px' }}>
                              <Link to="/vendor/items/create">
                                <i className="fa fa-plus"></i> Create New Item
                              </Link>
                            </li>
                            <li>
                              <Link to="/vendor/blocked-dates">
                                <i className="fa fa-ban"></i> Blocked Dates
                              </Link>
                            </li>
                            <li>
                              <Link to="/my-bookings">My Bookings</Link>
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
