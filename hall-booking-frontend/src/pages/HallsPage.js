import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHalls } from '../services/hallService';
import HallList from '../components/hall/HallList';
import HallSearch from '../components/hall/HallSearch';

const HallsPage = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchHalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const fetchHalls = async () => {
    setLoading(true);
    try {
      const response = await getHalls({ page, size: 12, ...filters });
      setHalls(response.halls);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch halls:', error);
      alert('Failed to load halls. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchFilters) => {
    setFilters(searchFilters);
    setPage(0);
  };

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
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: '48px', fontWeight: '400', color: '#19191a', marginBottom: '20px' }}>Available Halls</h2>
              {/* Breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px', fontFamily: "'Cabin', sans-serif" }}>
                <Link to="/" style={{ color: '#19191a', fontSize: '16px', fontWeight: '500', textDecoration: 'none' }}>Home</Link>
                <i className="fa fa-angle-right" style={{ color: '#dfa974' }}></i>
                <span style={{ color: '#dfa974' }}>Halls</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Halls Section */}
      <section style={{ paddingTop: '12px', paddingBottom: '100px' }}>
        <div className="container">

          {/* Search Filters */}
          <div className="row" style={{ marginBottom: '50px' }}>
            <div className="col-lg-12">
              <HallSearch onSearch={handleSearch} />
            </div>
          </div>

          {/* Halls Grid */}
          <div className="row">
            <div className="col-lg-12">
              <HallList halls={halls} loading={loading} />
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="row mt-5">
              <div className="col-lg-12">
                <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    className="primary-btn"
                    style={{ opacity: page === 0 ? 0.5 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Previous
                  </button>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="primary-btn"
                    style={{ opacity: page >= totalPages - 1 ? 0.5 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Next <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default HallsPage;
