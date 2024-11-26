const express = require("express");
const {
  getEmployees,
  getEmployeeByName,
  createEmployee,
  updateEmployee,
  worklogin,
  worklogout,
  getStaffName,
} = require("../controllers/employeesController");
const router = express.Router();

//routes

// 查詢全部員工
router.get("/getallemployees", getEmployees);

// 用使用者名字查詢員工ID
router.get("/getemployee", getEmployeeByName);

// 新增員工
router.post("/createstaff", createEmployee);

// 更新員工資料
router.put("/updatestaff", updateEmployee);

// 員工登入、登出
router.post("/login", worklogin);
router.post("/logout", worklogout);

// 取得員工名稱(在topbar.vue中使用)
router.get("/getstaffname", getStaffName);

module.exports = router;
