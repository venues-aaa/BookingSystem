import React from 'react';
import { Link } from 'react-router-dom';

const HallCard = ({ hall }) => {
  // Default luxury hall images if no image provided
  const defaultImages = [
    'https://images.unsplash.com/photo-1519167758481-83f29da8f969?w=800&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
  ];

  const imageUrl = hall.imageUrl || defaultImages[hall.id % 3];

  return (
    <div className="hall-card">
      <div className="hall-card__img">
        <img src={imageUrl} alt={hall.name} />
        {hall.pricePerHour && (
          <div className="hall-card__price">
            ₹{parseFloat(hall.pricePerHour).toLocaleString('en-IN')}
            <span style={{ fontSize: '12px', display: 'block' }}>/ hour</span>
          </div>
        )}
      </div>
      <div className="hall-card__text">
        <div className="hall-card__rating">
          <i className="fa fa-star"></i>
          <i className="fa fa-star"></i>
          <i className="fa fa-star"></i>
          <i className="fa fa-star"></i>
          <i className="fa fa-star"></i>
        </div>
        <h4 style={{
          fontFamily: "'Lora', serif",
          fontSize: '22px',
          fontWeight: '700',
          color: '#19191a',
          marginBottom: '15px',
          lineHeight: '1.2'
        }}>
          {hall.name}
        </h4>
        <p style={{
          fontSize: '14px',
          color: '#707079',
          marginBottom: '15px',
          minHeight: '60px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {hall.description && hall.description.length > 100
            ? hall.description.substring(0, 100) + '...'
            : hall.description || 'Elegant venue for your special events'}
        </p>

        <div className="hall-card__features">
          <ul>
            <li>
              <i className="fa fa-users"></i> {hall.capacity} Guests
            </li>
            <li>
              <i className="fa fa-map-marker-alt"></i> {hall.location || 'Premium Location'}
            </li>
          </ul>
        </div>

        {hall.amenities && (
          <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {hall.amenities.split(',').slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                style={{
                  fontSize: '11px',
                  background: '#f9f9f9',
                  padding: '4px 10px',
                  borderRadius: '3px',
                  color: '#707079',
                }}
              >
                {amenity.trim()}
              </span>
            ))}
          </div>
        )}

        <Link
          to={`/halls/${hall.id}`}
          style={{
            display: 'inline-block',
            fontSize: '13px',
            fontWeight: '700',
            color: '#19191a',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            position: 'relative',
            paddingBottom: '5px',
            borderBottom: '2px solid #dfa974',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.color = '#dfa974';
            e.target.style.paddingLeft = '5px';
          }}
          onMouseLeave={(e) => {
            e.target.style.color = '#19191a';
            e.target.style.paddingLeft = '0';
          }}
        >
          More Details <i className="fa fa-long-arrow-alt-right" style={{ marginLeft: '8px' }}></i>
        </Link>
      </div>
    </div>
  );
};

export default HallCard;
