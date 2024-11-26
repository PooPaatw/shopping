const { mySqlPool: db } = require("../config/database");
const crypto = require("crypto");
const sendEmail = require("../middleware/emailService");

// 查詢會員訂單
const getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;

    // 驗證會員ID
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "請提供會員ID",
      });
    }

    // 查詢訂單
    const [orders] = await db.query(
      `SELECT 
        o.order_id,
        o.total_amount,
        o.status,
        o.created_at
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [user_id]
    );

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "該會員沒有訂單記錄",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "查詢成功",
      data: orders,
    });
  } catch (error) {
    console.error("查詢會員訂單錯誤:", error);
    res.status(500).json({
      success: false,
      message: "查詢訂單時發生錯誤",
      error: error.message,
    });
  }
};

// 查詢全部會員
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.mobilenum,
        u.created_at,
        ul.last_login
      FROM users u
      LEFT JOIN users_login ul ON u.user_id = ul.user_id
      ORDER BY u.user_id 
    `);

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "目前沒有任何會員資料",
        data: [],
      });
    }

    // 格式化數據
    const formattedData = rows.map((user) => ({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      mobilenum: user.mobilenum,
      created_at: new Date(user.created_at.getTime() + 8 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '),
    last_login: user.last_login 
      ? new Date(user.last_login.getTime() + 8 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ')
      : null,
    }));

    res.status(200).json({
      success: true,
      message: "成功獲取所有會員資料",
      totalMembers: rows.length,
      data: formattedData,
    });
  } catch (error) {
    console.error("獲取會員資料錯誤:", error);
    res.status(500).json({
      success: false,
      message: "獲取會員資料時發生錯誤",
      error: error.message,
    });
  }
};

// 用使用者名字查詢會員ID
const getUserByName = async (req, res) => {
  try {
    const { user_id, username } = req.query;

    // 記錄接收到的查詢參數
    console.log("Received query parameters:", { user_id, username });

    if (!user_id?.trim() && !username?.trim()) {
      return res.status(400).json({
        success: false,
        message: "請提供會員編號或名稱",
      });
    }

    // 構建基本的 SQL 查詢
    let sql = `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.mobilenum,
        u.created_at,
        ul.last_login
      FROM users u
      LEFT JOIN users_login ul ON u.user_id = ul.user_id
      WHERE 1=1
    `;
    const params = [];

    // 根據提供的參數添加查詢條件
    if (user_id?.trim()) {
      sql += " AND u.user_id LIKE ?";
      params.push(`%${user_id.trim()}%`);
    }

    if (username?.trim()) {
      sql += " AND u.username LIKE ?";
      params.push(`%${username.trim()}%`);
    }

    // 添加排序
    sql += " ORDER BY u.user_id";

    // 執行查詢
    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "查無此會員資料",
      });
    }

    // 格式化數據
    const formattedData = rows.map((user) => ({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      mobilenum: user.mobilenum,
      created_at: user.created_at,
      last_login: user.last_login,
    }));

    res.status(200).json({
      success: true,
      message: "查詢成功",
      totalFound: rows.length,
      userDetails: formattedData,
    });
  } catch (err) {
    console.error("查詢會員錯誤:", err);
    res.status(500).json({
      success: false,
      message: "查詢會員時發生錯誤",
      error: err.message,
    });
  }
};

// 新增會員
const createUser = async (req, res) => {
  try {
    const { username, password, mobilenum, email } = req.body;
    if (!username || !password || !mobilenum || !email) {
      return res
        .status(400)
        .json({ success: false, message: "請提供所有必要的字段" });
    }

    // 檢查用戶名是否已存在
    const [existingUsername] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (existingUsername.length > 0) {
      return res.status(409).json({ success: false, message: "帳號已被註冊" });
    }

    // 檢查電子郵件是否已存在
    const [existingEmail] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(409).json({ success: false, message: "信箱已被註冊" });
    }

    // 檢查手機號碼是否已存在
    const [existingMobile] = await db.query(
      "SELECT * FROM users WHERE mobilenum = ?",
      [mobilenum]
    );
    if (existingMobile.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "手機號碼已被註冊" });
    }

    // 如果都不存在，則創建新用戶
    const [result] = await db.query(
      "INSERT INTO users (username, password, mobilenum, email) VALUES (?, ?, ?, ?)",
      [username, password, mobilenum, email]
    );
    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ success: false, message: "創建會員記錄時出錯" });
    }

    return res.status(201).json({ success: true, message: "註冊成功" });
  } catch (err) {
    console.error("註冊錯誤:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 更新會員資料
const updateUser = async (req, res) => {
  try {
    const { user_id, email, mobilenum } = req.body;

    // 驗證必要欄位
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "請提供會員編號",
      });
    }

    // 檢查會員是否存在
    const [existingUser] = await db.query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [user_id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "找不到該會員",
      });
    }

    // 驗證電子郵件格式
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        message: "無效的電子郵件格式",
      });
    }

    // 驗證手機號碼格式
    if (mobilenum && !mobilenum.match(/^09\d{8}$/)) {
      return res.status(400).json({
        success: false,
        message: "無效的手機號碼格式",
      });
    }

    // 檢查電子郵件是否已被其他用戶使用
    if (email) {
      const [existingEmail] = await db.query(
        "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
        [email, user_id]
      );
      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          message: "此電子郵件已被使用",
        });
      }
    }

    // 檢查手機號碼是否已被其他用戶使用
    if (mobilenum) {
      const [existingMobile] = await db.query(
        "SELECT user_id FROM users WHERE mobilenum = ? AND user_id != ?",
        [mobilenum, user_id]
      );
      if (existingMobile.length > 0) {
        return res.status(409).json({
          success: false,
          message: "此手機號碼已被使用",
        });
      }
    }

    // 構建更新查詢
    let updateFields = [];
    let queryParams = [];

    if (email) {
      updateFields.push("email = ?");
      queryParams.push(email);
    }

    if (mobilenum) {
      updateFields.push("mobilenum = ?");
      queryParams.push(mobilenum);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "請提供要更新的資料",
      });
    }

    // 添加更新時間
    updateFields.push("updated_at = CURRENT_TIMESTAMP");

    // 添加 user_id 到參數陣列
    queryParams.push(user_id);

    // 執行更新操作
    const [result] = await db.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE user_id = ?`,
      queryParams
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "更新失敗，請確認會員資料",
      });
    }

    // 查詢更新後的會員資料
    const [updatedUser] = await db.query(
      `SELECT user_id, username, email, mobilenum, created_at 
       FROM users 
       WHERE user_id = ?`,
      [user_id]
    );

    res.status(200).json({
      success: true,
      message: "會員資料更新成功",
      data: updatedUser[0],
    });
  } catch (error) {
    console.error("更新會員錯誤:", error);
    res.status(500).json({
      success: false,
      message: "更新會員資料時發生錯誤",
      error: error.message,
    });
  }
};

// 登入會員
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await db.query(
      "SELECT * FROM users WHERE BINARY username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "帳號或密碼錯誤",
      });
    }

    const user = users[0];

    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: "帳號或密碼錯誤",
      });
    }

    // 更新最後登入時間
    const now = new Date();
    const lastLoginTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const currentTime = lastLoginTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await db.query(
      `INSERT INTO users_login (user_id, username, last_login)
       SELECT u.user_id, u.username, ? 
       FROM users u
       WHERE u.username = ?
       ON DUPLICATE KEY UPDATE last_login = VALUES(last_login)`,
      [currentTime, username]
    );

    // 準備返回的用戶資料（排除密碼等敏感信息）
    const userData = {
      user_id: user.user_id,
      username: user.username,
      password: user.password,
      email: user.email,
      mobilenum: user.mobilenum,
      created_at: user.created_at,
      last_login: currentTime,
    };

    // 設置 session
    req.session.user = userData;

    res.json({
      success: true,
      message: "登入成功",
      user: userData,
    });
  } catch (error) {
    console.error("登入錯誤:", error);
    res.status(500).json({
      success: false,
      message: "登入過程中發生錯誤",
    });
  }
};

// 請求會員重設密碼(寄信)
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    // 檢查用戶是否存在
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    console.log("查詢結果:", users);

    if (users.length === 0) {
      return res.status(404).json({
        message: "查無此信箱。",
      });
    }

    const user = users[0];

    // 生成重置令牌
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60000); // 10分鐘後過期

    // 將重置令牌保存到數據庫
    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE user_id = ?",
      [resetToken, resetTokenExpiry, user.user_id]
    );

    // 發送重置密碼郵件
    const resetUrl = `http://localhost:8000/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "密碼重置",
      html: `
        <p>您請求重置密碼。請點擊下面的鏈接來重置您的密碼：</p>
        <a href="${resetUrl}">重置密碼</a>
        <p>如果您沒有請求重置密碼，請忽略此郵件。</p>
      `,
    });

    res.status(200).json({
      message: "如果該郵箱對應的帳戶存在，重置密碼的說明將會發送到該郵箱。",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res
      .status(500)
      .json({ message: "處理密碼重置請求時發生錯誤，請稍後再試。" });
  }
};

// 重置會員密碼
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // 調試輸出：檢查輸入的重置令牌和當前時間
    console.log("重置令牌:", token);
    console.log("當前時間:", new Date());

    // 查找具有有效重置令牌的用戶
    const [users] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
      [token, new Date()]
    );

    // 調試輸出：檢查查詢結果
    console.log("查詢結果:", users);

    if (users.length === 0) {
      return res.status(400).json({ message: "網頁已過期，請重新嘗試" });
    }

    const user = users[0];

    // 檢查新密碼是否與舊密碼相同
    if (newPassword === user.password) {
      return res.status(400).json({ message: "新密碼不能與舊密碼相同" });
    }

    // 更新用戶密碼並清除重置令牌
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?",
      [newPassword, user.user_id]
    );

    res.status(200).json({ message: "密碼已成功重置" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "重置密碼時發生錯誤，請稍後再試" });
  }
};

// 取得會員資料
const getUserProfile = async (req, res) => {
  try {
    // 從 session 或認證中間件獲取用戶信息
    const username = req.session?.user?.username || req.user?.username;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: "未登入",
      });
    }

    const [user] = await db.query(
      `SELECT 
        u.user_id,
        u.username,
        u.email,
        u.mobilenum,
        u.created_at,
        ul.last_login
      FROM users u
      LEFT JOIN users_login ul ON u.user_id = ul.user_id
      WHERE u.username = ?`,
      [username]
    );

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "找不到用戶資料",
      });
    }

    res.status(200).json({
      success: true,
      message: "獲取用戶資料成功",
      user: user[0],
    });
  } catch (error) {
    console.error("獲取用戶資料錯誤:", error);
    res.status(500).json({
      success: false,
      message: "獲取用戶資料時發生錯誤",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserByName,
  createUser,
  updateUser,
  login,
  getUserOrders,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
};
