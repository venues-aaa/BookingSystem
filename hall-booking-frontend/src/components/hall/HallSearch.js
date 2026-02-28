import React, { useState } from 'react';
import './Hall.css';

const HallSearch = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    capacity: '',
    location: '',
    amenities: '',
  });

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      capacity: '',
      location: '',
      amenities: '',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  return (
    <div className="hall-search card">
      <h3>Search Halls</h3>
      <form onSubmit={handleSubmit}>
        <div className="search-grid">
          <div className="form-group">
            <label>Minimum Capacity</label>
            <input
              type="number"
              name="capacity"
              value={filters.capacity}
              onChange={handleChange}
              placeholder="e.g., 50"
              min="1"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleChange}
              placeholder="e.g., Downtown"
            />
          </div>

          <div className="form-group">
            <label>Amenities</label>
            <input
              type="text"
              name="amenities"
              value={filters.amenities}
              onChange={handleChange}
              placeholder="e.g., WiFi, Projector"
            />
          </div>
        </div>

        <div className="search-actions">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default HallSearch;
