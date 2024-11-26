document.addEventListener("DOMContentLoaded", function () {
  var customSelect = document.querySelector(".custom-select");
  var selectSelected = customSelect.querySelector(".select-selected");
  var selectItems = customSelect.querySelector(".select-items");
  var usernameElement = document.querySelector(".username");

  // 從服務器獲取用戶信息
  fetch("/api/user-info", {
    method: "GET",
    credentials: "include", // 確保發送 cookies
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("用戶未登入");
      }
      return response.json();
    })
    .then((data) => {
      usernameElement.textContent = data.username;
    })
    .catch((error) => {
      window.location.href = "../login/login.html?redirected=true";
    });

  selectSelected.addEventListener("click", function (e) {
    e.stopPropagation();
    selectItems.classList.toggle("select-hide");
  });

  selectItems.querySelector("div").addEventListener("click", function () {
    // 處理登出邏輯
    fetch("/logout", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // 重定向到登錄頁面
          window.location.href = "../login/login.html";
        } else {
          alert("登出失敗");
        }
      })
      .catch((error) => {
        console.error("登出錯誤:", error);
        alert("登出過程中發生錯誤");
      });
  });

  document.addEventListener("click", function () {
    selectItems.classList.add("select-hide");
  });
});
