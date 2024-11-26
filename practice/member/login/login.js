document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const verificationCodeInput = document.getElementById("verificationCode");
  const rememberMeCheckbox = document.getElementById("rememberMe");
  const closeButton = document.getElementById("closeButton");

  // 檢查保存的用戶名
  const savedUsername = localStorage.getItem("rememberedUsername");
  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberMeCheckbox.checked = true;
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const verificationCode = verificationCodeInput.value;

    // 驗證碼檢查
    if (verificationCode !== "2678") {
      alert("驗證碼錯誤！");
      return;
    }

    // 輸入檢查
    if (!username || !password) {
      alert("請確認是否完整輸入！");
      return;
    }

    // 使用完整URL
    const MEMBER_PORT = 3001; // 確保這與您的會員服務端口匹配
    const loginUrl = `http://localhost:${MEMBER_PORT}/login`;

    fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(
              data.message || `HTTP error! status: ${response.status}`
            );
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          if (rememberMeCheckbox.checked) {
            localStorage.setItem("rememberedUsername", username);
          } else {
            localStorage.removeItem("rememberedUsername");
          }
          localStorage.setItem("currentUsername", username);

          // 使用完整URL進行重定向
          window.location.href = `http://localhost:${MEMBER_PORT}/memberbackend/loginafter.html`;
        } else {
          alert("登入失敗: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message || "登入過程中發生錯誤");
      });
  });

  closeButton.addEventListener("click", function () {
    // 使用完整URL
    window.location.href = "http://localhost:3000/index/index.html";
  });
});
