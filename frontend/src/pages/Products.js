import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PAGE_SIZE = 16;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category_id == selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="container my-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">Sản phẩm</h1>
        <p className="lead text-muted">Khám phá bộ sưu tập thiết bị cầu lông chất lượng cao</p>
      </div>
      
      {/* Filters */}
      <div className="row mb-4">
        <div className="col-lg-8 col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-4 col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-funnel"></i>
            </span>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-lg" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-search display-1 text-muted"></i>
              </div>
              <h4 className="text-muted">Không tìm thấy sản phẩm nào</h4>
              <p className="text-muted">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="text-muted mb-0">
                  Hiển thị {filteredProducts.length} sản phẩm
                </p>
              </div>
              
              <div className="row g-4">
                {pagedProducts.map((product, index) => (
                  <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                    <div className="product-card h-100 fade-in-up" style={{animationDelay: `${index * 0.1}s`, borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'}}>
                      <div className="position-relative overflow-hidden">
                        <img 
                          src={product.image_url || 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image'} 
                          className="card-img-top"
                          alt={product.name}
                          style={{ height: '220px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                        />
                        {product.stock_quantity === 0 && (
                          <div className="position-absolute top-0 start-0 m-2">
                            <span className="badge bg-danger" style={{fontWeight:600, fontSize:'1rem'}}>Hết hàng</span>
                          </div>
                        )}
                        {product.sale_price && (
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-warning text-dark">
                              SALE {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title text-dark fw-bold">{product.name}</h5>
                        <div className="mb-2 text-muted small">{product.category_name}</div>
                        <div className="mb-3">
                          {product.sale_price ? (
                            <>
                              <span className="fw-bold text-danger fs-4">
                                {new Intl.NumberFormat('vi-VN', { 
                                  style: 'currency', 
                                  currency: 'VND' 
                                }).format(product.sale_price)}
                              </span>
                              <br />
                              <small className="text-decoration-line-through text-muted">
                                {new Intl.NumberFormat('vi-VN', { 
                                  style: 'currency', 
                                  currency: 'VND' 
                                }).format(product.price)}
                              </small>
                            </>
                          ) : (
                            <span className="fw-bold text-danger fs-4">
                              {new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                              }).format(product.price)}
                            </span>
                          )}
                        </div>
                        <div className="mt-auto">
                          {product.stock_quantity === 0 ? (
                            <Link 
                              to={`/products/${product.id}`} 
                              className="btn btn-light w-100"
                              style={{fontWeight:600, fontSize:'1rem'}}
                            >
                              <i className="bi bi-cart3 me-2"></i>
                              Xem chi tiết
                            </Link>
                          ) : (
                            <Link 
                              to={`/products/${product.id}`} 
                              className="btn btn-dark w-100"
                              style={{fontWeight:600, fontSize:'1rem'}}
                            >
                              <i className="bi bi-cart3 me-2"></i>
                              Thêm vào giỏ
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page - 1)}>&lt;</button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i+1} className={`page-item${page === i+1 ? ' active' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(i+1)}>{i+1}</button>
                        </li>
                      ))}
                      <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page + 1)}>&gt;</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
