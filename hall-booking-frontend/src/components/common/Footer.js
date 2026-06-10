import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/categoryService';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          {/* About Widget */}
          <div className="col-lg-4 col-md-6">
            <div className="footer__widget">
              <div className="footer__logo">
                <h1>DQBooking</h1>
              </div>
              <p>
                Experience luxury and elegance in our carefully curated selection of
                premium venues and services. Make your special occasions truly unforgettable.
              </p>
              <div className="footer__social">
                <a href="#!"><i className="fab fa-facebook-f"></i></a>
                <a href="#!"><i className="fab fa-twitter"></i></a>
                <a href="#!"><i className="fab fa-instagram"></i></a>
                <a href="#!"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <div className="footer__widget">
              <h5>Quick Links</h5>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/my-bookings">My Bookings</Link></li>
                <li><a href="#!">About Us</a></li>
                <li><a href="#!">Contact</a></li>
                <li><a href="#!">FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Categories - Dynamic Services */}
          <div className="col-lg-3 col-md-6">
            <div className="footer__widget">
              <h5>Our Services</h5>
              <ul>
                {categories.length > 0 ? (
                  categories.slice(0, 6).map((category) => (
                    <li key={category.id}>
                      <Link to={`/category/${category.id}/items`}>
                        {category.displayName || category.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li><Link to="/">Explore Categories</Link></li>
                    <li><a href="#!">Browse All Services</a></li>
                  </>
                )}
                {categories.length > 6 && (
                  <li><Link to="/">View All Services</Link></li>
                )}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6">
            <div className="footer__widget">
              <h5>Contact Info</h5>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '15px', color: '#aaaab3' }}>
                  <i className="fa fa-map-marker-alt" style={{ marginRight: '10px', color: '#dfa974' }}></i>
                  123 Luxury Street, City
                </li>
                <li style={{ marginBottom: '15px', color: '#aaaab3' }}>
                  <i className="fa fa-phone" style={{ marginRight: '10px', color: '#dfa974' }}></i>
                  +1 234 567 8900
                </li>
                <li style={{ marginBottom: '15px', color: '#aaaab3' }}>
                  <i className="fa fa-envelope" style={{ marginRight: '10px', color: '#dfa974' }}></i>
                  info@sona.com
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="row">
          <div className="col-lg-12">
            <div className="footer__copyright">
              <div className="footer__copyright__text">
                Copyright &copy; {new Date().getFullYear()} DQBooking.
                All rights reserved | Designed with <i className="fa fa-heart" style={{ color: '#dfa974' }}></i> by <a href="#!">DQ Team</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
