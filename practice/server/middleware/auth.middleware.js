// 中間層-身份驗證，防止直接到後台

const isAuthenticated = (req, res, next) => {
  console.log("認證中間件被調用");
  console.log("Session:", req.session);

  if (req.session && req.session.user) {
    console.log("用戶已認證:", req.session.user.userid);
    return next();
  } else {
    console.log("用戶未認證");
    // 檢查是否是 API 請求
    if (req.path.startsWith("/api/")) {
      return res.status(401).json({ message: "用戶未登入" });
    } else {
      // 對於頁面請求，重定向到登錄頁面
      return res.redirect("/login/login.html?redirected=true");
    }
  }
};

module.exports = { isAuthenticated };
