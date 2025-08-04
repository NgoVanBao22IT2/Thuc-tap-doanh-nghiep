import React, { useState, useEffect } from 'react';

const ImageUpload = ({ onImageUpload, currentImage, label = "Hình ảnh" }) => {
  const [preview, setPreview] = useState(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentImage || '');
  const [error, setError] = useState('');

  useEffect(() => {
    setPreview(currentImage || '');
    setUrlInput(currentImage || '');
  }, [currentImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file hình ảnh!');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File không được vượt quá 5MB!');
        return;
      }

      setError('');
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setPreview(result);
        setUrlInput(result);
        onImageUpload(result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setUrlInput(url);
    setError('');
    
    if (url) {
      // Simple URL validation
      try {
        new URL(url);
        setPreview(url);
        onImageUpload(url);
      } catch {
        setError('URL không hợp lệ!');
        setPreview('');
      }
    } else {
      setPreview('');
      onImageUpload('');
    }
  };

  const handleImageError = () => {
    setError('Không thể tải hình ảnh từ URL này!');
    setPreview('');
  };

  const clearImage = () => {
    setPreview('');
    setUrlInput('');
    setError('');
    onImageUpload('');
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}:</label>
      
      {/* URL Input */}
      <div className="mb-2">
        <div className="input-group">
          <input
            type="url"
            className={`form-control ${error ? 'is-invalid' : ''}`}
            placeholder="Nhập URL hình ảnh..."
            value={urlInput}
            onChange={handleUrlChange}
          />
          {preview && (
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={clearImage}
            >
              Xóa
            </button>
          )}
        </div>
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>
      
      {/* File Upload */}
      <div className="mb-2">
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && (
          <small className="text-primary">
            <i className="spinner-border spinner-border-sm me-1"></i>
            Đang xử lý...
          </small>
        )}
      </div>
      
      {/* Preview */}
      {preview && !error && (
        <div className="mt-2">
          <img 
            src={preview} 
            alt="Preview" 
            className="img-thumbnail"
            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
            onError={handleImageError}
          />
          <div className="mt-1">
            <small className="text-muted">Preview</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;