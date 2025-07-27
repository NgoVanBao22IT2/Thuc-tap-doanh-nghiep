-- Dữ liệu mẫu cho bảng slides
USE badminton_shop;

-- Xóa dữ liệu cũ nếu có
DELETE FROM slides;

-- Thêm dữ liệu mẫu
INSERT INTO slides (title, description, image, link, button_text, sort_order, status, created_at) VALUES
('Vợt Yonex 2024', 'Bộ sưu tập vợt Yonex mới nhất với công nghệ tiên tiến', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&h=400&fit=crop', '/products?category=2', 'Xem ngay', 1, 'active', NOW()),
('Giày cầu lông sale 30%', 'Khuyến mãi lớn cho giày cầu lông chính hãng', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=400&fit=crop', '/products?category=3', 'Mua ngay', 2, 'active', NOW()),
('Phụ kiện cao cấp', 'Túi vợt, cước, băng quấn chính hãng chất lượng cao', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop', '/products?category=5', 'Khám phá', 3, 'active', NOW()),
('Áo quần thể thao', 'Bộ sưu tập áo quần cầu lông mới nhất', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop', '/products?category=4', 'Xem bộ sưu tập', 4, 'active', NOW());

-- Hiển thị kết quả
SELECT * FROM slides ORDER BY sort_order ASC; 