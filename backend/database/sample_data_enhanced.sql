USE badminton_shop;

-- Insert admin user trước
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('User Test', 'user@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer');

-- Insert categories trước
INSERT INTO categories (name, slug, description, status) VALUES
('Vợt cầu lông', 'vot-cau-long', 'Vợt cầu lông chuyên nghiệp các loại', 'active'),
('Giày cầu lông', 'giay-cau-long', 'Giày cầu lông chuyên dụng', 'active'),
('Áo quần', 'ao-quan', 'Trang phục thi đấu cầu lông', 'active'),
('Phụ kiện', 'phu-kien', 'Phụ kiện cầu lông đa dạng', 'active');

-- Insert brands
INSERT INTO brands (name, slug, description, logo) VALUES
('Yonex', 'yonex', 'Thương hiệu cầu lông số 1 thế giới từ Nhật Bản', '/images/brands/yonex.png'),
('Victor', 'victor', 'Thương hiệu cầu lông nổi tiếng từ Đài Loan', '/images/brands/victor.png'),
('Li-Ning', 'li-ning', 'Thương hiệu thể thao hàng đầu Trung Quốc', '/images/brands/lining.png'),
('Mizuno', 'mizuno', 'Thương hiệu thể thao Nhật Bản cao cấp', '/images/brands/mizuno.png'),
('FZ Forza', 'fz-forza', 'Thương hiệu cầu lông từ Đan Mạch', '/images/brands/fzforza.png');

-- Insert products với đầy đủ thông tin
INSERT INTO products (name, slug, description, short_description, sku, price, sale_price, stock_quantity, category_id, brand_id, weight, featured, image_url, status) VALUES
('Vợt cầu lông Yonex Arcsaber 11', 'vot-yonex-arcsaber-11', 'Vợt cầu lông cao cấp của Yonex với công nghệ Sonic Metal giúp tăng sức mạnh và độ chính xác. Thiết kế khí động học giúp giảm sức cản không khí, tăng tốc độ swing.', 'Vợt cầu lông cao cấp Yonex Arcsaber 11', 'YNX-ARC11-001', 2500000, 2250000, 15, 1, 1, 88, TRUE, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop', 'active'),

('Vợt Victor Jetspeed S 12', 'vot-victor-jetspeed-s12', 'Vợt tốc độ cao với thiết kế khí động học, phù hợp với lối chơi tấn công. Khung vợt được làm từ carbon chất lượng cao, mang lại cảm giác chắc chắn khi đánh.', 'Vợt tốc độ cao Victor Jetspeed S 12', 'VCT-JS12-002', 1800000, NULL, 20, 1, 2, 83, TRUE, 'https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=400&h=300&fit=crop', 'active'),

('Giày Yonex Power Cushion 65 Z2', 'giay-yonex-power-cushion-65z2', 'Giày cầu lông chuyên nghiệp với công nghệ đệm Power Cushion hấp thụ sốc tối ưu. Đế cao su chống trượt, phù hợp với mọi loại sân cầu lông.', 'Giày cầu lông Yonex Power Cushion 65 Z2', 'YNX-PC65Z2-003', 3200000, 2880000, 25, 2, 1, 320, FALSE, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop', 'active'),

('Giày Victor A922', 'giay-victor-a922', 'Giày cầu lông nhẹ, thoáng khí với đế chống trượt, phù hợp thi đấu. Thiết kế ôm chân, hỗ trợ tối đa cho các chuyển động nhanh trên sân.', 'Giày cầu lông Victor A922', 'VCT-A922-004', 2100000, NULL, 30, 2, 2, 290, FALSE, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop', 'active'),

('Áo cầu lông Yonex 10298', 'ao-yonex-10298', 'Áo thi đấu nam chính hãng với chất liệu thoáng mát, thấm hút mồ hôi tốt. Thiết kế thể thao, thoải mái cho mọi chuyển động.', 'Áo cầu lông Yonex 10298', 'YNX-10298-005', 850000, 765000, 50, 3, 1, 150, FALSE, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', 'active'),

('Quần cầu lông Victor R-75201', 'quan-victor-r75201', 'Quần short thi đấu nam với chất liệu co giãn 4 chiều, thoải mái vận động. Thiết kế năng động, phù hợp cho cả tập luyện và thi đấu.', 'Quần short Victor R-75201', 'VCT-R75201-006', 650000, NULL, 40, 3, 2, 120, FALSE, 'https://images.unsplash.com/photo-1506629905687-c7a4b1c3f46f?w=400&h=300&fit=crop', 'active'),

('Túi vợt Yonex Pro Racquet Bag', 'tui-vot-yonex-pro', 'Túi đựng vợt cao cấp chứa được 6 cây vợt với ngăn riêng cho giày và phụ kiện. Chất liệu bền bỉ, thiết kế tiện lợi.', 'Túi vợt Yonex Pro Racquet Bag', 'YNX-PRB-007', 1200000, NULL, 18, 4, 1, 800, FALSE, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop', 'active'),

('Cước cầu lông Yonex BG80 Power', 'cuoc-yonex-bg80-power', 'Cước vợt chuyên nghiệp với độ bền cao và khả năng kiểm soát tốt. Sợi cước đặc biệt giúp tăng lực đánh và độ chính xác.', 'Cước Yonex BG80 Power', 'YNX-BG80-008', 320000, 288000, 100, 4, 1, 10, FALSE, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', 'active'),

('Vợt Li-Ning Windstorm 72', 'vot-lining-windstorm-72', 'Vợt cầu lông trung cấp với thiết kế cân bằng, phù hợp người mới chơi. Giá cả phải chăng, chất lượng đảm bảo.', 'Vợt Li-Ning Windstorm 72', 'LN-WS72-009', 1200000, NULL, 22, 1, 3, 85, FALSE, 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=300&fit=crop', 'active'),

('Giày Mizuno Wave Fang SS2', 'giay-mizuno-wave-fang-ss2', 'Giày cầu lông Nhật Bản với công nghệ Wave hỗ trợ chuyển động linh hoạt. Thiết kế êm ái, phù hợp với người chơi chuyên nghiệp.', 'Giày Mizuno Wave Fang SS2', 'MZ-WFSS2-010', 2800000, NULL, 12, 2, 4, 310, FALSE, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop', 'active'),

('Vợt FZ Forza Power 988 S', 'vot-fz-forza-power-988s', 'Vợt cầu lông châu Âu với khung carbon cao cấp, cân bằng lực và tốc độ. Thiết kế đẹp mắt, hiệu suất cao.', 'Vợt FZ Forza Power 988 S', 'FZ-P988S-011', 1450000, 1305000, 15, 1, 5, 87, FALSE, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop', 'active'),

('Áo cầu lông Victor T-01001', 'ao-victor-t01001', 'Áo thể thao nam với thiết kế thời trang, chất liệu polyester cao cấp. Thoáng mát, khô ráo nhanh chóng.', 'Áo Victor T-01001', 'VCT-T01001-012', 750000, NULL, 35, 3, 2, 140, FALSE, 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=300&fit=crop', 'active');

-- Insert shipping methods
INSERT INTO shipping_methods (name, description, price, estimated_days) VALUES
('Giao hàng tiêu chuẩn', 'Giao hàng trong 3-5 ngày làm việc', 30000, '3-5 ngày'),
('Giao hàng nhanh', 'Giao hàng trong 1-2 ngày làm việc', 50000, '1-2 ngày'),
('Giao hàng siêu tốc', 'Giao hàng trong 24h', 80000, '24 giờ'),
('Miễn phí giao hàng', 'Miễn phí cho đơn hàng trên 500k', 0, '3-7 ngày');

-- Insert coupons
INSERT INTO coupons (code, name, description, type, value, minimum_amount, valid_from, valid_to) VALUES
('WELCOME10', 'Chào mừng khách hàng mới', 'Giảm 10% cho đơn hàng đầu tiên', 'percentage', 10, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('FREESHIP', 'Miễn phí vận chuyển', 'Miễn phí ship cho đơn từ 300k', 'fixed', 30000, 300000, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY)),
('SALE50K', 'Giảm 50k', 'Giảm 50k cho đơn hàng từ 500k', 'fixed', 50000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY));

-- Insert slides
INSERT INTO slides (title, description, image, link, button_text, sort_order) VALUES
('Vợt Yonex 2024', 'Bộ sưu tập vợt Yonex mới nhất', '/images/slides/slide1.jpg', '/products?brand=yonex', 'Xem ngay', 1),
('Giày cầu lông sale 30%', 'Khuyến mãi lớn cho tất cả giày cầu lông', '/images/slides/slide2.jpg', '/products?category=giay-cau-long', 'Mua ngay', 2),
('Phụ kiện cao cấp', 'Túi vợt, cước, băng quấn chính hãng', '/images/slides/slide3.jpg', '/products?category=phu-kien', 'Khám phá', 3);

-- Insert FAQs
INSERT INTO faqs (question, answer, category, sort_order) VALUES
('Làm thế nào để chọn vợt cầu lông phù hợp?', 'Việc chọn vợt phụ thuộc vào trình độ, lối chơi và sở thích cá nhân. Người mới nên chọn vợt nhẹ, độ cứng trung bình.', 'Sản phẩm', 1),
('Chính sách đổi trả như thế nào?', 'Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày với sản phẩm còn nguyên tem, chưa sử dụng.', 'Chính sách', 2),
('Thời gian giao hàng bao lâu?', 'Thời gian giao hàng từ 1-7 ngày tùy theo khu vực và phương thức vận chuyển.', 'Vận chuyển', 3);

-- Insert settings
INSERT INTO settings (key_name, value, description, type) VALUES
('site_name', 'Badminton Shop', 'Tên website', 'text'),
('site_description', 'Cửa hàng thiết bị cầu lông hàng đầu Việt Nam', 'Mô tả website', 'textarea'),
('contact_phone', '0123-456-789', 'Số điện thoại liên hệ', 'text'),
('contact_email', 'info@badmintonshop.com', 'Email liên hệ', 'text'),
('contact_address', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 'Địa chỉ liên hệ', 'textarea'),
('free_shipping_threshold', '500000', 'Miễn phí ship từ', 'number'),
('currency', 'VND', 'Đơn vị tiền tệ', 'text');

-- Insert sample order với order_number
INSERT INTO orders (user_id, order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, status, created_at) VALUES
(2, 'ORD-001', 'Nguyễn Văn An', 'user@test.com', '0901234567', '123 Nguyễn Văn Linh, Quận 7, TP.HCM', 5300000, 'pending', '2024-01-15 10:30:00'),
(2, 'ORD-002', 'Nguyễn Văn An', 'user@test.com', '0901234567', '456 Lê Văn Việt, Quận 9, TP.HCM', 3850000, 'confirmed', '2024-01-14 14:20:00'),
(2, 'ORD-003', 'Nguyễn Văn An', 'user@test.com', '0901234567', '789 Võ Văn Tần, Quận 3, TP.HCM', 1970000, 'shipped', '2024-01-13 09:15:00'),
(2, 'ORD-004', 'Nguyễn Văn An', 'user@test.com', '0901234567', '321 Phan Xích Long, Phú Nhuận, TP.HCM', 2500000, 'delivered', '2024-01-12 16:45:00'),
(2, 'ORD-005', 'Nguyễn Văn An', 'user@test.com', '0901234567', '654 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', 1520000, 'cancelled', '2024-01-11 11:30:00');

-- Update order_items với product_name và product_sku
INSERT INTO order_items (order_id, product_id, product_name, product_sku, quantity, price, total) VALUES
-- Order 1
(1, 1, 'Vợt cầu lông Yonex Arcsaber 11', 'YNX-ARC11-001', 1, 2500000, 2500000),
(1, 3, 'Giày Yonex Power Cushion 65 Z2', 'YNX-PC65Z2-003', 1, 3200000, 3200000),

-- Order 2  
(2, 2, 'Vợt Victor Jetspeed S 12', 'VCT-JS12-002', 1, 1800000, 1800000),
(2, 5, 'Áo cầu lông Yonex 10298', 'YNX-10298-005', 1, 850000, 850000),
(2, 6, 'Quần cầu lông Victor R-75201', 'VCT-R75201-006', 1, 650000, 650000),

-- Order 3
(3, 4, 'Giày Victor A922', 'VCT-A922-004', 1, 2100000, 2100000),

-- Order 4
(4, 1, 'Vợt cầu lông Yonex Arcsaber 11', 'YNX-ARC11-001', 1, 2500000, 2500000),

-- Order 5
(5, 7, 'Túi vợt Yonex Pro Racquet Bag', 'YNX-PRB-007', 1, 1200000, 1200000),
(5, 8, 'Cước cầu lông Yonex BG80 Power', 'YNX-BG80-008', 1, 320000, 320000);

-- No changes needed, sample data matches schema and backend logic.
