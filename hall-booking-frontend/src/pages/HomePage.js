import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHalls } from '../services/hallService';
import HallSearch from '../components/hall/HallSearch';
import HallCard from '../components/hall/HallCard';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [premiumHalls, setPremiumHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hero slider images
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1920&q=80',
      title: 'Discover Your Perfect',
      highlight: 'Venue',
      subtitle: 'Luxury halls and event spaces for your special occasions.'
    },
    {
      url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1920&q=80',
      title: 'Elegant Spaces for',
      highlight: 'Memorable Events',
      subtitle: 'Experience sophistication and style in every detail.'
    },
    {
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80',
      title: 'Your Dream Event',
      highlight: 'Starts Here',
      subtitle: 'Book the finest halls for weddings, conferences, and celebrations.'
    }
  ];

  // Preload hero images
  useEffect(() => {
    heroImages.forEach((image) => {
      const img = new Image();
      img.src = image.url;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-rotate hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch premium halls for homepage
  useEffect(() => {
    fetchPremiumHalls();
  }, []);

  const fetchPremiumHalls = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await getHalls({ page: 0, size: 6, ...filters });
      setPremiumHalls(response.halls || []);
    } catch (error) {
      console.error('Failed to fetch halls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    // Clean up empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(searchFilters).filter(([_, value]) => value !== '')
    );

    if (Object.keys(cleanFilters).length > 0) {
      // If there are filters, navigate to halls page with filters
      const queryParams = new URLSearchParams(cleanFilters).toString();
      navigate(`/halls?${queryParams}`);
    } else {
      // If no filters, just refresh the premium halls
      fetchPremiumHalls();
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <>
      {/* Hero Slider Section */}
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(25, 25, 26, 0.5), rgba(25, 25, 26, 0.5)), url('${heroImages[currentSlide].url}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'all 0.8s ease-in-out',
        }}
      >
        <div className="container">
          <div className="hero__content">
            <h1 className="animate__animated animate__fadeInDown" key={currentSlide}>
              {heroImages[currentSlide].title} <span className="text-gold">{heroImages[currentSlide].highlight}</span>
            </h1>
            <p className="animate__animated animate__fadeInUp">
              {heroImages[currentSlide].subtitle}
            </p>
            <a href="/halls" className="primary-btn animate__animated animate__fadeInUp">
              Explore Halls
            </a>
          </div>
        </div>

        {/* Slider Dots */}
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '10px'
        }}>
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '2px solid #ffffff',
                background: currentSlide === index ? '#dfa974' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: '30px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid #ffffff',
            color: '#ffffff',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          aria-label="Previous slide"
        >
          <i className="fa fa-angle-left"></i>
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: '30px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid #ffffff',
            color: '#ffffff',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          aria-label="Next slide"
        >
          <i className="fa fa-angle-right"></i>
        </button>
      </section>

      {/* About Section */}
      <section style={{ paddingTop: '40px', paddingBottom: '100px' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title">
                <span>Luxury Experience</span>
                <h2>Welcome to BookNest Hall Booking</h2>
                <p>
                  We offer the finest selection of elegant halls for weddings, corporate events,
                  conferences, and celebrations. Each venue is carefully curated to ensure
                  your event is nothing short of extraordinary.
                </p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="row mt-5">
            <div className="col-lg-12">
              <HallSearch onSearch={handleSearch} />
            </div>
          </div>

          {/* Premium Halls Section */}
          <div className="row mt-5">
            <div className="col-lg-12">
              <div className="section-title" style={{ marginBottom: '40px' }}>
                <span>Featured Venues</span>
                <h2>Premium Halls</h2>
              </div>
            </div>
          </div>

          {/* Halls Grid - 2 rows x 3 columns */}
          {loading ? (
            <div className="row">
              <div className="col-lg-12 text-center" style={{ padding: '60px 0' }}>
                <div className="spinner-border text-gold" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="sr-only">Loading...</span>
                </div>
                <p style={{ marginTop: '20px', color: '#707079' }}>Loading premium halls...</p>
              </div>
            </div>
          ) : premiumHalls.length > 0 ? (
            <div className="row">
              {premiumHalls.map((hall) => (
                <div className="col-lg-4 col-md-6" key={hall.id} style={{ marginBottom: '30px' }}>
                  <HallCard hall={hall} />
                </div>
              ))}
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-12 text-center" style={{ padding: '40px 0' }}>
                <p style={{ fontSize: '18px', color: '#707079' }}>No halls available at the moment.</p>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="row mt-5 pt-5" style={{ borderTop: '1px solid #e5e5e5' }}>
            <div className="col-lg-4 col-md-6">
              <div className="text-center mb-4">
                <i className="fas fa-crown fa-3x text-gold mb-3"></i>
                <h4>Premium Venues</h4>
                <p>Handpicked luxury halls with world-class facilities</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="text-center mb-4">
                <i className="fas fa-calendar-check fa-3x text-gold mb-3"></i>
                <h4>Easy Booking</h4>
                <p>Seamless reservation process with instant confirmation</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="text-center mb-4">
                <i className="fas fa-headset fa-3x text-gold mb-3"></i>
                <h4>24/7 Support</h4>
                <p>Dedicated team to assist you every step of the way</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default HomePage;
