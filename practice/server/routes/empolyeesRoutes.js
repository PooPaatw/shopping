const express = require("express");
const {
  getEmpolyees,
  getEmpolyeeByName,
  createEmpolyee,
  updateEmpolyee,
  deleteEmpolyee,
  worklogin,
} = require("../controllers/empolyeesController");
//router object
const router = express.Router();

//routes

// 查詢全部員工
router.get("/getallempolyees", getEmpolyees);

// 用使用者名字查詢員工ID
router.get("/get/:empolyeename", getEmpolyeeByName);

// 新增員工
router.post("/createempolyee", createEmpolyee);

// 更新員工資料
router.put("/update/:empolyeename", updateEmpolyee);

// 刪除員工資料
router.delete("/delete/:empolyeename", deleteEmpolyee);

// 員工會員
router.post("/worklogin", worklogin);

module.exports = router;
