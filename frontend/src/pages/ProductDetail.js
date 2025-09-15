import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import axios from "axios";
import ScrollToTopButton from "../components/ScrollToTopButton";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { modal, hideModal, showSuccess, showError } = useModal();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [totalStock, setTotalStock] = useState(0); // Thêm state cho tổng stock

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      console.log("Product data from API:", response.data);
      console.log("Product sizes:", response.data.sizes);

      const productData = response.data;

      // Tính tổng stock từ sizes hoặc dùng stock_quantity gốc
      let calculatedStock = 0;
      if (productData.sizes && productData.sizes.length > 0) {
        calculatedStock = productData.sizes.reduce(
          (total, size) => total + (size.stock || 0),
          0
        );
        console.log("Calculated stock from sizes:", calculatedStock);
      } else {
        calculatedStock = productData.stock_quantity || 0;
        console.log("Using original stock_quantity:", calculatedStock);
      }

      setProduct(productData);
      setTotalStock(calculatedStock);
    } catch (error) {
      console.error("Error fetching product:", error);
      if (error.response?.status === 404) {
        navigate("/products");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      showError("Vui lòng chọn size trước khi thêm vào giỏ!");
      return;
    }

    // Kiểm tra tồn kho theo size đã chọn
    if (selectedSize && selectedSize.stock < quantity) {
      showError(
        `Size ${selectedSize.name} chỉ còn ${selectedSize.stock} sản phẩm!`
      );
      return;
    }

    // Kiểm tra tổng tồn kho nếu không có size
    if (!selectedSize && totalStock < quantity) {
      showError(`Chỉ còn ${totalStock} sản phẩm trong kho!`);
      return;
    }

    addToCart(product, quantity, selectedSize);

    showSuccess(
      `Đã thêm sản phẩm vào giỏ hàng!${
        selectedSize ? ` - Size: ${selectedSize.name}` : ""
      }`
    );
  };

  const handleReviewSubmitted = () => {
    setReviewRefresh((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-lg" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <h3>Không tìm thấy sản phẩm</h3>
          <button
            className="btn btn-dark mt-3"
            onClick={() => navigate("/products")}
          >
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = product.sale_price || product.price;
  const originalPrice = product.price;
  const discountPercentage = product.sale_price
    ? Math.round(((originalPrice - product.sale_price) / originalPrice) * 100)
    : 0;

  // Kiểm tra hết hàng dựa trên tổng stock
  const isOutOfStock = totalStock <= 0;
  // Số lượng tồn kho hiển thị
  const displayStock = selectedSize ? selectedSize.stock : totalStock;
  // Số lượng tối đa có thể chọn
  const maxQuantity = selectedSize ? selectedSize.stock : totalStock;

  return (
    <>
      <div className="container my-5">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <button
                className="btn btn-link p-0"
                onClick={() => navigate("/")}
                style={{
                  color: "#00a61eff",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Trang chủ
              </button>
            </li>
            <li className="breadcrumb-item">
              <button
                className="btn btn-link p-0"
                onClick={() => navigate("/products")}
                style={{
                  color: "#00a61eff",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Sản phẩm
              </button>
            </li>
            <li className="breadcrumb-item active">{product.name}</li>
          </ol>
        </nav>

        <div className="row g-5">
          {/* Product Image */}
          <div className="col-lg-5">
            <div className="position-relative">
              <img
                src={
                  product.image_url ||
                  "https://via.placeholder.com/600x400/f8f9fa/6c757d?text=No+Image"
                }
                alt={product.name}
                className="img-fluid rounded shadow-lg w-100"
                style={{ maxHeight: "500px", objectFit: "cover" }}
              />
              {isOutOfStock && (
                <div className="position-absolute top-0 start-0 m-3">
                  <span
                    className="badge bg-danger fs-6 p-2"
                    style={{ fontWeight: 600 }}
                  >
                    Hết hàng
                  </span>
                </div>
              )}
              {discountPercentage > 0 && (
                <div className="position-absolute top-0 end-0 m-3">
                  <span className="badge bg-warning text-dark fs-6 p-2">
                    SALE {discountPercentage}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="col-lg-7">
            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: "2rem" }}>
              {product.name}
            </h1>
            <div className="mb-2">
              <span className="badge bg-primary me-2">
                {product.category_name}
              </span>
              {product.brand_name && (
                <span className="badge bg-success">{product.brand_name}</span>
              )}
            </div>
            <div className="mb-3">
              <span
                className="fw-bold text-danger"
                style={{ fontSize: "2rem" }}
              >
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(currentPrice)}
              </span>
              {product.sale_price && (
                <span className="fs-5 text-decoration-line-through text-muted ms-3">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(originalPrice)}
                </span>
              )}
            </div>
            <div className="mb-3">
              {isOutOfStock ? (
                <span className="text-danger fw-bold">Hết hàng</span>
              ) : (
                <span className="text-success fw-bold">
                  Còn hàng ({displayStock})
                  {selectedSize && ` - Size ${selectedSize.name}`}
                </span>
              )}
            </div>

            {/* SIZE OPTIONS */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-3">
                <label className="form-label fw-medium">Chọn size:</label>
                <div className="d-flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      className={`btn ${
                        selectedSize?.id === size.id
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={() => {
                        setSelectedSize(size);
                        // Reset quantity về 1 khi đổi size
                        setQuantity(1);
                      }}
                      disabled={size.stock <= 0}
                    >
                      {size.name} <small className="ms-1">({size.stock})</small>
                      {size.stock <= 0 && (
                        <small className="text-muted"> - Hết hàng</small>
                      )}
                    </button>
                  ))}
                </div>
                {/* {selectedSize && (
                  <small className="text-muted mt-2 d-block">
                    Size {selectedSize.name} - Còn {selectedSize.stock} sản phẩm
                  </small>
                )} */}
                {/* {!selectedSize && product.sizes.length > 0 && (
                  <small className="text-info mt-2 d-block">
                    Tổng tồn kho: {totalStock} sản phẩm (tất cả sizes)
                  </small>
                )} */}
              </div>
            )}

            {/* Add to Cart */}
            {!isOutOfStock && (
              <div className="mb-4">
                <div className="row g-3 align-items-end">
                  <div className="col-auto">
                    <label className="form-label fw-medium">Số lượng:</label>
                    <div className="input-group" style={{ width: "150px" }}>
                      <button
                        className="btn btn-outline-success"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <input
                        type="number"
                        className="form-control text-center"
                        value={quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          setQuantity(
                            Math.max(1, Math.min(maxQuantity, newQuantity))
                          );
                        }}
                        min="1"
                        max={maxQuantity}
                      />
                      <button
                        className="btn btn-outline-success"
                        onClick={() =>
                          setQuantity(Math.min(maxQuantity, quantity + 1))
                        }
                        disabled={quantity >= maxQuantity}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                    {/* <small className="text-muted">Tối đa: {maxQuantity}</small> */}
                  </div>
                  <div className="col">
                    <button
                      className="btn btn-outline-success fw-bold btn-lg px-3 fs-6"
                      style={{ height: "38px" }}
                      onClick={handleAddToCart}
                      disabled={maxQuantity <= 0}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info Table */}
            <div className="mb-4">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th style={{ width: "160px" }}>Mã sản phẩm</th>
                    <td>{product.sku}</td>
                  </tr>
                  <tr>
                    <th>Danh mục</th>
                    <td>{product.category_name}</td>
                  </tr>
                  {product.brand_name && (
                    <tr>
                      <th>Thương hiệu</th>
                      <td>{product.brand_name}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Tồn kho</th>
                    <td>
                      {product.sizes && product.sizes.length > 0 ? (
                        <div>
                          <strong>Tổng: {totalStock}</strong>
                          <div className="mt-1">
                            {product.sizes.map((size, index) => (
                              <span key={size.id} className="me-2">
                                Size {size.name}: {size.stock}
                                {index < product.sizes.length - 1 && ", "}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        totalStock
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tabs: Description & Reviews */}
        <div className="row mt-5">
          <div className="col-12">
            <ul className="nav nav-tabs" id="productTabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "description" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  <i className="bi bi-file-text me-2"></i>
                  Mô tả sản phẩm
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "reviews" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("reviews")}
                >
                  <i className="bi bi-star me-2"></i>
                  Đánh giá & nhận xét
                </button>
              </li>
            </ul>

            <div className="tab-content mt-4">
              {activeTab === "description" && (
                <div className="tab-pane fade show active">
                  {product.description ? (
                    <div className="card">
                      <div className="card-body">
                        <div
                          className="product-description"
                          style={{ whiteSpace: "pre-line" }}
                        >
                          {product.description}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="bi bi-file-text display-1 text-muted"></i>
                      <h5 className="text-muted mt-3">
                        Chưa có mô tả sản phẩm
                      </h5>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="tab-pane fade show active">
                  <div className="row">
                    <div className="col-lg-8">
                      <ReviewList
                        productId={id}
                        refreshTrigger={reviewRefresh}
                      />
                    </div>
                    <div className="col-lg-4">
                      <ReviewForm
                        product={product}
                        onReviewSubmitted={handleReviewSubmitted}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <ScrollToTopButton bottom={88} right={32} zIndex={999} />

      {/* Modal */}
      <Modal
        show={modal.show}
        onClose={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        showCancel={modal.showCancel}
      />
    </>
  );
};

export default ProductDetail;
