const { mySqlPool: db } = require("../config/database");

console.log("mySqlPool:", db);
// console.log("mySqlPool.query:", db.query);

// 查詢全部員工
const getEmpolyees = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM empolyees");
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Records found",
      });
    }
    res.status(200).json({
      success: true,
      message: "All Empolyees records",
      totalMembers: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Get All Empolyee API",
      error: err.message,
    });
  }
};

// 用名字查詢員工ID
const getEmpolyeeByName = async (req, res) => {
  try {
    const { staffname } = req.params;
    if (!staffname) {
      return res.status(400).json({
        success: false,
        message: "沒有這個員工名字",
      });
    }
    const [rows] = await db.query(
      "SELECT * FROM empolyees WHERE staffname = ?",
      [staffname]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Records found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Staff record found",
      memberDetails: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Get Staff by Staffname API",
      error: err.message,
    });
  }
};

// 新增員工
const createEmpolyee = async (req, res) => {
  try {
    const { staffname, password, mobilenum, role, hiredate } = req.body;
    if (!staffname || !password || !mobilenum || !role || !hiredate) {
      return res
        .status(400)
        .json({ success: false, message: "請提供所有必要的字段" });
    }

    const [result] = await db.query(
      "INSERT INTO empolyees (staffname, password, mobilenum, role, hire_date) VALUES (?, ?, ?, ?, ?)",
      [staffname, password, mobilenum, role, hiredate]
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

// 更新員工資料
const updateEmpolyee = async (req, res) => {
  try {
    const { empolyeeid } = req.params;
    const { staffname, password, mobilenum } = req.body;

    if (!empolyeeid) {
      return res.status(400).json({
        success: false,
        message: "沒有這個員工編號",
      });
    }
    const [result] = await db.query(
      "UPDATE empolyees SET staffname=?, password = ?, mobilenum = ? WHERE empolyee_id = ?",
      [staffname, password, mobilenum, empolyeeid]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "員工編號輸入錯誤",
      });
    }
    res.status(200).json({
      success: true,
      message: "員工資料更新完成",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Update Empolyee API",
      error: err.message,
    });
  }
};

// 刪除員工資料 (之後邏輯更改為狀態顯示false)
const deleteEmpolyee = async (req, res) => {
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

// 登入員工
const worklogin = async (req, res) => {
  try {
    console.log("Login attempt:", req.body.empolyeeid);
    const { empolyeeid, password } = req.body;

    const [staffs] = await db.query(
      "SELECT * FROM empolyees WHERE BINARY empolyee_id = ?",
      [empolyeeid]
    );

    if (staffs.length === 0) {
      console.log("員邊不對，想偷懶？");
      return res
        .status(401)
        .json({ success: false, message: "員邊不對，想偷懶？" });
    }

    const staff = staffs[0];

    if (password !== staff.password) {
      console.log("密碼不對，想偷懶？");
      return res
        .status(401)
        .json({ success: false, message: "密碼不對，想偷懶？" });
    }

    req.session.staff = {
      id: staff.empolyeeid,
      username: staff.staffname,
    };

    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24小時

    console.log("Login successful:", staffname);
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
  getEmpolyees,
  getEmpolyeeByName,
  createEmpolyee,
  updateEmpolyee,
  deleteEmpolyee,
  worklogin,
};
