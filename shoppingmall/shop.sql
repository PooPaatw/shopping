USE `shop`;

-- 設定資料庫時區為 Asia/Taipei
SET time_zone = '+08:00';

-- 禁用外鍵檢查
SET FOREIGN_KEY_CHECKS = 0;

-- 刪除表（按照依賴關係的反序）
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_series;    
DROP TABLE IF EXISTS phone_models;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS users_login;
DROP TABLE IF EXISTS shopping_carts;

-- 重新啟用外鍵檢查
SET FOREIGN_KEY_CHECKS = 1;

-- 創建表

-- 用戶表
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    mobilenum varchar(10) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME
) AUTO_INCREMENT = 10001 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 用戶登入記錄表
CREATE TABLE users_login (
    login_no INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    last_login DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE KEY (user_id, username)
);


-- //////////////////商品表格//////////////////
-- 品牌表
CREATE TABLE brands (
    brand_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 手機型號表
CREATE TABLE phone_models (
    model_id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(brand_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 產品系列表
CREATE TABLE product_series (
    series_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 產品表
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    model_id INT,
    series_id INT,
    description TEXT,
    price INT NOT NULL,
    stock_quantity INT NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
	release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES phone_models(model_id),
    FOREIGN KEY (series_id) REFERENCES product_series(series_id)
) AUTO_INCREMENT = 4001 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- //////////////////商品表格//////////////////

-- //////////////////訂單與購物車表格//////////////////
-- 訂單表
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total_amount INT NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) AUTO_INCREMENT = 900001 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 訂單明細
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    unit_price INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
-- 購物車資料表
CREATE TABLE shopping_carts (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
-- 購物車表
CREATE TABLE cart_items (
    cart_item_id INT PRIMARY KEY AUTO_INCREMENT,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES shopping_carts(cart_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
-- //////////////////商品表格//////////////////


-- 評論表
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    product_id INT,
    rating INT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 後台員工表
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    staffname VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    mobilenum varchar(10) NOT NULL,
    role ENUM('manager', 'staff') NOT NULL,
    hire_date DATE NOT NULL,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)AUTO_INCREMENT = 5001;


-- 員工資料
INSERT INTO employees (staffname, password, mobilenum, role, hire_date) VALUES ('tom', '123', '0911111111', 'manager', '2023-10-10');
INSERT INTO employees (staffname, password, mobilenum, role, hire_date) VALUES ('nick', '123', '0911111112', 'staff', '2024-05-10');
INSERT INTO employees (staffname, password, mobilenum, role, hire_date) VALUES ('jie', '123', '0911111113', 'staff', '2024-10-10');
INSERT INTO employees (staffname, password, mobilenum, role, hire_date) VALUES ('nick', '123', '0911111114', 'staff', '2024-05-12');


-- 會員資料
INSERT INTO users (username, password, mobilenum, email) VALUES ('jason', '123', '0912345678', 'f10505117@gmail.com');
INSERT INTO users (username, password, mobilenum, email) VALUES ('alex', '123', '0912345671', 'f@gmail.com');
INSERT INTO users (username, password, mobilenum, email) VALUES ('jay', '123', '0912345672', 'ff@gmail.com');
INSERT INTO users (username, password, mobilenum, email) VALUES ('maple', '123', '0912345673', 'fff@gmail.com');


-- 插入品牌測試數據
INSERT INTO brands (name, description) VALUES
('Apple', 'Apple品牌'),
('Samsung', 'Samsung品牌');

-- 插入手機型號測試數據
INSERT INTO phone_models (brand_id, name, description) VALUES
-- Apple型號
(1, 'iPhone 13', 'iPhone 13手機殼'),
(1, 'iPhone 13 Pro', 'iPhone 13 Pro手機殼'),
(1, 'iPhone 13 Pro Max', 'iPhone 13 Pro Max手機殼'),

(1, 'iPhone 14', 'iPhone 14手機殼'),
(1, 'iPhone 14 Pro', 'iPhone 14 Pro手機殼'),
(1, 'iPhone 14 Pro Max', 'iPhone 14 Pro Max手機殼'),

(1, 'iPhone 15', 'iPhone 15手機殼'),
(1, 'iPhone 15 Pro', 'iPhone 15 Pro手機殼'),
(1, 'iPhone 15 Pro Max', 'iPhone 15 Pro Max手機殼'),

-- Samsung型號
(2, 'Galaxy S24', 'Samsung S24手機殼'),
(2, 'Galaxy S24 Ultra', 'Samsung S24 Ultra手機殼');

-- 插入產品系列測試數據
INSERT INTO product_series (name, description) VALUES
('透明防摔殼系列', '基礎款透明防摔保護殼，適合喜歡簡約風格的用戶'),
('哆啦A夢聯名款系列', '與哆啦A夢聯名的限定款式'),
('Hello Kitty聯名款系列', '與Hello Kitty聯名的限定款式'),
('軍規防摔殼系列', '通過軍規測試，提供最佳防護');

-- 插入產品測試數據
INSERT INTO products (name, model_id, series_id, description, price, stock_quantity, image_url, release_date) VALUES
-- iPhone 13 的產品
('iPhone 13 透明防摔殼', 1, 1, '超輕透明防摔殼，完美展現手機原色', 500, 50, 'iphone13_clear_case.jpg', '2021-01-01'),
('iPhone 13 哆啦A夢限定版', 1, 2, '哆啦A夢90周年紀念款', 800, 50, 'iphone13_doraemon.jpg', '2021-01-01'),
('iPhone 13 Hello Kitty限定版', 1, 3, 'Hello Kitty限定款', 800, 50, 'iphone13_hellokitty.jpg', '2021-01-01'),

-- iPhone 13 Pro的產品
('iPhone 13 Pro 透明防摔殼', 2, 1, '超輕透明防摔殼，完美展現手機原色', 600, 50, 'iphone13pro_clear_case.jpg', '2021-01-01'),
('iPhone 13 Pro 軍規防摔殼', 2, 4, '通過美國軍規測試', 1000, 50, 'iphone13pro_military.jpg', '2021-01-01');
INSERT INTO products (name, model_id, series_id, description, price, stock_quantity, image_url, release_date) VALUES
-- iPhone 14 的產品
('iPhone 14 透明防摔殼', 4, 1, '超輕透明防摔殼，完美展現手機原色', 500, 50, 'iphone14_clear_case.jpg', '2022-02-01'),
('iPhone 14 哆啦A夢限定版', 4, 2, '哆啦A夢90周年紀念款', 800, 50, 'iphone14_doraemon.jpg', '2022-02-01'),
('iPhone 14 Hello Kitty限定版', 4, 3, 'Hello Kitty限定款', 800, 50, 'iphone14_hellokitty.jpg', '2022-02-01'),

-- iPhone 14 Pro的產品
('iPhone 14 Pro 透明防摔殼', 5, 1, '超輕透明防摔殼，完美展現手機原色', 600, 50, 'iphone14pro_clear_case.jpg', '2022-02-01'),
('iPhone 14 Pro 軍規防摔殼', 5, 4, '通過美國軍規測試', 1000, 50, 'iphone14pro_military.jpg', '2022-02-01');
INSERT INTO products (name, model_id, series_id, description, price, stock_quantity, image_url, release_date) VALUES
-- iPhone 15 的產品
('iPhone 15 透明防摔殼', 7, 1, '超輕透明防摔殼，完美展現手機原色', 500, 50, 'iphone15_clear_case.jpg', '2023-03-01'),
('iPhone 15 哆啦A夢限定版', 7, 2, '哆啦A夢90周年紀念款', 800, 50, 'iphone15_doraemon.jpg', '2023-03-01'),
('iPhone 15 Hello Kitty限定版', 7, 3, 'Hello Kitty限定款', 800, 50, 'iphone15_hellokitty.jpg', '2023-03-01'),

-- iPhone 15 Pro的產品
('iPhone 15 Pro 透明防摔殼', 8, 1, '超輕透明防摔殼，完美展現手機原色', 600, 50, 'iphone15pro_clear_case.jpg', '2023-03-01'),
('iPhone 15 Pro 軍規防摔殼', 8, 4, '通過美國軍規測試', 1000, 50, 'iphone15pro_military.jpg', '2023-03-01');

