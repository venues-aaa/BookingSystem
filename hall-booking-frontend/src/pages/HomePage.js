import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItemsByCategory } from '../services/itemService';
import { getCategories } from '../services/categoryService';
import ItemSearch from '../components/hall/ItemSearch';
import ItemCard from '../components/hall/ItemCard';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoryItems, setCategoryItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
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

  // Fetch all categories and their items for homepage
  useEffect(() => {
    loadCategoriesAndItems();
  }, []);

  const loadCategoriesAndItems = async () => {
    setLoading(true);
    try {
      // Fetch all active categories
      const categoriesData = await getCategories();
      setCategories(categoriesData);

      // Fetch items for each category (6 items per category for homepage)
      const itemsData = {};
      for (const category of categoriesData) {
        try {
          const response = await getItemsByCategory(category.name, { page: 0, size: 6 });
          itemsData[category.id] = response.data || [];
        } catch (error) {
          console.error(`Failed to fetch items for category ${category.name}:`, error);
          itemsData[category.id] = [];
        }
      }
      setCategoryItems(itemsData);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    // Clean up empty filters
    const cleanFilters = Object.fromEntries(
      Object.entries(searchFilters).filter(([_, value]) => value !== '')
    );

    // Handle category filter separately for home page
    if (cleanFilters.categoryId) {
      setSelectedCategoryId(cleanFilters.categoryId);
      // Remove categoryId from other filters for navigation
      const { categoryId, ...otherFilters } = cleanFilters;

      // If there are other filters, navigate to category page with filters
      if (Object.keys(otherFilters).length > 0) {
        const queryParams = new URLSearchParams(otherFilters).toString();
        navigate(`/category/${categoryId}/items?${queryParams}`);
      }
    } else {
      setSelectedCategoryId('');

      // If there are other filters, navigate to halls page with filters
      if (Object.keys(cleanFilters).length > 0) {
        const queryParams = new URLSearchParams(cleanFilters).toString();
        navigate(`/halls?${queryParams}`);
      }
    }
  };

  const viewAllCategory = (category) => {
    navigate(`/category/${category.id}/items`);
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
                <h2>Welcome to DQBooking</h2>
                <p>
                  We offer the finest selection of elegant venues and services for weddings, corporate events,
                  conferences, and celebrations. Each venue is carefully curated to ensure
                  your event is nothing short of extraordinary.
                </p>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="row mt-5">
            <div className="col-lg-12">
              <ItemSearch onSearch={handleSearch} showCategoryFilter={true} />
            </div>
          </div>

          {/* Dynamic Categories Sections */}
          {loading ? (
            <div className="row mt-5">
              <div className="col-lg-12 text-center" style={{ padding: '60px 0' }}>
                <div className="spinner-border text-gold" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="sr-only">Loading...</span>
                </div>
                <p style={{ marginTop: '20px', color: '#707079' }}>Loading categories...</p>
              </div>
            </div>
          ) : categories.length > 0 ? (
            categories
              .filter((category) => !selectedCategoryId || category.id === selectedCategoryId)
              .map((category) => {
              const items = categoryItems[category.id] || [];
              if (items.length === 0) return null; // Skip empty categories

              return (
                <div key={category.id} style={{ marginTop: '60px' }}>
                  {/* Category Section Header */}
                  <div className="row">
                    <div className="col-lg-12">
                      <div className="section-title" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span>Featured Services</span>
                          <h2>{category.icon} {category.displayName}</h2>
                          {category.description && (
                            <p style={{ fontSize: '14px', color: '#707079', marginTop: '10px' }}>
                              {category.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => viewAllCategory(category)}
                          className="primary-btn"
                          style={{ marginTop: '0' }}
                        >
                          View All {category.displayName}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Category Items Grid - 2 rows x 3 columns */}
                  <div className="row">
                    {items.slice(0, 6).map((item) => (
                      <div className="col-lg-4 col-md-6" key={item.id} style={{ marginBottom: '30px' }}>
                        <ItemCard item={item} category={category} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="row mt-5">
              <div className="col-lg-12 text-center" style={{ padding: '40px 0' }}>
                <p style={{ fontSize: '18px', color: '#707079' }}>No categories available at the moment.</p>
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
