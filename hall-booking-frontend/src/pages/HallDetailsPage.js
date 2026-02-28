import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHallById } from '../services/hallService';
import { useAuth } from '../context/AuthContext';

const HallDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHallDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchHallDetails = async () => {
    try {
      const data = await getHallById(id);
      setHall(data);
    } catch (error) {
      console.error('Failed to fetch hall details:', error);
      alert('Failed to load hall details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      alert('Please login to book a hall');
      navigate('/login');
      return;
    }
    navigate(`/booking/${id}`);
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1519167758481-83f29da8f969?w=1200&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  ];

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
        <p style={{ fontSize: '18px', color: '#707079' }}>Loading hall details...</p>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="container" style={{ marginTop: '150px', textAlign: 'center', paddingBottom: '100px' }}>
        <i className="fas fa-exclamation-triangle fa-4x" style={{ color: '#dfa974', marginBottom: '20px' }}></i>
        <h2 style={{ marginBottom: '15px' }}>Hall Not Found</h2>
        <p style={{ color: '#707079', marginBottom: '30px' }}>The hall you're looking for doesn't exist.</p>
        <Link to="/" className="primary-btn">
          <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i>
          Back to Halls
        </Link>
      </div>
    );
  }

  const imageUrl = hall.imageUrl || defaultImages[hall.id % 3];

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
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a', marginBottom: '20px' }}>{hall.name}</h2>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontFamily: "'Cabin', sans-serif" }}>
                <Link to="/" style={{ color: '#19191a', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <Link to="/halls" style={{ color: '#707079', textDecoration: 'none' }}>Halls</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <span style={{ color: '#dfa974' }}>{hall.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hall Details Section */}
      <section style={{ paddingTop: '12px', paddingBottom: '100px' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Main Image */}
              <div style={{
                marginBottom: '40px',
                overflow: 'hidden',
                borderRadius: '0',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={imageUrl}
                  alt={hall.name}
                  style={{ width: '100%', height: '500px', objectFit: 'cover' }}
                />
              </div>

              {/* Hall Info */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ marginBottom: '30px' }}>
                  <h2 style={{ fontSize: '36px', marginBottom: '10px', color: '#19191a' }}>{hall.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                    <div className="hall-card__rating">
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                      <i className="fa fa-star"></i>
                    </div>
                    {hall.location && (
                      <span style={{ color: '#707079', fontSize: '15px' }}>
                        <i className="fa fa-map-marker-alt" style={{ color: '#dfa974', marginRight: '5px' }}></i>
                        {hall.location}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '30px 0',
                  marginBottom: '30px'
                }}>
                  <h4 style={{ marginBottom: '20px' }}>About This Hall</h4>
                  <p style={{ lineHeight: '1.8', color: '#707079', fontSize: '15px' }}>
                    {hall.description || 'Experience luxury and elegance in this carefully curated event space. Perfect for weddings, corporate events, conferences, and special celebrations.'}
                  </p>
                </div>

                {/* Features */}
                <div style={{ marginBottom: '30px' }}>
                  <h4 style={{ marginBottom: '20px' }}>Hall Features</h4>
                  <div className="row">
                    <div className="col-md-6">
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <i className="fa fa-check" style={{ color: '#dfa974', marginRight: '10px' }}></i>
                          <strong>Capacity:</strong> {hall.capacity} Guests
                        </li>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <i className="fa fa-check" style={{ color: '#dfa974', marginRight: '10px' }}></i>
                          <strong>Location:</strong> {hall.location || 'Premium Location'}
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                          <i className="fa fa-check" style={{ color: '#dfa974', marginRight: '10px' }}></i>
                          <strong>Status:</strong> {hall.isActive ? 'Available' : 'Not Available'}
                        </li>
                        {hall.pricePerHour && (
                          <li style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                            <i className="fa fa-check" style={{ color: '#dfa974', marginRight: '10px' }}></i>
                            <strong>Price:</strong> ₹{parseFloat(hall.pricePerHour).toLocaleString('en-IN')} per hour
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {hall.amenities && (
                  <div>
                    <h4 style={{ marginBottom: '20px' }}>Amenities & Services</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                      {hall.amenities.split(',').map((amenity, index) => (
                        <div
                          key={index}
                          style={{
                            background: '#f9f9f9',
                            padding: '12px 20px',
                            borderLeft: '3px solid #dfa974',
                            fontSize: '14px',
                            color: '#19191a',
                            fontWeight: '500'
                          }}
                        >
                          <i className="fa fa-circle" style={{ fontSize: '6px', marginRight: '10px', color: '#dfa974' }}></i>
                          {amenity.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="col-lg-4">
              <div style={{
                background: '#ffffff',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                padding: '40px 30px',
                position: 'sticky',
                top: '110px'
              }}>
                {hall.pricePerHour && (
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <span style={{ fontSize: '18px', color: '#707079' }}>Starting from</span>
                    <h2 style={{ fontSize: '48px', color: '#dfa974', margin: '10px 0', fontFamily: 'Lora, serif' }}>
                      ₹{parseFloat(hall.pricePerHour).toLocaleString('en-IN')}
                    </h2>
                    <span style={{ fontSize: '14px', color: '#707079', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Per Hour
                    </span>
                  </div>
                )}

                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '25px 0',
                  marginBottom: '30px'
                }}>
                  <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#707079' }}>
                      <i className="fa fa-users" style={{ color: '#dfa974', marginRight: '8px' }}></i>
                      Max Capacity
                    </span>
                    <strong style={{ color: '#19191a' }}>{hall.capacity} Guests</strong>
                  </div>
                  <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#707079' }}>
                      <i className="fa fa-clock" style={{ color: '#dfa974', marginRight: '8px' }}></i>
                      Availability
                    </span>
                    <strong style={{ color: hall.isActive ? '#28a745' : '#dc3545' }}>
                      {hall.isActive ? 'Available' : 'Booked'}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  className="primary-btn"
                  style={{ width: '100%', marginBottom: '15px' }}
                >
                  <i className="fa fa-calendar-check" style={{ marginRight: '8px' }}></i>
                  Book This Hall
                </button>

                <p style={{ textAlign: 'center', fontSize: '13px', color: '#707079', marginTop: '20px' }}>
                  <i className="fa fa-info-circle" style={{ marginRight: '5px' }}></i>
                  Instant confirmation upon booking
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HallDetailsPage;
