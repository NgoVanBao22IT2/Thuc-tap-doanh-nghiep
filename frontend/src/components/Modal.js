import React from 'react';

const Modal = ({ 
  show, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'confirm'
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Hủy',
  showCancel = false
}) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="bi bi-check-circle-fill text-success fs-1"></i>;
      case 'error':
        return <i className="bi bi-exclamation-triangle-fill text-danger fs-1"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle-fill text-warning fs-1"></i>;
      case 'confirm':
        return <i className="bi bi-question-circle-fill text-primary fs-1"></i>;
      default:
        return <i className="bi bi-info-circle-fill text-info fs-1"></i>;
    }
  };

  const getHeaderClass = () => {
    switch (type) {
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-danger';
      case 'warning':
        return 'border-warning';
      case 'confirm':
        return 'border-primary';
      default:
        return 'border-info';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className={`modal-content ${getHeaderClass()}`} style={{ borderWidth: '3px' }}>
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">{title}</h5>
              {!showCancel && (
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={onClose}
                ></button>
              )}
            </div>
            <div className="modal-body text-center py-4">
              <div className="mb-3">
                {getIcon()}
              </div>
              <div className="mb-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                {message}
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <div className="d-flex gap-2 w-100">
                {showCancel && (
                  <button 
                    type="button" 
                    className="btn btn-secondary flex-fill"
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                )}
                <button 
                  type="button" 
                  className={`btn flex-fill ${
                    type === 'error' || type === 'confirm' ? 'btn-danger' :
                    type === 'success' ? 'btn-success' :
                    type === 'warning' ? 'btn-warning' : 'btn-primary'
                  }`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show" style={{ zIndex: 1050 }}></div>
    </>
  );
};

export default Modal;
