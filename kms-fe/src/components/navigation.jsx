import React, { useEffect, useState } from "react";

export const Navigation = (props) => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Lấy giá trị từ localStorage khi component được render
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);
  }, []);

  const handleLogout = () => {
    // Xóa username khỏi localStorage và chuyển hướng về trang chủ
    localStorage.removeItem("username");
    setUsername(null);
    window.location.href = "/";
  };

  return (
    <nav
      id="menu"
      className="s"
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd",
        zIndex: 1000,
        padding: "10px 0",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 50px",
        }}
      >
        {/* Logo section */}
        <div>
          <div className="s-header">
            <a
              className="navbar-brand"
              href="#page-top"
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#333",
                letterSpacing: "2px",
              }}
            >
              KINDERGARTEN
            </a>
          </div>
        </div>

        {/* Navigation links */}
        <div className="navbar-collapse" id="navbar">
          <ul
            className="nav navbar-nav"
            style={{
              listStyleType: "none",
              display: "flex", // Dàn hàng ngang
              flexDirection: "row", // Đảm bảo hướng ngang
              justifyContent: "space-between", // Giãn đều khoảng cách
              alignItems: "center",
              margin: 0,
              padding: 0,
              width: "100%", // Đảm bảo toàn bộ width được dùng
            }}
          >
            <li style={{ padding: "0 20px" }}>
              <a
                href="#about"
                style={{
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                ABOUT
              </a>
            </li>
            <li style={{ padding: "0 20px" }}>
              <a
                href="#services"
                style={{
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                PROGRAM
              </a>
            </li>

            <li style={{ padding: "0 20px" }}>
              <a
                href="#contact"
                style={{
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                CONTACT
              </a>
            </li>

            <li style={{ padding: "0 20px", display: "flex", alignItems: "center" }}>
              {/* Hiển thị "Hello, username" nếu đã đăng nhập */}
              {username && (
                <span
                  style={{
                    marginRight: "15px",
                    fontSize: "16px",
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  Hello, {username}
                </span>
              )}

              {/* Kiểm tra xem người dùng đã đăng nhập hay chưa */}
              {username ? (
                <a
                  href="#"
                  onClick={handleLogout}
                  style={{
                    color: "#333",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  LOGOUT
                </a>
              ) : (
                <a
                  href="/login"
                  style={{
                    color: "#333",
                    textDecoration: "none",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  SIGN IN
                </a>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
