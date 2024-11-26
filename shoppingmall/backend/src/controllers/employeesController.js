const { mySqlPool: db } = require("../config/database");

// console.log("mySqlPool:", db);
// console.log("mySqlPool.query:", db.query);

// 查詢全部員工
const getEmployees = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employees");
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Records found",
      });
    }
    res.status(200).json({
      success: true,
      message: "All Employees records",
      totalMembers: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error in Get All Employee API",
      error: err.message,
    });
  }
};

// 用名字或員工編號查詢員工
const getEmployeeByName = async (req, res) => {
  try {
    const { staffname, employee_id } = req.query;

    // 輸入驗證
    if (!staffname?.trim() && !employee_id?.trim()) {
      return res.status(400).json({
        success: false,
        message: "請提供員工名字或員工編號",
      });
    }

    let sql = "SELECT * FROM employees WHERE 1=1";
    const params = [];

    // 如果有提供員工名字，添加模糊查詢條件
    if (staffname?.trim()) {
      sql += " AND staffname LIKE ?";
      params.push(`%${staffname.trim()}%`); // 使用 % 實現模糊匹配
    }

    // 如果有提供員工編號，添加模糊查詢條件
    if (employee_id?.trim()) {
      sql += " AND employee_id LIKE ?";
      params.push(`%${employee_id.trim()}%`); // 使用 % 實現模糊匹配
    }

    // 添加排序，讓結果更有條理
    sql += " ORDER BY employee_id ASC";

    // 查詢所有匹配的記錄
    const [rows] = await db.query(sql, params);

    // 檢查是否有查詢結果
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "未找到符合的員工記錄",
      });
    }

    // 返回所有匹配的記錄
    res.status(200).json({
      success: true,
      message: "查詢成功",
      totalFound: rows.length,
      memberDetails: rows,
    });
  } catch (err) {
    console.error("查詢員工錯誤:", err);
    res.status(500).json({
      success: false,
      message: "查詢員工時發生錯誤",
      error: err.message,
    });
  }
};
// 新增員工
const createEmployee = async (req, res) => {
  try {
    const { staffname, password, mobilenum, role, hiredate } = req.body;
    if (!staffname || !password || !mobilenum || !role || !hiredate) {
      return res
        .status(400)
        .json({ success: false, message: "請提供所有必要的字段" });
    }

    // 檢查手機號碼是否已存在
    const [existingMobile] = await db.query(
      "SELECT * FROM employees WHERE mobilenum = ?",
      [mobilenum]
    );
    if (existingMobile.length > 0) {
      return res
        .status(409)
        .json({ success: false, message: "手機號碼已被註冊" });
    }

    const [result] = await db.query(
      "INSERT INTO employees (staffname, password, mobilenum, role, hire_date) VALUES (?, ?, ?, ?, ?)",
      [staffname, password, mobilenum, role, hiredate]
    );
    if (result.affectedRows === 0) {
      return res
        .status(500)
        .json({ success: false, message: "創建會員記錄時出錯" });
    }

    return res.status(200).json({ success: true, message: "註冊成功" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ success: false, message: "員工名稱已存在" });
    }
    console.error("註冊錯誤:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 更新員工資料
const updateEmployee = async (req, res) => {
  try {
    const { employee_id, staffname, mobilenum, role, hire_date, is_active } =
      req.body;

    // 修改驗證邏輯，對 is_active 做特別處理
    if (
      !employee_id ||
      !staffname ||
      !mobilenum ||
      !role ||
      !hire_date ||
      is_active === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "所有欄位都是必填的",
      });
    }

    // 將 is_active 轉換為數字
    const activeStatus = Number(is_active);

    // 驗證 is_active 的值是否有效
    if (![0, 1].includes(activeStatus)) {
      return res.status(400).json({
        success: false,
        message: "員工狀態值無效",
      });
    }

    const result = await db.query(
      "UPDATE employees SET staffname = ?, mobilenum = ?, role = ?, hire_date = ?, is_active = ? WHERE employee_id = ?",
      [staffname, mobilenum, role, hire_date, activeStatus, employee_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "員工未找到",
      });
    }

    res.status(200).json({
      success: true,
      message: "員工資料更新成功",
    });
  } catch (error) {
    console.error("更新員工資料錯誤:", error);
    // 添加更多錯誤信息以便調試
    console.error("請求數據:", req.body);
    res.status(500).json({
      success: false,
      message: "更新員工資料過程中發生錯誤",
      error: error.message,
    });
  }
};

// 登入員工
const worklogin = async (req, res) => {
  try {
    const { employeeid, password } = req.body;
    console.log("登入嘗試 - 員工編號:", employeeid);

    const [staffs] = await db.query(
      "SELECT * FROM employees WHERE BINARY employee_id = ?",
      [employeeid]
    );

    if (staffs.length === 0) {
      return res.status(401).json({
        success: false,
        message: "員工編號錯誤",
      });
    }

    const staff = staffs[0];
    console.log("查詢到的員工狀態:", staff.is_active);

    if (staff.is_active === 0) {
      console.log("非在職員工嘗試登入");
      return res.status(403).json({
        success: false,
        message: "非在職員工請勿使用系統",
      });
    }

    if (password !== staff.password) {
      return res.status(401).json({
        success: false,
        message: "密碼錯誤",
      });
    }

    // 取得台灣時間 (UTC+8)
    const now = new Date();
    const lastLoginTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    // 格式化時間為 MySQL datetime 格式
    const formattedLastLoginTime = lastLoginTime
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await db.query(
      "UPDATE employees SET last_login = ? WHERE employee_id = ?",
      [formattedLastLoginTime, employeeid]
    );

    // 登入成功回傳登入者訊息
    req.session.staff = {
      employeeid: employeeid,
      employeename: staff.staffname,
      employeerole: staff.role,
      employeemobilenum: staff.mobilenum,
      employeehiredate: staff.hire_date,
      employeelastlogin: formattedLastLoginTime, // 使用格式化後的時間
      employeestatuse: staff.is_active,
    };

    req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 24小時

    console.log("Login successful:", staff.staffname);
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

// 登出員工
const worklogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "登出失敗" });
    }
    res.clearCookie("connect.sid"); // 清除 cookie
    res.json({ success: true, message: "登出成功" });
  });
};

// 取得員工名稱(在topbar.vue中使用)
const getStaffName = (req, res) => {
  if (req.session && req.session.staff) {
    res.json({ employeename: req.session.staff.employeename });
  } else {
    res.status(401).json({ success: false, message: "未登錄" });
  }
};

module.exports = {
  getEmployees,
  getEmployeeByName,
  createEmployee,
  updateEmployee,
  worklogin,
  worklogout,
  getStaffName,
};
