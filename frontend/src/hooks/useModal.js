import { useState } from 'react';

export const useModal = () => {
  const [modal, setModal] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Hủy',
    showCancel: false
  });

  const showModal = ({
    title,
    message,
    type = 'info',
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Hủy',
    showCancel = false
  }) => {
    setModal({
      show: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText,
      showCancel
    });
  };

  const hideModal = () => {
    setModal(prev => ({ ...prev, show: false }));
  };

  // Convenience methods
  const showSuccess = (message, title = 'Thành công', onConfirm = null) => {
    showModal({ title, message, type: 'success', onConfirm });
  };

  const showError = (message, title = 'Lỗi') => {
    showModal({ title, message, type: 'error' });
  };

  const showWarning = (message, title = 'Cảnh báo') => {
    showModal({ title, message, type: 'warning' });
  };

  const showConfirm = (message, onConfirm, title = 'Xác nhận') => {
    showModal({ 
      title, 
      message, 
      type: 'confirm', 
      onConfirm, 
      showCancel: true,
      confirmText: 'Xác nhận',
      cancelText: 'Hủy'
    });
  };

  return {
    modal,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showConfirm
  };
};
