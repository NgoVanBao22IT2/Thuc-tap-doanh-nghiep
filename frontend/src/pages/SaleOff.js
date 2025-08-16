import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScrollToTopButton from "../components/ScrollToTopButton";


const PAGE_SIZE = 16;

const SaleOff = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortType, setSortType] = useState('default');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, []);

   // Thêm hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data);
    } catch {
      setBrands([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch {
      setCategories([]);
    }
  };

  // Lọc sản phẩm sale theo bộ lọc và danh mục (hỗ trợ danh mục cha/phụ kiện)
  const filterBySidebar = (product) => {
    let match = true;
    const price = product.sale_price || product.price;
    if (selectedPrice) {
      if (selectedPrice === '1' && price >= 500000) match = false;
      if (selectedPrice === '2' && (price < 500000 || price > 1000000)) match = false;
      if (selectedPrice === '3' && (price < 1000000 || price > 2000000)) match = false;
      if (selectedPrice === '4' && (price < 2000000 || price > 3000000)) match = false;
      if (selectedPrice === '5' && price <= 3000000) match = false;
    }
    if (selectedBrand && product.brand_name !== selectedBrand) match = false;
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) match = false;

    // Lọc theo danh mục, hỗ trợ danh mục cha/phụ kiện
    if (selectedCategory) {
      const selectedCat = categories.find(cat => cat.id == selectedCategory);
      if (selectedCat) {
        if (!selectedCat.parent_id) {
          // Nếu là danh mục cha (hoặc "Phụ kiện"), lấy cả các danh mục con
          const childCatIds = categories.filter(cat => cat.parent_id === selectedCat.id).map(cat => cat.id);
          if (![selectedCat.id, ...childCatIds].includes(product.category_id)) match = false;
        } else {
          // Nếu là danh mục con
          if (product.category_id !== Number(selectedCategory)) match = false;
        }
      }
    }
    return match;
  };

  // Sắp xếp sản phẩm sale
  const sortProducts = (arr) => {
    if (sortType === 'price-asc') {
      return [...arr].sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
    }
    if (sortType === 'price-desc') {
      return [...arr].sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
    }
    if (sortType === 'name-asc') {
      return [...arr].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortType === 'name-desc') {
      return [...arr].sort((a, b) => b.name.localeCompare(a.name));
    }
    return arr;
  };

  const saleProducts = sortProducts(
    products.filter(
      p => p.sale_price && p.sale_price < p.price && filterBySidebar(p)
    )
  );

  const pagedProducts = saleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(saleProducts.length / PAGE_SIZE);

  return (
    <div className="container my-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button
              className="btn btn-link p-0"
              onClick={() => navigate('/')}
              style={{ color: '#00a61eff', textDecoration: 'none', fontWeight: 500 }}
            >
              Trang chủ
            </button>
          </li>
          <li className="breadcrumb-item active">
            <button
              className="btn btn-link p-0"
              onClick={() => navigate('/sale-off')}
              style={{ color: '#00a61eff', textDecoration: 'none', fontWeight: 500 }}
            >
              Sản phẩm Sale Off
            </button>
            
          </li>
        </ol>
      </nav>
      <div className="row">
        {/* Sidebar bộ lọc */}
        <div className="col-lg-3 mb-4">
          <div className="card p-3 mb-3">
            <h5 className="fw-bold mb-3">CHỌN MỨC GIÁ</h5>
            <div className="mb-2">
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price1" value="1"
                  checked={selectedPrice === '1'} onChange={e => {setSelectedPrice(e.target.value); setPage(1);}} />
                <label className="form-check-label" htmlFor="price1">Giá dưới 500.000đ</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price2" value="2"
                  checked={selectedPrice === '2'} onChange={e => {setSelectedPrice(e.target.value); setPage(1);}} />
                <label className="form-check-label" htmlFor="price2">500.000đ - 1 triệu</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price3" value="3"
                  checked={selectedPrice === '3'} onChange={e => {setSelectedPrice(e.target.value); setPage(1);}} />
                <label className="form-check-label" htmlFor="price3">1 - 2 triệu</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price4" value="4"
                  checked={selectedPrice === '4'} onChange={e => {setSelectedPrice(e.target.value); setPage(1);}} />
                <label className="form-check-label" htmlFor="price4">2 - 3 triệu</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price5" value="5"
                  checked={selectedPrice === '5'} onChange={e => {setSelectedPrice(e.target.value); setPage(1);}} />
                <label className="form-check-label" htmlFor="price5">Giá trên 3 triệu</label>
              </div>
            </div>
            <hr />
            <h5 className="fw-bold mb-3">THƯƠNG HIỆU</h5>
            <div className="mb-2" style={{ maxHeight: 120, overflowY: 'auto' }}>
              {brands.map(brand => (
                <div className="form-check" key={brand.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="brand"
                    id={`brand-${brand.id}`}
                    value={brand.name}
                    checked={selectedBrand === brand.name}
                    onChange={e => {setSelectedBrand(e.target.value); setPage(1);}}
                  />
                  <label className="form-check-label" htmlFor={`brand-${brand.id}`}>
                    {brand.name}
                  </label>
                </div>
              ))}
            </div>
            <button
              className="btn btn-outline-success mt-3"
              onClick={() => {
                setSelectedPrice('');
                setSelectedBrand('');
                setSearchTerm('');
                setSelectedCategory('');
                setPage(1);
              }}
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
          {/* Danh mục sản phẩm dạng danh sách */}
          <div className="card p-3">
            <h5 className="fw-bold mb-3">DANH MỤC SẢN PHẨM</h5>
            <ul className="list-unstyled mb-0">
              {categories
                .filter(cat => !cat.parent_id)
                .map(parent => (
                  <React.Fragment key={parent.id}>
                    <li>
                      <button
                        className={`btn btn-link p-0 ${selectedCategory == parent.id ? 'text-success fw-bold' : 'text-dark'}`}
                        style={{ fontSize: '1rem', textDecoration: 'none' }}
                        onClick={() => { setSelectedCategory(parent.id); setPage(1); }}
                      >
                        {parent.name}
                      </button>
                    </li>
                    {categories
                      .filter(child => child.parent_id === parent.id)
                      .map(child => (
                        <li key={child.id} style={{ marginLeft: 12 }}>
                          <button
                            className={`btn btn-link p-0 ${selectedCategory == child.id ? 'text-success fw-bold' : 'text-dark'}`}
                            style={{ fontSize: '1rem', textDecoration: 'none' }}
                            onClick={() => { setSelectedCategory(child.id); setPage(1); }}
                          >
                            {child.name}
                          </button>
                        </li>
                      ))}
                  </React.Fragment>
                ))}
            </ul>
            {selectedCategory && (
              <button
                className="btn btn-outline-secondary mt-3"
                onClick={() => { setSelectedCategory(''); setPage(1); }}
              >
                Xóa bộ lọc danh mục
              </button>
            )}
          </div>
        </div>
        {/* Sản phẩm Sale Off */}
        <div className="col-lg-9">
          {/* Header: Tiêu đề - Sắp xếp - Tổng số sản phẩm */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">
              <i className="bi bi-fire text-warning"></i> Sản phẩm Sale Off
            </h2>
            <div>
              <span className="text-muted">Sắp xếp: </span>
              <select
                className="form-select form-select-sm d-inline-block w-auto ms-2"
                value={sortType}
                onChange={e => { setSortType(e.target.value); setPage(1); }}
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
            </div>
          </div>
          {/* Search box + Tổng số sản phẩm */}
          <div className="mb-3 d-flex align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
              style={{ maxWidth: 350 }}
            />
            <button
              className="btn btn-outline-success ms-2"
              onClick={() => {setSearchTerm(''); setPage(1);}}
            >
              Xóa tìm kiếm
            </button>
            <span className="ms-auto text-muted">
              Tổng: <b>{saleProducts.length}</b> sản phẩm
            </span>
          </div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border spinner-border-lg" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
            </div>
          ) : saleProducts.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted">Không có sản phẩm sale nào</h4>
            </div>
          ) : (
            <>
              <div className="row g-3">
                {pagedProducts.map((product, index) => (
                  <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                    <div
                      className="product-card h-100 fade-in-up border border-warning"
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        borderRadius: '10px',
                        boxShadow: '0 4px 16px rgba(255,193,7,0.08)',
                        overflow: 'hidden',
                        backgroundColor: '#fffbea',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
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
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-danger text-white fs-6">
                            -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                          </span>
                        </div>
                        {product.stock_quantity === 0 && (
                          <div className="position-absolute top-0 start-0 m-2">
                            <span className="badge bg-secondary" style={{ fontWeight: 500, fontSize: '0.8rem' }}>Hết hàng</span>
                          </div>
                        )}
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title text-dark fw-semibold" style={{ fontSize: '1rem', minHeight: '3em', paddingLeft: '10px' }}>
                          {product.name}
                        </h5>
                        <div className="mb-1 text-muted small" style={{ paddingLeft: '10px' }}>{product.category_name}</div>
                        <div className="mb-2" style={{ paddingLeft: '10px' }}>
                          <span className="fw-bold text-danger fs-5">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.sale_price)}
                          </span>
                          <br />
                          <small className="text-decoration-line-through text-muted">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                          </small>
                        </div>
                        <div className="mt-auto">
                          <Link
                            to={`/products/${product.id}`}
                            className={`btn ${product.stock_quantity === 0 ? 'btn-outline-secondary' : 'btn-warning'} w-100`}
                            style={{ fontWeight: 600, fontSize: '0.95rem', padding: '10px' }}
                          >
                            {product.stock_quantity === 0 ? 'Xem chi tiết' : 'Mua ngay'}
                          </Link>
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
                    <ul className="pagination custom-pagination">
                      <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page - 1)}>&lt;</button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i + 1} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                          <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item${page === totalPages ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPage(page + 1)}>&gt;</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
            {/* Thêm style đổi màu phân trang */}
                  <style>
                    {`
        .custom-pagination .page-item.active .page-link {
          background-color: #0a8621ff;
          color: #fff;
          border-color: #0a8621ff;
        }
        .custom-pagination .page-link {
          color: #0a8621ff;
          border-radius: 8px;
          margin: 0 2px;
          border: 1px solid #e0e0e0;
          background: #fff;
          transition: background 0.2s;
        }
        .custom-pagination .page-item:not(.active):not(.disabled) .page-link:hover {
          background-color: #e3f2fd;
          color: #0a8621ff;
        }
        .custom-pagination .page-item.disabled .page-link {
          background: #f5f5f5;
          color: #bdbdbd;
          border-color: #e0e0e0;
        }
        `}
                  </style>

{/* Nút trở lại đầu trang */}
        <ScrollToTopButton bottom={88} right={32} zIndex={999} />
      
        </div>
      </div>
    </div>
  );
};

export default SaleOff;

