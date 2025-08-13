import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
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

  // Hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <span className="ms-auto text-muted">
            Tổng: <b>{sortNews(news).length}</b> Tin tức
          </span>
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
          sortNews(news).map((item) => (
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
                <div className="card-body d-flex flex-column" >
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

        {/* Nút trở lại đầu trang */}
        <button
          type="button"
          onClick={scrollToTop}
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 999,
            background: "#00a65a",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: 24,
            cursor: "pointer",
          }}
          title="Lên đầu trang"
        >
          <i className="bi bi-arrow-up"></i>
        </button>
      </div>
    </div>
  );
};

export default News;
