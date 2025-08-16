import React from "react";
import ScrollToTopButton from "../components/ScrollToTopButton";


const zaloUrl = "https://chat.zalo.me";
const shopUrl = "http://localhost:3000";

const ZaloContact = () => (
  <div
    className="container py-5 d-flex justify-content-center align-items-center"
    style={{ minHeight: "70vh" }}
  >
    <div
      className="card shadow border-0"
      style={{ maxWidth: 800, width: "100%" }}
    >
      <div className="card-body">
        <div className="row align-items-center">
          {/* Left: Logo, tên, nút, info */}
          <div className="col-md-7 col-12">
            <div className="d-flex align-items-center mb-2">
              <img
                src="/images/logo.png"
                alt="VNB Sport"
                style={{ width: 64, marginRight: 16 }}
              />
              <div>
                <h3 className="fw-bold mb-0" style={{ fontSize: "1.6rem" }}>
                  BAOBAO <span style={{ color: "#f7c948" }}><img src="/images/tich.png" style={{ height:'25px', width:'25px'}} /></span>
                </h3>
                <div className="mb-1 text-muted" style={{ fontSize: "1rem" }}>
                  Mua sắm & Bán lẻ
                </div>
              </div>
            </div>
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mb-3"
              style={{
                minWidth: 210,
                fontWeight: 500,
                fontSize: "1.1rem",
              }}
            >
              <i className="bi bi-chat-dots me-2"></i>Nhắn tin
            </a>
            <div className="mt-3 mb-2 fw-bold" style={{ fontSize: "1.1rem" }}>
              Thông tin chi tiết
            </div>
            <div className="mb-2">
              <span className="me-2">
                <i className="bi bi-house"></i>
              </span>
              <a href={shopUrl} target="_blank" rel="noopener noreferrer">
                {shopUrl}
              </a>
            </div>
            <hr />
            <div className="text-muted small">
              Hệ Thống Cửa Hàng Shop Cầu Lông BAOBAO
            </div>
          </div>
          {/* Right: QR code */}
          <div className="col-md-5 col-12 d-flex flex-column align-items-center justify-content-center">
            <img
              src="/images/QR-zalo.png"
              alt="Zalo QR"
              style={{
                width: 160,
                height: 160,
                marginBottom: 8,
                borderRadius: 8,
                background: "#fff",
                border: "1px solid #eee",
              }}
            />
            <div
              className="small text-muted text-center"
              style={{ maxWidth: 180 }}
            >
              Mở Zalo, bấm quét QR để quét và xem trên điện thoại
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Nút trở lại đầu trang */}
        <ScrollToTopButton bottom={88} right={32} zIndex={999} />
  </div>
);

export default ZaloContact;
