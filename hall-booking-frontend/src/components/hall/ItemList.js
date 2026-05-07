import React from 'react';
import ItemCard from './ItemCard';

/**
 * ItemList - Generic list component for any category
 * Works for Hall, Catering, Decoration, etc.
 */
const ItemList = (props) => {
  const { items, loading, categoryName = 'Items', halls } = props;
  // Backward compatibility: support both 'items' and 'halls' props
  const displayItems = items || halls || [];
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="loading"></div>
        <p style={{ fontSize: '18px', color: '#707079' }}>Loading {categoryName.toLowerCase()}...</p>
      </div>
    );
  }

  if (!displayItems || displayItems.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '100px 20px',
        background: '#f9f9f9'
      }}>
        <i className="fas fa-search fa-4x" style={{ color: '#dfa974', marginBottom: '20px' }}></i>
        <h3 style={{ fontSize: '28px', marginBottom: '15px', color: '#19191a' }}>No {categoryName} Found</h3>
        <p style={{ fontSize: '16px', color: '#707079' }}>
          Try adjusting your search filters
        </p>
      </div>
    );
  }

  return (
    <div className="row">
      {displayItems.map((item) => (
        <div key={item.id} className="col-lg-4 col-md-6">
          <ItemCard item={item} />
        </div>
      ))}
    </div>
  );
};

export default ItemList;
