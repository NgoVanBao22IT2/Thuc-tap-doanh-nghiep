import React, { useState } from 'react';

const ImageUpload = ({ onImageUpload, currentImage, label = "Hình ảnh" }) => {
  const [preview, setPreview] = useState(currentImage || '');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
      
      // Simulate upload (in real app, you'd upload to server)
      setTimeout(() => {
        onImageUpload(file.name); // For now, just pass filename
        setUploading(false);
      }, 1000);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onImageUpload(url);
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}:</label>
      
      {/* URL Input */}
      <div className="mb-2">
        <input
          type="url"
          className="form-control"
          placeholder="Nhập URL hình ảnh..."
          onChange={handleUrlChange}
          defaultValue={currentImage || ''}
        />
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
          <small className="text-muted">Đang tải lên...</small>
        )}
      </div>
      
      {/* Preview */}
      {preview && (
        <div className="mt-2">
          <img 
            src={preview} 
            alt="Preview" 
            className="img-thumbnail"
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 