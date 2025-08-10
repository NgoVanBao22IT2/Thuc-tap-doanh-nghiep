import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CATEGORY_IDS = {
  
  'vot-cau-long': 1,
  'ao-cau-long': 2,
  'quan-cau-long': 3,
  'vay-cau-long': 4,
  'tui-cau-long': 5,
  'giay-cau-long': 6,
  'phu-kien': 7,

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
  const categoriesPerView = 6;
  const navigate = useNavigate();

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

  // Sử dụng card sản phẩm giống Products.js, click vào card sẽ điều hướng tới chi tiết
  const renderProductCard = (product) => (
    <div
      className="product-card h-100 fade-in-up"
      style={{
        animationDelay: '0s',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        backgroundColor: '#fff',
        transition: 'transform 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="position-relative overflow-hidden mb-2">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image'}
          className="card-img-top"
          alt={product.name}
          style={{
            height: '320px',
            objectFit: 'cover',
            width: '100%',
          }}
        />
        {product.stock_quantity === 0 && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-danger" style={{ fontWeight: 500, fontSize: '0.8rem' }}>Hết hàng</span>
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
        <h5 className="card-title text-dark fw-semibold" style={{ fontSize: '1rem', minHeight: '3em', paddingLeft: '10px' }}>
          {product.name}
        </h5>
        <div className="mb-1 text-muted small" style={{paddingLeft: '10px'}}>{product.category_name}</div>
        <div className="mb-2 d-flex align-items-center gap-2" style={{paddingLeft: '10px'}}>
          {product.sale_price ? (
            <>
              <span className="fw-bold text-danger fs-5">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.sale_price)}
              </span>
              <span className="text-muted text-decoration-line-through" style={{fontSize: '1rem'}}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(product.price)}
              </span>
            </>
          ) : (
            <span className="fw-bold text-danger fs-5">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(product.price)}
            </span>
          )}
        </div>
        <div className="mt-auto">
          <button
            className={`btn ${product.stock_quantity === 0 ? 'btn-outline-secondary' : 'btn-dark'} w-100`}
            style={{ fontWeight: 600, fontSize: '0.95rem', padding: '10px' }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${product.id}`);
            }}
          >
            {product.stock_quantity === 0 ? 'Xem chi tiết' : 'Xem sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCategoryBlock = (catId, title, link) => {
    let products = productsByCategory[catId] || [];
    // Nếu là Phụ kiện, lấy tất cả sản phẩm thuộc các danh mục con và chính nó, không phân nhóm
    if (title === 'Phụ kiện') {
      const parentCat = categories.find(cat => cat.id === catId);
      if (parentCat) {
        const childCatIds = categories.filter(cat => cat.parent_id === parentCat.id).map(cat => cat.id);
        products = Object.values(productsByCategory)
          .flat()
          .filter(p => childCatIds.includes(p.category_id) || p.category_id === parentCat.id);
      }
    }
    // Đường dẫn đúng cho nút "Xem tất cả"
    const categoryObj = categories.find(cat => cat.id === catId);
    const categoryLink = categoryObj ? `/products?category=${categoryObj.id}` : link;
    return (
      <div className="mb-5">
        <div className="d-flex align-items-center mb-3">
          <h2 className="fw-bold text-dark">{title}</h2>
          <div className="ms-auto">
            <Link to={categoryLink} className="btn btn-outline-dark btn-sm">Xem tất cả</Link>
          </div>
        </div>
        <div className="row g-4">
          {products.slice(0, 4).map(product => (
            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
              <div
                className="product-card h-100 fade-in-up"
                style={{
                  animationDelay: '0s',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="position-relative overflow-hidden mb-2">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/300x200/f8f9fa/6c757d?text=No+Image'}
                    className="card-img-top"
                    alt={product.name}
                    style={{
                      height: '320px',
                      objectFit: 'cover',
                      width: '100%',
                    }}
                  />
                  {product.stock_quantity === 0 && (
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className="badge bg-danger" style={{ fontWeight: 500, fontSize: '0.8rem' }}>Hết hàng</span>
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
                  <h5 className="card-title text-dark fw-semibold" style={{ fontSize: '1rem', minHeight: '3em', paddingLeft: '10px' }}>
                    {product.name}
                  </h5>
                  <div className="mb-1 text-muted small" style={{paddingLeft: '10px'}}>{product.category_name}</div>
                  <div className="mb-2 d-flex align-items-center gap-2" style={{paddingLeft: '10px'}}>
                    {product.sale_price ? (
                      <>
                        <span className="fw-bold text-danger fs-5">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.sale_price)}
                        </span>
                        <span className="text-muted text-decoration-line-through" style={{fontSize: '1rem'}}>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="fw-bold text-danger fs-5">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(product.price)}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <button
                      className={`btn ${product.stock_quantity === 0 ? 'btn-outline-secondary' : 'btn-dark'} w-100`}
                      style={{ fontWeight: 600, fontSize: '0.95rem', padding: '10px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${product.id}`);
                      }}
                    >
                      {product.stock_quantity === 0 ? 'Xem chi tiết' : 'Xem sản phẩm'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBestSellerBlock = () => (
    <div className="mb-5">
      <h2 className="fw-bold text-success mb-4">Top sản phẩm bán chạy</h2>
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
      <h2 className="fw-bold text-success mb-4">Thương hiệu nổi bật</h2>
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

  // Thêm hàm renderSaleBannerBlock để hiển thị banner sale
  const renderSaleBannerBlock = () => (
    <div className="container mb-5">
      <div
        className="sale-banner-block d-flex flex-column align-items-center justify-content-center"
        style={{
          background: 'linear-gradient(90deg, #fffbea 60%, #ffe0b2 100%)',
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(255,193,7,0.10)',
          padding: '32px 0',
          margin: '0 auto',
          maxWidth: 1200,
          position: 'relative',
        }}
      >
        <div className="text-center mb-3">
          <h2 className="fw-bold text-warning" style={{fontSize: '2.2rem', letterSpacing: 1}}>
            <i className="bi bi-fire"></i> Sale off
          </h2>
          <div style={{
            width: 80,
            height: 6,
            background: 'linear-gradient(90deg, #ff9800 60%, #fffde7 100%)',
            borderRadius: 4,
            margin: '0 auto 18px auto'
          }} />
        </div>
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mb-4" style={{width: '100%'}}>
          <img
            src="/images/sale1.webp"
            alt="Sale Banner 1"
            style={{maxWidth: 350, borderRadius: 12, objectFit: 'cover', boxShadow: '0 2px 12px #ffe08280'}}
          />
          <img
            src="/images/sale2.webp"
            alt="Sale Banner 2"
            style={{maxWidth: 350, borderRadius: 12, objectFit: 'cover', boxShadow: '0 2px 12px #ffe08280'}}
          />
          <img
            src="/images/sale3.webp"
            alt="Sale Banner 3"
            style={{maxWidth: 350, borderRadius: 12, objectFit: 'cover', boxShadow: '0 2px 12px #ffe08280'}}
          />
        </div>
        <Link
          to="/sale-off"
          className="btn btn-warning btn-lg fw-bold px-5"
          style={{fontSize: '1.15rem', borderRadius: 8}}
        >
          Xem sản phẩm sale
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      {/* Slide Banner */}
      {slides.length > 0 && (
        <div className="home-banner mb-5 position-relative">
          <img src={slides[slideIdx].image} alt="Banner" className="w-100" style={{maxHeight:'500px',objectFit:'cover'}} />
          <div className="home-banner-text " >
            <h1 className="fw-bold" style={{fontSize:'2rem'}}>{slides[slideIdx].title}</h1>
            <div className="fs-4">{slides[slideIdx].description}</div>
            <div className="mt-2 ">
              <Link to={slides[slideIdx].link || '#'} className="btn btn-success btn-lg mt-2">
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

      {/* Info Bar dưới banner */}
      <div className="container mb-4">
        <div className="row justify-content-center g-4">
          <div className="col-md-3 col-6">
            <div className="info-card text-center py-3 px-2" style={{
              border: '1px solid #dff3e0ff',
              borderRadius: '16px',
              background: '#fff',
              color: '#00a61eff',
              minHeight: 90,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>
                <i className="bi bi-truck"></i>
              </div>
              <div>
                <span className="fw-bold">Vận chuyển <span style={{color:'#00a61eff'}}>TOÀN QUỐC</span></span><br />
                <span style={{fontSize:'0.95rem'}}>Thanh toán khi nhận hàng</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="info-card text-center py-3 px-2" style={{
              border: '1px solid #dff3e0ff',
              borderRadius: '16px',
              background: '#fff',
              color: '#00a61eff',
              minHeight: 90,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>
                <i className="bi bi-patch-check"></i>
              </div>
              <div>
                <span className="fw-bold">Bảo đảm chất lượng</span><br />
                <span style={{fontSize:'0.95rem'}}>Sản phẩm bảo đảm chất lượng.</span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="info-card text-center py-3 px-2" style={{
              border: '1px solid #dff3e0ff',
              borderRadius: '16px',
              background: '#fff',
              color: '#00a61eff',
              minHeight: 90,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>
                <i className="bi bi-credit-card"></i>
              </div>
              <div>
                <span className="fw-bold">Tiến hành <span style={{color:'#00a61eff'}}>THANH TOÁN</span></span><br />
                <span style={{fontSize:'0.95rem'}}>Với nhiều <span style={{color:'#00a61eff'}}>PHƯƠNG THỨC</span></span>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="info-card text-center py-3 px-2" style={{
              border: '1px solid #dff3e0ff',
              borderRadius: '16px',
              background: '#fff',
              color: '#00a61eff',
              minHeight: 90,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 6 }}>
                <i className="bi bi-arrow-repeat"></i>
              </div>
              <div>
                <span className="fw-bold">Đổi sản phẩm mới</span><br />
                <span style={{fontSize:'0.95rem'}}>nếu sản phẩm lỗi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

     

      {/* Danh mục sản phẩm */}
      <div className="container mb-5">
        <h2 className="fw-bold text-success mb-4">Danh mục sản phẩm</h2>
        <div className="position-relative">
          <button
            className="btn btn-light position-absolute top-50 start-0 translate-middle-y"
            style={{ zIndex: 2, left: -30, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',  }}
            onClick={() => setCategoryStartIdx(idx => Math.max(0, idx - categoriesPerView))}
            disabled={categoryStartIdx === 0}
          >
            &lt;
          </button>
          <div className="d-flex flex-row overflow-hidden justify-content-center" style={{ gap: 15 }}>
            {categories
              .filter(cat => !cat.parent_id) // chỉ hiển thị danh mục cha
              .slice(categoryStartIdx, categoryStartIdx + categoriesPerView)
              .map(cat => (
                <div key={cat.id} style={{ minWidth: 180, maxWidth: 200, }}>
                  <div className="card card-category h-100 d-flex flex-column align-items-center justify-content-center p-3" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderRadius: 16, border: 'none', background: '#fff', minHeight: 250 }}>
                    <div className="d-flex align-items-center justify-content-center mb-3" style={{ width: 120, height: 120, background: '#f8f9fa', borderRadius: 16, overflow: 'hidden' }}>
                      <img
                        src={cat.image || 'https://via.placeholder.com/120x120?text=Category'}
                        alt={cat.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8f9fa' }}
                      />
                    </div>
                    <h5 className="card-title text-success fw-bold mb-2 mt-1 text-center fs-6">{cat.name}</h5>
                    <Link
                      to={`/products?category=${cat.id}`}
                      className="btn btn-outline-success w-100"
                      style={{ borderRadius: 4, fontWeight: 400, fontSize: '0.8rem', padding: '5px 0' }}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
          </div>
          <button
            className="btn btn-light position-absolute top-50 end-0 translate-middle-y"
            style={{ zIndex: 2, right: -30, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onClick={() => setCategoryStartIdx(idx => Math.min(
              categories.filter(cat => !cat.parent_id).length - categoriesPerView,
              idx + categoriesPerView
            ))}
            disabled={categoryStartIdx + categoriesPerView >= categories.filter(cat => !cat.parent_id).length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Sản phẩm theo danh mục */}
      <div className="container">
        {renderCategoryBlock(CATEGORY_IDS['vot-cau-long'], 'Vợt cầu lông', '/products?category=1')}
        {renderCategoryBlock(CATEGORY_IDS['giay-cau-long'], 'Giày cầu lông', '/products?category=2')}
        {renderCategoryBlock(CATEGORY_IDS['ao-cau-long'], 'Áo cầu lông', '/products?category=3')}
        {renderCategoryBlock(CATEGORY_IDS['quan-cau-long'], 'Quần cầu lông', '/products?category=9')}
        {/* Banner Sale Off */}
        {renderSaleBannerBlock()}
        {renderCategoryBlock(CATEGORY_IDS['vay-cau-long'], 'Váy cầu lông', '/products?category=10')}
        {renderCategoryBlock(CATEGORY_IDS['tui-cau-long'], 'Túi cầu lông', '/products?category=5')}
        {/* {renderCategoryBlock(CATEGORY_IDS['phu-kien'], 'Phụ kiện', '/products?category=4')} */}
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