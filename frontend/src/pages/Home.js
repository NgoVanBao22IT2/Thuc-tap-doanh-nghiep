import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CATEGORY_IDS = {
  'tui-cau-long': 1,
  'vot-cau-long': 2,
  'giay-cau-long': 3,
  'ao-quan': 4,
  'phu-kien': 5
};

// Slides sẽ được lấy từ database

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [bestSellers, setBestSellers] = useState([]);
  const [slides, setSlides] = useState([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryStartIdx, setCategoryStartIdx] = useState(0);
  const categoriesPerView = 4;

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => setSlideIdx(idx => (idx + 1) % slides.length), 4000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      const byCat = {};
      Object.values(CATEGORY_IDS).forEach(cid => {
        byCat[cid] = res.data.filter(p => p.category_id === cid);
      });
      setProductsByCategory(byCat);
      setBestSellers(res.data.slice(0, 8));
    } catch {
      setProductsByCategory({});
      setBestSellers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlides = async () => {
    try {
      const res = await axios.get('/api/slides');
      setSlides(res.data);
    } catch {
      setSlides([]);
    }
  };

  const renderProductCard = (product) => (
    <div className="product-card h-100">
      <div className="position-relative">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="card-img-top"
          style={{ height: '350px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
        />
        {product.stock_quantity === 0 && (
          <span className="badge badge-het-hang position-absolute top-0 start-0 m-2">Hết hàng</span>
        )}
        {product.sale_price && (
          <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2">
            SALE {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
          </span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title text-dark fw-bold">{product.name}</h5>
        <div className="mb-2 text-muted small">{product.category_name}</div>
        <div className="mb-3">
          <span className="fw-bold text-danger fs-5">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.sale_price || product.price)}
          </span>
          {product.sale_price && (
            <small className="text-decoration-line-through text-muted ms-2">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
            </small>
          )}
        </div>
        <div className="mt-auto">
          {product.stock_quantity === 0 ? (
            <Link to={`/products/${product.id}`} className="btn btn-light w-100">
              <i className="bi bi-eye me-2"></i>Xem chi tiết
            </Link>
          ) : (
            <Link to={`/products/${product.id}`} className="btn btn-dark w-100">
              <i className="bi bi-cart-plus me-2"></i>Thêm vào giỏ
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  const renderCategoryBlock = (catId, title, link) => {
    const products = productsByCategory[catId] || [];
    return (
      <div className="mb-5">
        <div className="d-flex align-items-center mb-3">
          <h2 className="fw-bold text-primary">{title}</h2>
          <div className="ms-auto">
            <Link to={link} className="btn btn-outline-primary btn-sm">Xem tất cả</Link>
          </div>
        </div>
        <div className="row g-4">
          {products.slice(0, 4).map(product => (
            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
              {renderProductCard(product)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBestSellerBlock = () => (
    <div className="mb-5">
      <h2 className="fw-bold text-danger mb-4">Top sản phẩm bán chạy</h2>
      <div className="row g-4">
        {bestSellers.map(product => (
          <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
            {renderProductCard(product)}
          </div>
        ))}
      </div>
    </div>
  );

  const renderBrandsBlock = () => (
    <div className="container my-5">
      <h2 className="fw-bold text-primary mb-4">Thương hiệu nổi bật</h2>
      <div className="d-flex flex-wrap gap-4 justify-content-center">
        <img src="/images/yonex-logo.png" alt="Yonex" style={{height:'60px'}} />
        <img src="/images/lining-logo.png" alt="Li-Ning" style={{height:'60px'}} />
        <img src="/images/mizuno-logo.png" alt="Mizuno" style={{height:'60px'}} />
        <img src="/images/victor-logo.jfif" alt="Victor" style={{height:'60px'}} />
        <img src="/images/kuno-logo.jfif" alt="Kuno" style={{height:'60px'}} />
        <img src="/images/kumpoo-logo.png" alt="Kumpoo" style={{height:'60px'}} />
        <img src="/images/vs-logo.jpg" alt="VS" style={{height:'60px'}} />
      </div>
    </div>
  );

  return (
    <div>
      {/* Slide Banner */}
      {slides.length > 0 && (
        <div className="home-banner mb-5 position-relative">
          <img src={slides[slideIdx].image} alt="Banner" className="w-100" style={{maxHeight:'320px',objectFit:'cover'}} />
          <div className="home-banner-text">
            <h1 className="fw-bold" style={{fontSize:'2.5rem'}}>{slides[slideIdx].title}</h1>
            <div className="fs-4">{slides[slideIdx].description}</div>
            <div className="mt-2">
              <Link to={slides[slideIdx].link || '#'} className="btn btn-primary btn-lg mt-2">
                {slides[slideIdx].button_text || 'Xem ngay'}
              </Link>
            </div>
          </div>
          <div className="home-banner-controls position-absolute bottom-0 end-0 p-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`banner-dot${slideIdx === idx ? ' active' : ''}`}
                onClick={() => setSlideIdx(idx)}
                style={{margin: '0 4px'}}
              ></button>
            ))}
          </div>
        </div>
      )}

      {/* Danh mục sản phẩm */}
      <div className="container mb-5">
        <h2 className="fw-bold text-primary mb-4">Danh mục sản phẩm</h2>
        <div className="position-relative">
          <button
            className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
            style={{ zIndex: 2, left: -30, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onClick={() => setCategoryStartIdx(idx => Math.max(0, idx - categoriesPerView))}
            disabled={categoryStartIdx === 0}
          >
            &lt;
          </button>
          <div className="d-flex flex-row overflow-hidden" style={{ gap: 24 }}>
            {categories.slice(categoryStartIdx, categoryStartIdx + categoriesPerView).map(cat => (
              <div key={cat.id} style={{ minWidth: 240, maxWidth: 260 }}>
                <div className="card card-category h-100 d-flex flex-column align-items-center justify-content-center p-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 16, border: 'none', background: '#fff', minHeight: 320 }}>
                  <div className="d-flex align-items-center justify-content-center mb-3" style={{ width: 120, height: 120, background: '#f8f9fa', borderRadius: 16, overflow: 'hidden' }}>
                    <img
                      src={cat.image || 'https://via.placeholder.com/120x120?text=Category'}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8f9fa' }}
                    />
                  </div>
                  <h5 className="card-title text-dark fw-bold mb-2 mt-1 text-center">{cat.name}</h5>
                  <p className="card-text text-muted text-center mb-3" style={{ minHeight: 48 }}>{cat.description}</p>
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="btn btn-outline-primary w-100"
                    style={{ borderRadius: 8, fontWeight: 600, fontSize: '1rem', padding: '10px 0' }}
                  >
                    Xem sản phẩm
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
            style={{ zIndex: 2, right: -30, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onClick={() => setCategoryStartIdx(idx => Math.min(categories.length - categoriesPerView, idx + categoriesPerView))}
            disabled={categoryStartIdx + categoriesPerView >= categories.length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Sản phẩm theo danh mục */}
      <div className="container">
        {renderCategoryBlock(CATEGORY_IDS['vot-cau-long'], 'Vợt cầu lông', '/products?category=1')}
        {renderCategoryBlock(CATEGORY_IDS['giay-cau-long'], 'Giày cầu lông', '/products?category=2')}
        {renderCategoryBlock(CATEGORY_IDS['ao-quan'], 'Áo quần', '/products?category=3')}
        {renderCategoryBlock(CATEGORY_IDS['phu-kien'], 'Phụ kiện', '/products?category=4')}
      </div>

      {/* Top bán chạy */}
      <div className="container">
        {renderBestSellerBlock()}
      </div>

      {/* Thương hiệu nổi bật */}
      {renderBrandsBlock()}
    </div>
  );
};

export default Home;