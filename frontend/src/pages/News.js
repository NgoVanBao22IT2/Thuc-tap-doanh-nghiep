import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ScrollToTopButton from "../components/ScrollToTopButton";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const location = useLocation();
  const PAGE_SIZE = 8;
  const selectedCategory = new URLSearchParams(location.search).get("category");
  const [sortType, setSortType] = useState("default");

  // Sắp xếp tin tức
  const sortNews = (arr) => {
    if (sortType === "date-newest") {
      return [...arr].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    if (sortType === "date-oldest") {
      return [...arr].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    if (sortType === "title-asc") {
      return [...arr].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortType === "title-desc") {
      return [...arr].sort((a, b) => b.title.localeCompare(a.title));
    }
    return arr;
  };

  const totalPages = Math.ceil(news.length / PAGE_SIZE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 3;

    // Nút Previous
    pages.push(
      <li key="prev" className={`page-item ${page === 1 ? "disabled" : ""}`}>
        <button
          className="page-link"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Trước
        </button>
      </li>
    );

    if (totalPages <= maxVisible) {
      // Hiển thị tất cả trang nếu <= 3
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
            <button className="page-link" onClick={() => handlePageChange(i)}>
              {i}
            </button>
          </li>
        );
      }
    } else {
      // Logic phức tạp cho nhiều trang
      if (page <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(
            <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(i)}>
                {i}
              </button>
            </li>
          );
        }
        pages.push(
          <li key="ellipsis-end" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
        pages.push(
          <li key={totalPages} className="page-item">
            <button
              className="page-link"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </li>
        );
      } else if (page >= totalPages - 2) {
        pages.push(
          <li key={1} className="page-item">
            <button className="page-link" onClick={() => handlePageChange(1)}>
              1
            </button>
          </li>
        );
        pages.push(
          <li key="ellipsis-start" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(
            <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(i)}>
                {i}
              </button>
            </li>
          );
        }
      } else {
        pages.push(
          <li key={1} className="page-item">
            <button className="page-link" onClick={() => handlePageChange(1)}>
              1
            </button>
          </li>
        );
        pages.push(
          <li key="ellipsis-start" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(
            <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(i)}>
                {i}
              </button>
            </li>
          );
        }
        pages.push(
          <li key="ellipsis-end" className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        );
        pages.push(
          <li key={totalPages} className="page-item">
            <button
              className="page-link"
              onClick={() => handlePageChange(totalPages)}
            >
              {totalPages}
            </button>
          </li>
        );
      }
    }

    // Nút Next
    pages.push(
      <li
        key="next"
        className={`page-item ${page === totalPages ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Sau
        </button>
      </li>
    );

    return (
      <nav aria-label="Product pagination" className="mt-4">
        <ul className="pagination justify-content-center">{pages}</ul>
      </nav>
    );
  };

  useEffect(() => {
    axios
      .get("/api/news")
      .then((res) => setNews(res.data))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
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
              Tin tức
            </button>
          </li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-4">
        {/* <i className="bi bi-newspaper fs-2 text-dark me-2"></i> */}
        <h2 className="fw-bold mb-0 text-dark">Tin tức cầu lông</h2>
        <div>
          <span className="text-muted">Sắp xếp: </span>
          <select
            className="form-select form-select-sm d-inline-block w-auto ms-2"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="default">Mặc định</option>
            <option value="date-newest">Mới nhất</option>
            <option value="date-oldest">Cũ nhất</option>
            <option value="title-asc">Tiêu đề A → Z</option>
            <option value="title-desc">Tiêu đề Z → A</option>
          </select>
          {/* <div className="d-flex align-items-end">
            <span className="ms-auto text-muted">
            Tổng: <b>{sortNews(news).length}</b> Tin tức
          </span></div> */}
        </div>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border" role="status"></div>
            <div className="mt-3 text-muted">Đang tải tin tức...</div>
          </div>
        ) : news.length === 0 ? (
          <div className="col-12 text-center text-muted py-5">
            Chưa có tin tức nào.
          </div>
        ) : (
          // Sửa lại: chỉ hiển thị tin tức của trang hiện tại
          sortNews(news)
            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
            .map((item) => (
              <div className="col-lg-3 col-md-6" key={item.id}>
                <div className="card h-100 shadow-sm border-0">
                  <div
                    style={{
                      height: 210,
                      overflow: "hidden",
                      background: "#f8f9fa",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="card-img-top"
                      style={{ height: 210, objectFit: "cover" }}
                    />
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold">{item.title}</h5>
                    <div className="mb-2 text-muted small">
                      <i className="bi bi-calendar-event"></i>{" "}
                      {formatDate(item.date)}
                    </div>
                    <p className="card-text">{item.summary}</p>
                    <div className="mt-auto">
                      <Link
                        to={`/news/${item.id}`}
                        className="btn btn-outline-success w-100"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
        )}
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <nav>
              <ul className="pagination custom-pagination">
                <li className={`page-item${page === 1 ? " disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page - 1)}
                  >
                    &lt;
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i + 1}
                    className={`page-item${page === i + 1 ? " active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item${
                    page === totalPages ? " disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(page + 1)}
                  >
                    &gt;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* Nút trở lại đầu trang */}
        <ScrollToTopButton bottom={88} right={32} zIndex={999} />
      </div>
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
    </div>
  );
};

export default News;
