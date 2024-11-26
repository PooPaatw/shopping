const { mySqlPool: db } = require("../config/database");

console.log("mySqlPool:", db);
// console.log("mySqlPool.query:", db.query);

// 查詢會員訂單
const getUserOrders = async (req, res) => {
  // 使用session中的用戶ID
  const userId = req.session.user.user_id;

  try {
    const [orders] = await db.query(
      `SELECT order_id, total_amount, status, created_at 
       FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "您目前沒有訂單記錄",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({
      success: false,
      message: "服務器錯誤,無法獲取訂單信息",
    });
  }
};
// 查詢全部會員
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Records found",
      });
    }
    res.status(200).json({
      success: true,
      message: "All Members records",
      totalMembers: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Get All User API",
      error: err.message,
    });
  }
};

// 用使用者名字查詢會員ID
const getUserByName = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({
        success: false,
        message: "查無此人",
      });
    }
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "查無此人",
      });
    }
    res.status(200).json({
      success: true,
      message: "User record found",
      userDetails: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Get User by Username API",
      error: err.message,
    });
  }
};

// 新增會員
const createUser = async (req, res) => {
  try {
    const { userid, username, password, mobilenum, email } = req.body;
    if (!userid || !username || !password || !mobilenum || !email) {
      return res
        .status(400)
        .json({ success: false, message: "請提供所有必要的字段" });
    }

    const [result] = await db.query(
      "INSERT INTO users (user_id, username, password, mobilenum,email) VALUES (?, ?, ?, ?, ?, ?)",
      [userid, username, password, mobilenum, email]
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
    const { userid } = req.params;
    const { username, password, mobilenum, email } = req.body;

    if (!userid) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or Provide userid",
      });
    }
    const [result] = await db.query(
      "UPDATE user SET username=?, password = ?, mobilenum = ?, email = ? WHERE user_id = ?",
      [username, password, mobilenum, email, userid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Member not found or no changes made",
      });
    }
    res.status(200).json({
      success: true,
      message: "Update Member data successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Update Member API",
      error: err.message,
    });
  }
};

// 刪除會員資料 (之後邏輯更改為狀態顯示false)
const deleteUser = async (req, res) => {
  // try {
  //   const { username } = req.params;
  //   if (!username) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Please Provide Member Username",
  //     });
  //   }
  //   const [result] = await db.query("DELETE FROM member WHERE username = ?", [
  //     username,
  //   ]);
  //   if (result.affectedRows === 0) {
  //     return res.status(404).json({
  //       success: false,
  //       message: "Member not found",
  //     });
  //   }
  //   res.status(200).json({
  //     success: true,
  //     message: "Member Deleted Successfully",
  //   });
  // } catch (err) {
  //   console.error(err);
  //   res.status(500).json({
  //     success: false,
  //     message: "Error in Delete Member API",
  //     error: err.message,
  //   });
  // }
};

// 登入會員
const login = async (req, res) => {
  try {
    console.log("Login attempt:", req.body.userid);
    const { userid, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE BINARY user_id = ?",
      [userid]
    );

    if (users.length === 0) {
      console.log("Login failed: User not found");
      return res
        .status(401)
        .json({ success: false, message: "帳號或密碼錯誤" });
    }

    const user = users[0];

    if (password !== user.password) {
      console.log("Login failed: Incorrect password");
      return res
        .status(401)
        .json({ success: false, message: "帳號或密碼錯誤" });
    }

    req.session.user = {
      id: user.userid,
      username: user.username,
      email: user.email,
    };

    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24小時

    console.log("Login successful:", username);
    console.log("Session after login:", req.session);

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res
          .status(500)
          .json({ success: false, message: "Session 保存失敗" });
      }
      res.json({ success: true, message: "登入成功" });
    });
  } catch (error) {
    console.error("登入錯誤:", error);
    res.status(500).json({ success: false, message: "登入過程中發生錯誤" });
  }
};

module.exports = {
  getUsers,
  getUserByName,
  createUser,
  updateUser,
  deleteUser,
  login,
  getUserOrders,
};
