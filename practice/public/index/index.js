function goToLogin() {
  window.location.href = "../../member/login/login.html"; // 指定絕對路徑
}

function goToRegister() {
  window.location.href = "../../member/registration/registration.html"; // 指定跳轉到註冊頁
}
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const redirected = urlParams.get("redirected");

  if (redirected === "true") {
    alert("請先登入。");
  }
});
