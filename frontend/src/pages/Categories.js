import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">Danh mục sản phẩm</h1>
        <p className="lead text-muted">Khám phá các nhóm sản phẩm nổi bật tại Badminton Shop</p>
      </div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-lg" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {categories.map((category, idx) => (
            <div key={category.id} className="col-lg-3 col-md-4 col-sm-6">
              <div className="card h-100 shadow-sm fade-in-up" style={{animationDelay: `${idx * 0.1}s`}}>
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  <div className="mb-3">
                    <img
                      src={category.image || 'https://via.placeholder.com/120x120?text=Category'}
                      alt={category.name}
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', background: '#f8f9fa' }}
                    />
                  </div>
                  <h5 className="card-title text-dark fw-bold mb-2">{category.name}</h5>
                  <p className="card-text text-muted text-center mb-3" style={{minHeight: '48px'}}>
                    {category.description}
                  </p>
                  <Link
                    to={`/products?category=${category.id}`}
                    className="btn btn-primary w-100"
                  >
                    Xem sản phẩm
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
