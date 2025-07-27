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

const SLIDES = [
  { image: '/images/slides/slide1.jpg', title: 'Vợt Yonex 2024', desc: 'Bộ sưu tập vợt Yonex mới nhất', link: '/products?category=1' },
  { image: '/images/slides/slide2.jpg', title: 'Giày cầu lông sale 30%', desc: 'Khuyến mãi lớn cho giày cầu lông', link: '/products?category=2' },
  { image: '/images/slides/slide3.jpg', title: 'Phụ kiện cao cấp', desc: 'Túi vợt, cước, băng quấn chính hãng', link: '/products?category=4' }
];

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [bestSellers, setBestSellers] = useState([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    const timer = setInterval(() => setSlideIdx(idx => (idx + 1) % SLIDES.length), 4000);
    return () => clearInterval(timer);
  }, []);

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

  const renderProductCard = (product) => (
    <div className="product-card h-100">
      <div className="position-relative">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="card-img-top"
          style={{ height: '160px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
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
      <div className="home-banner mb-5 position-relative">
        <img src={SLIDES[slideIdx].image} alt="Banner" className="w-100" style={{maxHeight:'320px',objectFit:'cover'}} />
        <div className="home-banner-text">
          <h1 className="fw-bold" style={{fontSize:'2.5rem'}}>{SLIDES[slideIdx].title}</h1>
          <div className="fs-4">{SLIDES[slideIdx].desc}</div>
          <div className="mt-2">
            <Link to={SLIDES[slideIdx].link} className="btn btn-primary btn-lg mt-2">Xem ngay</Link>
          </div>
        </div>
        <div className="home-banner-controls position-absolute bottom-0 end-0 p-3">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`banner-dot${slideIdx === idx ? ' active' : ''}`}
              onClick={() => setSlideIdx(idx)}
              style={{margin: '0 4px'}}
            ></button>
          ))}
        </div>
      </div>

      {/* Danh mục sản phẩm */}
      <div className="container mb-5">
        <h2 className="fw-bold text-primary mb-4">Danh mục sản phẩm</h2>
        <div className="row g-4">
          {categories.map(cat => (
            <div key={cat.id} className="col-lg-3 col-md-4 col-sm-6">
              <div className="card h-100 shadow-sm card-category">
                <div className="card-body d-flex flex-column align-items-center justify-content-center">
                  <img
                    src={cat.image || 'https://via.placeholder.com/120x120?text=Category'}
                    alt={cat.name}
                    style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', background: '#f8f9fa' }}
                  />
                  <h5 className="card-title text-dark fw-bold mb-2 mt-3">{cat.name}</h5>
                  <p className="card-text text-muted text-center mb-3" style={{minHeight: '48px'}}>
                    {cat.description}
                  </p>
                  <Link
                    to={`/products?category=${cat.id}`}
                    className="btn btn-primary w-100"
                  >
                    Xem sản phẩm
                  </Link>
                </div>
              </div>
            </div>
          ))}
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