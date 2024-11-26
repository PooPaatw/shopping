document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("registrationForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const emailInput = document.getElementById("email");
  const mobilenumInput = document.getElementById("mobilenum");
  const closeButton = document.getElementById("closeButton");

  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const email = emailInput.value;
    const mobilenum = mobilenumInput.value;

    // 輸入檢查
    if (!username || !password || !email || !mobilenum) {
      alert("請確認是否完整輸入所有字段！");
      return;
    }

    // 使用完整URL
    const MEMBER_PORT = 3001; // 確保這與您的會員服務端口匹配
    const registrationUrl = `http://localhost:${MEMBER_PORT}/registration`;

    fetch(registrationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, email, mobilenum }),
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
          // 註冊成功，重定向到成功頁面
          window.location.href = `http://localhost:${MEMBER_PORT}/registration/registrationfinish.html`;
        } else {
          alert("註冊失敗: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message || "註冊過程中發生錯誤");
      });
  });
});
