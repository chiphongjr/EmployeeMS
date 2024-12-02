import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  // Hàm kiểm tra email hợp lệ
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Kiểm tra email hợp lệ
    if (!validateEmail(values.email)) {
      setError("Email không hợp lệ");
      return;
    }

    // Gửi yêu cầu đăng nhập tới API
    axios
      .post("http://localhost:3000/auth/login", {
        email: values.email,
        password: values.password,
      })
      .then((result) => {
        if (result.data.loginStatus) {
          // Kiểm tra role của người dùng từ backend
          const role = result.data.role; // 'admin' hoặc 'employee'
          localStorage.setItem("valid", true);
          localStorage.setItem(
            "employeeData",
            JSON.stringify(result.data.employee)
          ); // Lưu thông tin nhân viên
          localStorage.setItem("id_emp", result.data.id); // Lưu id nhân viên vào localStorage
          // Điều hướng đến trang dashboard dựa trên role
          if (role === "admin") {
            navigate("/dashboard"); // Điều hướng tới trang admin dashboard
          } else if (role === "employee") {
            navigate("/employee_dashboard/:id/employee_detail"); // Điều hướng tới trang employee dashboard
          }
        } else {
          setError(result.data.Error); // Hiển thị lỗi nếu có
        }
      })
      .catch((err) => {
        setError("Đã xảy ra lỗi trong quá trình đăng nhập.");
        console.error("Login failed", err);
      });
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="p-3 rounded w-25 border loginForm">
        <h2 className="text-center">Login Page</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email">
              <strong>Email: </strong>
            </label>
            <input
              type="email"
              name="email"
              autoComplete="off"
              placeholder="Enter Email..."
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="form-control rounded-0"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password">
              <strong>Password: </strong>
            </label>
            <input
              type="password"
              name="password"
              autoComplete="off"
              placeholder="Enter Password..."
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
              className="form-control rounded-0"
            />
          </div>

          <div className="mb-1 text-warning">{error && error}</div>

          <button className="btn btn-success w-100 rounded-0 mb-2">
            Log in
          </button>

          <div className="mb-1">
            <input type="checkbox" name="tick" id="tick" className="me-2" />
            <label htmlFor="password">
              Tôi đã đọc và đồng ý với các điều khoản
            </label>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
