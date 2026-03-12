import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../datepicker-custom.css';
import './Hall.css';

const HallSearch = ({ onSearch, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    capacity: '',
    location: '',
    amenities: '',
    startDateTime: '',
    endDateTime: '',
  });

  // Update filters when initialFilters change (from URL params or parent)
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      const formattedFilters = { ...initialFilters };

      // Convert ISO string to Date object for DatePicker
      if (formattedFilters.startDateTime) {
        formattedFilters.startDateTime = new Date(formattedFilters.startDateTime);
      }
      if (formattedFilters.endDateTime) {
        formattedFilters.endDateTime = new Date(formattedFilters.endDateTime);
      }

      setFilters({
        capacity: formattedFilters.capacity || '',
        location: formattedFilters.location || '',
        amenities: formattedFilters.amenities || '',
        startDateTime: formattedFilters.startDateTime || '',
        endDateTime: formattedFilters.endDateTime || '',
      });
    }
  }, [initialFilters]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format dates for API if provided
    const formattedFilters = { ...filters };
    if (filters.startDateTime instanceof Date) {
      formattedFilters.startDateTime = filters.startDateTime.toISOString();
    }
    if (filters.endDateTime instanceof Date) {
      formattedFilters.endDateTime = filters.endDateTime.toISOString();
    }

    onSearch(formattedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      capacity: '',
      location: '',
      amenities: '',
      startDateTime: '',
      endDateTime: '',
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

          <div className="form-group">
            <label>From Date & Time</label>
            <DatePicker
              selected={filters.startDateTime ? new Date(filters.startDateTime) : null}
              onChange={(date) => setFilters({ ...filters, startDateTime: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              placeholderText="Select start date & time"
              minDate={new Date()}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>To Date & Time</label>
            <DatePicker
              selected={filters.endDateTime ? new Date(filters.endDateTime) : null}
              onChange={(date) => setFilters({ ...filters, endDateTime: date })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              placeholderText="Select end date & time"
              minDate={filters.startDateTime || new Date()}
              className="form-control"
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
