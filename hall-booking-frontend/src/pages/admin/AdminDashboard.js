import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStatistics } from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const data = await getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      alert('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        flexDirection: 'column',
        gap: '20px',
        marginTop: '130px'
      }}>
        <div className="loading"></div>
        <p style={{ fontSize: '18px', color: '#707079' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div style={{
        background: '#ffffff',
        padding: '60px 0 10px',
        marginTop: '130px',
        textAlign: 'center'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a', marginBottom: '20px' }}>Admin Dashboard</h2>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontFamily: "'Cabin', sans-serif" }}>
                <Link to="/" style={{ color: '#19191a', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <span style={{ color: '#dfa974' }}>Admin Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Section */}
      <section style={{ paddingTop: '12px', paddingBottom: '100px' }}>
        <div className="container">
          {/* Dashboard Header */}
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title" style={{ marginBottom: '50px' }}>
                <span>Administration</span>
                <h2>Dashboard Overview</h2>
                <p style={{ marginTop: '15px' }}>
                  Welcome to the admin panel. Monitor your hall booking system performance.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <div className="stat-card animate__animated animate__fadeInUp">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h3>{stats?.totalBookings || 0}</h3>
                    <p>Total Bookings</p>
                  </div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    <i className="fa fa-calendar-alt" style={{ color: '#ffffff' }}></i>
                  </div>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#28a745',
                  fontWeight: '600'
                }}>
                  <i className="fa fa-arrow-up" style={{ marginRight: '5px' }}></i>
                  All time bookings
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card animate__animated animate__fadeInUp" style={{ animationDelay: '0.1s' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h3>{stats?.confirmedBookings || 0}</h3>
                    <p>Confirmed</p>
                  </div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    <i className="fa fa-check-circle" style={{ color: '#ffffff' }}></i>
                  </div>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#28a745',
                  fontWeight: '600'
                }}>
                  <i className="fa fa-check" style={{ marginRight: '5px' }}></i>
                  Active reservations
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card animate__animated animate__fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h3>{stats?.totalUsers || 0}</h3>
                    <p>Total Users</p>
                  </div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    <i className="fa fa-users" style={{ color: '#ffffff' }}></i>
                  </div>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#17a2b8',
                  fontWeight: '600'
                }}>
                  <i className="fa fa-user-plus" style={{ marginRight: '5px' }}></i>
                  Registered accounts
                </div>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stat-card animate__animated animate__fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h3 style={{ color: '#dfa974' }}>₹{parseFloat(stats?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    <p>Total Revenue</p>
                  </div>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    <i className="fa fa-dollar-sign" style={{ color: '#ffffff' }}></i>
                  </div>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#dfa974',
                  fontWeight: '600'
                }}>
                  <i className="fa fa-chart-line" style={{ marginRight: '5px' }}></i>
                  Total earnings
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="row" style={{ marginTop: '60px' }}>
            <div className="col-lg-12">
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '28px', marginBottom: '10px', color: '#19191a' }}>Quick Actions</h3>
                <p style={{ color: '#707079' }}>Manage your hall booking system efficiently</p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6">
              <Link to="/admin/halls" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#ffffff',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  padding: '40px 30px',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  marginBottom: '30px',
                  borderTop: '4px solid #dfa974',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #dfa974 0%, #c7935d 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 25px',
                    fontSize: '32px'
                  }}>
                    <i className="fa fa-building" style={{ color: '#ffffff' }}></i>
                  </div>
                  <h4 style={{ fontSize: '22px', marginBottom: '15px', color: '#19191a' }}>Manage Halls</h4>
                  <p style={{ color: '#707079', fontSize: '14px', lineHeight: '1.6' }}>
                    Create, edit, and delete hall listings. Update pricing and availability.
                  </p>
                </div>
              </Link>
            </div>

            <div className="col-lg-4 col-md-6">
              <div style={{
                background: '#ffffff',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                padding: '40px 30px',
                textAlign: 'center',
                transition: 'all 0.3s',
                marginBottom: '30px',
                borderTop: '4px solid #667eea',
                cursor: 'pointer',
                opacity: 0.7
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '0.7';
              }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 25px',
                  fontSize: '32px'
                }}>
                  <i className="fa fa-calendar-check" style={{ color: '#ffffff' }}></i>
                </div>
                <h4 style={{ fontSize: '22px', marginBottom: '15px', color: '#19191a' }}>View Bookings</h4>
                <p style={{ color: '#707079', fontSize: '14px', lineHeight: '1.6' }}>
                  Monitor all bookings, view details, and manage reservations.
                </p>
                <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>(Coming Soon)</span>
              </div>
            </div>

            <div className="col-lg-4 col-md-6">
              <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#ffffff',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                  padding: '40px 30px',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  marginBottom: '30px',
                  borderTop: '4px solid #f093fb',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 25px',
                    fontSize: '32px'
                  }}>
                    <i className="fa fa-users-cog" style={{ color: '#ffffff' }}></i>
                  </div>
                  <h4 style={{ fontSize: '22px', marginBottom: '15px', color: '#19191a' }}>Manage Users</h4>
                  <p style={{ color: '#707079', fontSize: '14px', lineHeight: '1.6' }}>
                    Create, edit, and delete user accounts. Manage roles and permissions.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
