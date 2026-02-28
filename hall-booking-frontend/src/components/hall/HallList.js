import React from 'react';
import HallCard from './HallCard';

const HallList = ({ halls, loading }) => {
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
        <p style={{ fontSize: '18px', color: '#707079' }}>Loading luxury venues...</p>
      </div>
    );
  }

  if (!halls || halls.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '100px 20px',
        background: '#f9f9f9'
      }}>
        <i className="fas fa-search fa-4x" style={{ color: '#dfa974', marginBottom: '20px' }}></i>
        <h3 style={{ fontSize: '28px', marginBottom: '15px', color: '#19191a' }}>No Halls Found</h3>
        <p style={{ fontSize: '16px', color: '#707079' }}>
          Try adjusting your search filters to find the perfect venue
        </p>
      </div>
    );
  }

  return (
    <div className="row">
      {halls.map((hall) => (
        <div key={hall.id} className="col-lg-4 col-md-6">
          <HallCard hall={hall} />
        </div>
      ))}
    </div>
  );
};

export default HallList;
