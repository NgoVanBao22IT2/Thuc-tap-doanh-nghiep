import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PAGE_SIZE = 16;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [childCategories, setChildCategories] = useState([]);
  // Bộ lọc mẫu (giá, thương hiệu)
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brands, setBrands] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [sortType, setSortType] = useState('default');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands(); // Thêm dòng này để lấy brands từ database
  }, []);

  useEffect(() => {
    // Nếu chọn "Phụ kiện", lấy các danh mục con
    if (selectedCategory && categories.length > 0) {
      const selectedCat = categories.find(cat => cat.id == selectedCategory);
      if (selectedCat && selectedCat.name === 'Phụ kiện') {
        axios.get(`/api/categories/${selectedCategory}/children`)
          .then(res => setChildCategories(res.data))
          .catch(() => setChildCategories([]));
      } else {
        setChildCategories([]);
      }
    } else {
      setChildCategories([]);
    }
  }, [selectedCategory, categories]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catId = params.get('category');
    if (catId) {
      setSelectedCategory(catId);
      setPage(1);
    }
  }, [location.search]);

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

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands');
      setBrands(response.data);
    } catch (error) {
      setBrands([]);
    }
  };

  // Lọc sản phẩm theo bộ lọc sidebar
  const filterBySidebar = (product) => {
    let match = true;
    if (selectedPrice) {
      const price = product.sale_price || product.price;
      if (selectedPrice === '1' && price >= 500000) match = false;
      if (selectedPrice === '2' && (price < 500000 || price > 1000000)) match = false;
      if (selectedPrice === '3' && (price < 1000000 || price > 2000000)) match = false;
      if (selectedPrice === '4' && (price < 2000000 || price > 3000000)) match = false;
      if (selectedPrice === '5' && price <= 3000000) match = false;
    }
    if (selectedBrand && product.brand_name !== selectedBrand) match = false;
    return match;
  };

  const filteredProducts = (() => {
    const selectedCatObj = categories.find(cat => cat.id == selectedCategory);
    // Nếu chọn danh mục cha, hiển thị tất cả sản phẩm thuộc các danh mục con và chính nó, không phân nhóm
    if (
      selectedCategory &&
      selectedCatObj &&
      !selectedCatObj.parent_id // là danh mục cha
    ) {
      const childCatIds = categories.filter(cat => cat.parent_id === selectedCatObj.id).map(cat => cat.id);
      return products.filter(product =>
        (childCatIds.includes(product.category_id) || product.category_id == selectedCatObj.id) &&
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        filterBySidebar(product)
      );
    }
    // Nếu chọn "Phụ kiện" và có danh mục con
    if (
      selectedCategory &&
      selectedCatObj &&
      selectedCatObj.name === 'Phụ kiện' &&
      childCategories.length > 0
    ) {
      const childCatIds = childCategories.map(cat => cat.id);
      return products.filter(
        product =>
          childCatIds.includes(product.category_id) &&
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          filterBySidebar(product)
      );
    }
    // Trường hợp khác: lọc như cũ
    return products.filter(product => {
      const matchesCategory = !selectedCategory || product.category_id == selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch && filterBySidebar(product);
    });
  })();

  // Sắp xếp sản phẩm
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

  // Nếu chọn danh mục cha thì không chia nhóm, chỉ hiển thị tất cả sản phẩm
  let groupedPagedProducts;
  if (
    selectedCategory &&
    (() => {
      const cat = categories.find(c => c.id == selectedCategory);
      return cat && !cat.parent_id;
    })()
  ) {
    const sortedProducts = sortProducts(filteredProducts);
    const pagedProducts = sortedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    groupedPagedProducts = { [categories.find(c => c.id == selectedCategory)?.name || 'Danh mục']: pagedProducts };
  } else {
    // Nhóm theo category_name như cũ
    const sortedProducts = sortProducts(filteredProducts).sort((a, b) =>
      a.category_name.localeCompare(b.category_name)
    );
    const pagedProducts = sortedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    groupedPagedProducts = pagedProducts.reduce((acc, product) => {
      const category = product.category_name || 'Khác';
      if (!acc[category]) acc[category] = [];
      acc[category].push(product);
      return acc;
    }, {});
  }

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="container my-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <button
              className="btn btn-link p-0"
              onClick={() => navigate('/')}
              style={{ color: '#00a61eff', textDecoration: 'underline', fontWeight: 500 }}
            >
              Trang chủ
            </button>
          </li>
          <li className="breadcrumb-item">
            <button
              className="btn btn-link p-0"
              onClick={() => navigate('/products')}
              style={{ color: '#00a61eff', textDecoration: 'underline', fontWeight: 500 }}
            >
              Sản phẩm
            </button>
          </li>
          {selectedCategory && categories.find(cat => cat.id == selectedCategory) && (
            <li className="breadcrumb-item active">
              {categories.find(cat => cat.id == selectedCategory).name}
            </li>
          )}
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
                  checked={selectedPrice === '1'} onChange={e => setSelectedPrice(e.target.value)} />
                <label className="form-check-label" htmlFor="price1">Giá dưới 500.000đ</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price2" value="2"
                  checked={selectedPrice === '2'} onChange={e => setSelectedPrice(e.target.value)} />
                <label className="form-check-label" htmlFor="price2">500.000đ - 1 triệu</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price3" value="3"
                  checked={selectedPrice === '3'} onChange={e => setSelectedPrice(e.target.value)} />
                <label className="form-check-label" htmlFor="price3">1 - 2 triệu</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price4" value="4"
                  checked={selectedPrice === '4'} onChange={e => setSelectedPrice(e.target.value)} />
                <label className="form-check-label" htmlFor="price4">2 - 3 triệu</label>
              </div>
              <div className="form-check">
                <input className="form-check-input" type="radio" name="price" id="price5" value="5"
                  checked={selectedPrice === '5'} onChange={e => setSelectedPrice(e.target.value)} />
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
                    onChange={e => setSelectedBrand(e.target.value)}
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
                        onClick={() => {
                          setSelectedCategory(parent.id);
                          setPage(1);
                        }}
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
                            onClick={() => {
                              setSelectedCategory(child.id);
                              setPage(1);
                            }}
                          >
                            {child.name}
                          </button>
                        </li>
                      ))}
                  </React.Fragment>
                ))}
            </ul>
          </div>
        </div>
        {/* Sản phẩm */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">
              {selectedCategory && categories.find(cat => cat.id == selectedCategory)?.name
                ? categories.find(cat => cat.id == selectedCategory).name
                : 'Tất cả sản phẩm'}
            </h2>
            <div>
              <span className="text-muted">Sắp xếp: </span>
              <select
                className="form-select form-select-sm d-inline-block w-auto ms-2"
                value={sortType}
                onChange={e => setSortType(e.target.value)}
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
              </select>
            </div>
          </div>
          {/* Search box */}
          <div className="mb-3 d-flex align-items-center">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: 350 }}
            />
            <button
              className="btn btn-outline-success ms-2"
              onClick={() => setSearchTerm('')}
            >
              Xóa tìm kiếm
            </button>
            <span className="ms-auto text-muted">
              Tổng: <b>{filteredProducts.length}</b> sản phẩm
            </span>
          </div>
          {/* Hiển thị sản phẩm */}
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
                  {/* Nếu là danh mục cha thì hiển thị tất cả sản phẩm, không chia nhóm */}
                  {selectedCategory &&
                    (() => {
                      const cat = categories.find(c => c.id == selectedCategory);
                      return cat && !cat.parent_id;
                    })() ? (
                    <div>
                      <div className="row g-3">
                        {Object.values(groupedPagedProducts)[0].map((product, index) => (
                          <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                            <div
                              className="product-card h-100 fade-in-up"
                              style={{
                                animationDelay: `${index * 0.05}s`,
                                borderRadius: '10px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                                overflow: 'hidden',
                                backgroundColor: '#fff',
                                transition: 'transform 0.2s ease',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                                <div className="mb-1 text-muted small" style={{ paddingLeft: '10px' }}>{product.category_name}</div>
                                <div className="mb-2" style={{ paddingLeft: '10px' }}>
                                  {product.sale_price ? (
                                    <>
                                      <span className="fw-bold text-danger fs-5">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.sale_price)}
                                      </span>
                                      <br />
                                      <small className="text-decoration-line-through text-muted">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                      </small>
                                    </>
                                  ) : (
                                    <span className="fw-bold text-danger fs-5">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-auto">
                                  <Link
                                    to={`/products/${product.id}`}
                                    className={`btn ${product.stock_quantity === 0 ? 'btn-outline-secondary' : 'btn-dark'} w-100`}
                                    style={{ fontWeight: 600, fontSize: '0.95rem', padding: '10px' }}
                                  >
                                    {product.stock_quantity === 0 ? 'Xem chi tiết' : 'Xem sản phẩm'}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Nếu không phải danh mục cha, hiển thị như cũ
                    Object.entries(groupedPagedProducts).map(([category, items]) => (
                      <div key={category} className="mb-5">
                        <h4 className="fw-bold text-success mb-3">{category}</h4>
                        <div className="row g-3">
                          {items.map((product, index) => (
                            <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                              <div
                                className="product-card h-100 fade-in-up"
                                style={{
                                  animationDelay: `${index * 0.05}s`,
                                  borderRadius: '10px',
                                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                                  overflow: 'hidden',
                                  backgroundColor: '#fff',
                                  transition: 'transform 0.2s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
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
                                  <div className="mb-1 text-muted small" style={{ paddingLeft: '10px' }}>{product.category_name}</div>
                                  <div className="mb-2" style={{ paddingLeft: '10px' }}>
                                    {product.sale_price ? (
                                      <>
                                        <span className="fw-bold text-danger fs-5">
                                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.sale_price)}
                                        </span>
                                        <br />
                                        <small className="text-decoration-line-through text-muted">
                                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                        </small>
                                      </>
                                    ) : (
                                      <span className="fw-bold text-danger fs-5">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-auto">
                                    <Link
                                      to={`/products/${product.id}`}
                                      className={`btn ${product.stock_quantity === 0 ? 'btn-outline-secondary' : 'btn-dark'} w-100`}
                                      style={{ fontWeight: 600, fontSize: '0.95rem', padding: '10px' }}
                                    >
                                      {product.stock_quantity === 0 ? 'Xem chi tiết' : 'Xem sản phẩm'}
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Phân trang */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                      <nav>
                        <ul className="pagination">
                          <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page - 1)}>&lt;</button>
                          </li>
                          {[...Array(totalPages)].map((_, i) => (
                            <li key={i + 1} className={`page-item${page === i + 1 ? ' active' : ''}`}>
                              <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
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
      </div>
    </div>
  );
};

export default Products;

