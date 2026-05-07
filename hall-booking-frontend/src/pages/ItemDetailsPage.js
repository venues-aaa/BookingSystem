import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCategoryById } from '../services/categoryService';
import { getItemById, getItemDisplayName, getItemDescription, getItemCapacity, getItemPrice, getItemLocation } from '../services/itemService';
import { getItemImage, getItemImages } from '../utils/imageUtils';
import './ItemDetailsPage.css';

/**
 * ItemDetailsPage - Generic item details page for ALL categories
 *
 * Schema-driven display that works for Hall, Catering, Decoration, etc.
 * Shows item information and "Book Now" button.
 *
 * URL: /item/:itemId
 */
const ItemDetailsPage = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadItemDetails();
  }, [itemId]);

  const loadItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch item
      const itemData = await getItemById(itemId);
      setItem(itemData);

      // Fetch category
      if (itemData.categoryId) {
        const categoryData = await getCategoryById(itemData.categoryId);
        setCategory(categoryData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load item:', err);
      setError('Failed to load item details. Please try again.');
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    navigate(`/booking/${itemId}`);
  };

  if (loading) {
    return (
      <div className="item-details-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p>Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="item-details-page">
        <div className="container">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error || 'Item not found'}</p>
            <button onClick={() => navigate(-1)}>Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  // Extract schema-driven data
  const itemName = getItemDisplayName(item);
  const description = getItemDescription(item);
  const capacity = getItemCapacity(item);
  const price = getItemPrice(item);
  const location = getItemLocation(item);
  const dynamicData = item.dynamicData || {};

  // Get item images
  const mainImage = getItemImage(item);
  const allImages = getItemImages(item, 4);

  // Helper: Check if a field should be hidden from Additional Details
  const isFieldAlreadyDisplayed = (key, value) => {
    // Check if this is the field used for name
    if (value && typeof value === 'string') {
      if (itemName && value.trim() === itemName.trim()) {
        return true; // This field is the name
      }
    }

    // Check if this is the field used for price
    if (price && (parseFloat(value) === price)) {
      return true; // This field is the price
    }

    // Check if this is the field used for description
    if (description && value && typeof value === 'string' && value.trim() === description.trim()) {
      return true;
    }

    // Check if this is the field used for capacity
    if (capacity && (parseInt(value) === capacity)) {
      return true;
    }

    // Check if this is the field used for location
    if (location && value && typeof value === 'string' && value.trim() === location.trim()) {
      return true;
    }

    return false;
  };

  return (
    <div className="item-details-page" style={{ marginTop: '130px', paddingBottom: '100px' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: '30px' }}>
          <Link to="/" style={{ color: '#19191a', textDecoration: 'none' }}>Home</Link>
          <i className="fa fa-angle-right" style={{ margin: '0 10px', color: '#dfa974' }}></i>
          {category && (
            <>
              <Link to={`/category/${category.id}/items`} style={{ color: '#19191a', textDecoration: 'none' }}>
                {category.displayName}
              </Link>
              <i className="fa fa-angle-right" style={{ margin: '0 10px', color: '#dfa974' }}></i>
            </>
          )}
          <span style={{ color: '#dfa974' }}>{itemName}</span>
        </div>

        {/* Item Header */}
        <div className="item-header" style={{ marginBottom: '40px' }}>
          <div className="row">
            <div className="col-lg-8">
              <h1 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '700', color: '#19191a', marginBottom: '10px' }}>
                {itemName}
              </h1>
              {category && (
                <p style={{ fontSize: '18px', color: '#707079', marginBottom: '20px' }}>
                  <span style={{ background: '#f0f0f0', padding: '5px 15px', borderRadius: '20px' }}>
                    {category.icon} {category.displayName}
                  </span>
                </p>
              )}
            </div>
            <div className="col-lg-4 text-right">
              {price && (
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#dfa974', marginBottom: '10px' }}>
                  ₹{price.toLocaleString('en-IN')}
                  <span style={{ fontSize: '16px', color: '#707079', display: 'block' }}>per booking</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div style={{ marginBottom: '40px' }}>
          <img
            src={mainImage}
            alt={itemName}
            style={{
              width: '100%',
              height: '500px',
              objectFit: 'cover',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80';
            }}
          />
        </div>

        {/* Image Gallery (if multiple images) */}
        {allImages.length > 1 && (
          <div style={{ marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
            {allImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${itemName} ${index + 1}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        )}

        {/* Item Details */}
        <div className="row">
          <div className="col-lg-8">
            {/* Description */}
            {description && (
              <div className="item-section" style={{ marginBottom: '40px' }}>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: '28px', marginBottom: '20px' }}>About</h3>
                <p style={{ fontSize: '15px', color: '#707079', lineHeight: '1.8' }}>{description}</p>
              </div>
            )}

            {/* Key Features */}
            <div className="item-section" style={{ marginBottom: '40px' }}>
              <h3 style={{ fontFamily: "'Lora', serif", fontSize: '28px', marginBottom: '20px' }}>Key Information</h3>
              <div className="row">
                {capacity && (
                  <div className="col-md-6 mb-3">
                    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
                      <i className="fa fa-users" style={{ fontSize: '24px', color: '#dfa974', marginBottom: '10px' }}></i>
                      <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>Capacity</h5>
                      <p style={{ fontSize: '14px', color: '#707079', margin: 0 }}>{capacity} people</p>
                    </div>
                  </div>
                )}
                {location && (
                  <div className="col-md-6 mb-3">
                    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
                      <i className="fa fa-map-marker-alt" style={{ fontSize: '24px', color: '#dfa974', marginBottom: '10px' }}></i>
                      <h5 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>Location</h5>
                      <p style={{ fontSize: '14px', color: '#707079', margin: 0 }}>{location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Dynamic Fields */}
            {Object.keys(dynamicData).length > 0 && (
              <div className="item-section" style={{ marginBottom: '40px' }}>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: '28px', marginBottom: '20px' }}>Additional Details</h3>
                <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
                  {Object.entries(dynamicData).map(([key, value]) => {
                    // Skip if this field was already displayed elsewhere
                    if (isFieldAlreadyDisplayed(key, value)) {
                      return null;
                    }

                    // Skip image fields
                    if (key.toLowerCase().includes('image') || key.toLowerCase().includes('photo') || key.toLowerCase().includes('picture')) {
                      return null;
                    }

                    // Get the human-readable field label from category schema
                    let fieldLabel = key;
                    if (category && category.formSchema && category.formSchema.fields) {
                      const schemaField = category.formSchema.fields.find(f => f.id === key);
                      if (schemaField && schemaField.label) {
                        fieldLabel = schemaField.label;
                      } else {
                        // Fallback: Format field name (convert snake_case to Title Case)
                        fieldLabel = key
                          .replace(/_/g, ' ')
                          .replace(/field /gi, '')
                          .replace(/hall /gi, '')
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ');
                      }
                    }

                    // Format value
                    let displayValue = value;
                    if (Array.isArray(value)) {
                      displayValue = value.join(', ');
                    } else if (typeof value === 'object' && value !== null) {
                      // For nested objects like time ranges
                      if (value.startTime && value.endTime) {
                        displayValue = `${value.startTime} - ${value.endTime}`;
                      } else {
                        displayValue = JSON.stringify(value, null, 2);
                      }
                    }

                    // Skip empty values
                    if (!displayValue || displayValue === '') return null;

                    return (
                      <div key={key} style={{ marginBottom: '15px' }}>
                        <strong style={{ fontSize: '14px', color: '#19191a' }}>{fieldLabel}:</strong>
                        <span style={{ fontSize: '14px', color: '#707079', marginLeft: '10px' }}>{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="col-lg-4">
            <div style={{ position: 'sticky', top: '100px', padding: '30px', background: '#f9f9f9', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <h4 style={{ fontFamily: "'Lora', serif", fontSize: '24px', marginBottom: '20px' }}>Book This Item</h4>

              {price && (
                <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '5px' }}>
                  <div style={{ fontSize: '14px', color: '#707079', marginBottom: '5px' }}>Starting from</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#dfa974' }}>
                    ₹{price.toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              <button
                onClick={handleBookNow}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: '#dfa974',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#c89860'}
                onMouseLeave={(e) => e.target.style.background = '#dfa974'}
              >
                Book Now
              </button>

              <div style={{ marginTop: '20px', fontSize: '13px', color: '#707079', textAlign: 'center' }}>
                <i className="fa fa-check-circle" style={{ color: '#28a745', marginRight: '5px' }}></i>
                Instant booking confirmation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPage;
