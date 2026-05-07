import React from 'react';
import { Link } from 'react-router-dom';
import { getItemDisplayName, getItemDescription, getItemCapacity, getItemLocation, getItemPrice } from '../../services/itemService';
import { getItemImage } from '../../utils/imageUtils';
import './Item.css';

/**
 * ItemCard - Generic component to display any category item
 * Works for Hall, Catering, Decoration, etc.
 * Displays data from schema-driven dynamicData structure
 */
const ItemCard = ({ item }) => {
  // Get image with automatic fallback to category default
  const imageUrl = getItemImage(item);

  // Extract data from dynamic schema
  const name = getItemDisplayName(item);
  const description = getItemDescription(item);
  const capacity = getItemCapacity(item);
  const location = getItemLocation(item);
  const price = getItemPrice(item);

  return (
    <div className="item-card">
      <div className="item-card__img">
        <img src={imageUrl} alt={name} />
        {price && (
          <div className="item-card__price">
            ₹{parseFloat(price).toLocaleString('en-IN')}
            <span style={{ fontSize: '12px', display: 'block' }}>/ hour</span>
          </div>
        )}
      </div>
      <div className="item-card__text">
        <div className="item-card__rating">
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
          {name}
        </h4>
        <p style={{
          fontSize: '14px',
          color: '#707079',
          marginBottom: '15px',
          minHeight: '60px',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {description && description.length > 100
            ? description.substring(0, 100) + '...'
            : description || 'No description available'}
        </p>

        <div className="item-card__features">
          <ul>
            {capacity && (
              <li>
                <i className="fa fa-users"></i> {capacity} Guests
              </li>
            )}
            {location && (
              <li>
                <i className="fa fa-map-marker-alt"></i> {location}
              </li>
            )}
          </ul>
        </div>

        {item.amenities && (
          <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {item.amenities.split(',').slice(0, 3).map((amenity, index) => (
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

        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <Link
            to={`/item/${item.id}`}
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
              transition: 'all 0.3s',
              textDecoration: 'none'
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
            View Details
          </Link>
          <Link
            to={`/booking/${item.id}`}
            style={{
              display: 'inline-block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#fff',
              background: '#dfa974',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              padding: '8px 20px',
              borderRadius: '3px',
              transition: 'all 0.3s',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#c89860';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#dfa974';
            }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
