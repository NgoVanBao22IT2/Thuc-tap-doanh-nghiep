import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ScrollToTopButton from "../components/ScrollToTopButton";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios
      .get(`/api/news/${id}`)
      .then((res) => setNews(res.data))
      .catch(() => setNews(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Demo: Nếu backend chưa có trường blocks, bạn có thể mock như sau:
  // Nếu news.blocks không tồn tại, tạo mảng blocks từ content và image
  const blocks = news?.blocks
    ? news.blocks
    : [
        { type: "text", content: news?.content },
        news?.image ? { type: "image", src: news.image } : null,
      ].filter(Boolean);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status"></div>
        <div className="mt-3 text-muted">Đang tải chi tiết tin tức...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">Không tìm thấy tin tức.</div>
        <Link to="/news" className="btn btn-outline-success mt-3">
          Quay lại danh sách tin tức
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: 1320 }}>
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
              onClick={() => navigate("/news")}
              style={{
                color: "#00a61eff",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Tin tức
            </button>
          </li>
          <li className="breadcrumb-item active">
            <button
              className="btn btn-link p-0"
              onClick={() => navigate("/newsdetail")}
              style={{
                color: "#00a61eff",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              {news.title}
            </button>
          </li>
        </ol>
      </nav>
      <div className="card shadow border-0 p-0">
        <div className="card-body px-4 py-4">
          <h1 className="fw-bold mb-2">{news.title}</h1>
          <div className="mb-3 d-flex flex-wrap align-items-center gap-3">
            <span className="text-muted">
              <i className="bi bi-calendar-event"></i> {formatDate(news.date)}
            </span>
            {news.category && (
              <span className="badge bg-info text-dark">
                <i className="bi bi-tag"></i> {news.category}
              </span>
            )}
            {news.author && (
              <span className="text-muted">
                <i className="bi bi-person"></i> {news.author}
              </span>
            )}
            {/* {news.status && (
              <span className={`badge bg-${news.status === 'published' ? 'success' : 'secondary'}`}>
                {news.status === 'published' ? 'Đã đăng' : 'Nháp'}
              </span>
            )} */}
          </div>
          <hr />
          {/* Render các khối nội dung và ảnh xen kẽ */}
          <div>
            {blocks.map((block, idx) =>
              block.type === "text" ? (
                <div
                  key={idx}
                  className="news-content mb-4"
                  style={{
                    whiteSpace: "pre-line",
                    fontSize: "1.15rem",
                    lineHeight: 1.7,
                  }}
                >
                  {block.content}
                </div>
              ) : block.type === "image" ? (
                <div
                  key={idx}
                  style={{
                    background: "#f8f9fa",
                    borderRadius: "0.5rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "1rem",
                    width: "100%",
                    maxHeight: "700px",
                    overflow: "hidden",
                    marginBottom: "2rem",
                  }}
                >
                  <img
                    src={block.src}
                    alt={`news-img-${idx}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "700px",
                      objectFit: "contain",
                      borderRadius: "0.5rem",
                    }}
                  />
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    {/* Nút trở lại đầu trang */}
        <ScrollToTopButton bottom={88} right={32} zIndex={999} />
    </div>
  );
};

export default NewsDetail;
