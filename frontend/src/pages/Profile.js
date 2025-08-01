import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm p-4">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                   style={{width: '80px', height: '80px', overflow: 'hidden'}}>
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : (
                  <i className="bi bi-person-fill fs-1"></i>
                )}
              </div>
              <div>
                <h4 className="mb-1">{currentUser?.name}</h4>
                <span className={`badge ${currentUser?.role === 'admin' ? 'bg-warning' : currentUser?.role === 'staff' ? 'bg-info' : 'bg-light text-dark'}`}>
                  {currentUser?.role === 'admin' ? 'Quản trị viên' : currentUser?.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                </span>
              </div>
            </div>
            <table className="table table-borderless mb-0">
              <tbody>
                <tr>
                  <th>Email:</th>
                  <td>{currentUser?.email}</td>
                </tr>
                <tr>
                  <th>Số điện thoại:</th>
                  <td>{currentUser?.phone || <span className="text-muted">Chưa cập nhật</span>}</td>
                </tr>
                <tr>
                  <th>Địa chỉ:</th>
                  <td>{currentUser?.address || <span className="text-muted">Chưa cập nhật</span>}</td>
                </tr>
                <tr>
                  <th>Ngày sinh:</th>
                  <td>{currentUser?.date_of_birth ? new Date(currentUser.date_of_birth).toLocaleDateString('vi-VN') : <span className="text-muted">Chưa cập nhật</span>}</td>
                </tr>
                <tr>
                  <th>Giới tính:</th>
                  <td>
                    {currentUser?.gender === 'male' && 'Nam'}
                    {currentUser?.gender === 'female' && 'Nữ'}
                    {currentUser?.gender === 'other' && 'Khác'}
                    {!currentUser?.gender && <span className="text-muted">Chưa cập nhật</span>}
                  </td>
                </tr>
                <tr>
                  <th>Trạng thái tài khoản:</th>
                  <td>
                    <span className={`badge ${currentUser?.status === 'active' ? 'bg-success' : currentUser?.status === 'inactive' ? 'bg-secondary' : 'bg-danger'}`}>
                      {currentUser?.status === 'active' ? 'Hoạt động' : currentUser?.status === 'inactive' ? 'Chưa kích hoạt' : 'Bị khóa'}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th>Email xác thực:</th>
                  <td>
                    {currentUser?.email_verified_at
                      ? <span className="text-success">Đã xác thực</span>
                      : <span className="text-danger">Chưa xác thực</span>
                    }
                  </td>
                </tr>
                <tr>
                  <th>Ngày tạo:</th>
                  <td>{currentUser?.created_at ? new Date(currentUser.created_at).toLocaleString('vi-VN') : '-'}</td>
                </tr>
                <tr>
                  <th>Cập nhật lần cuối:</th>
                  <td>{currentUser?.updated_at ? new Date(currentUser.updated_at).toLocaleString('vi-VN') : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
