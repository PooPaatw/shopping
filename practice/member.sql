USE `my_database`;

-- 檢查外鍵是否存在，如果存在則刪除
SET @fk_exists = (SELECT COUNT(*)
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND CONSTRAINT_NAME = 'fk_login_record_member'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY');

SET @sql = IF(@fk_exists > 0,
    'ALTER TABLE `login_record` DROP FOREIGN KEY `fk_login_record_member`',
    'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 刪除 login_record 表（如果存在）
DROP TABLE IF EXISTS login_record;

-- 刪除 member 表（如果存在）
DROP TABLE IF EXISTS member;

-- 創建 member 表
CREATE TABLE `member` (
  `username` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,	
  `mobilenum` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `creat_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`username`),
  UNIQUE KEY `mobilenum_UNIQUE` (`mobilenum`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 插入測試數據
INSERT INTO member (username, password, mobilenum, email) VALUES ('tom', '123', '0911111111', '123@gmail.com');
INSERT INTO member (username, password, mobilenum, email) VALUES ('peter', '1231', '0911111112', '124@gmail.com');

-- 創建 login_record 表
CREATE TABLE my_database.login_record (
  No INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(20) NOT NULL,
  login_record TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (No),
  INDEX `idx_login_record_desc` (`login_record` DESC),
  INDEX `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 添加外鍵約束
ALTER TABLE `login_record`
ADD CONSTRAINT `fk_login_record_member`
FOREIGN KEY (`username`) REFERENCES `member` (`username`)
ON DELETE CASCADE
ON UPDATE CASCADE;