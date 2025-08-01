import React from 'react';
import { Link } from 'react-router-dom';

const PaymentBankInfo = () => (
  <div className="container my-5">
    <div className="card p-4">
      <h2 className="mb-3 text-success">Hướng dẫn chuyển khoản ngân hàng</h2>
      <p>Vui lòng chuyển khoản tới thông tin sau:</p>
      <ul>
        <li><b>Ngân hàng:</b> Vietcombank</li>
        <li><b>Số tài khoản:</b> 0123456789</li>
        <li><b>Chủ tài khoản:</b> BAOBAO SHOP</li>
        <li><b>Nội dung chuyển khoản:</b> <span className="text-danger">[Mã đơn hàng] + Số điện thoại</span></li>
      </ul>
      <p>Sau khi chuyển khoản, vui lòng liên hệ hotline để xác nhận đơn hàng.</p>
      <Link to="/profile" className="btn btn-success mt-3">Về trang cá nhân</Link>
    </div>
  </div>
);

export default PaymentBankInfo;
