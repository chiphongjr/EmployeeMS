import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const EmployeeLogin = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  // Kiểm tra email hợp lệ
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  // Kiểm tra mật khẩu tối thiểu
  const validatePassword = (password) => {
    return password.length >= 6; // Kiểm tra mật khẩu có ít nhất 6 ký tự
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateEmail(values.email)) {
      setError("Email không hợp lệ");
      return;
    }

    if (!validatePassword(values.password)) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    axios
      .post("http://localhost:3000/employee/employee_login", values)
      .then((result) => {
        if (result.data.loginStatus) {
          localStorage.setItem("valid", true);
          localStorage.setItem(
            "employeeData",
            JSON.stringify(result.data.employee)
          ); // Lưu thông tin nhân viên
          localStorage.setItem("id_emp", result.data.id); // Lưu id nhân viên vào localStorage
          // navigate("/employee_detail/" + result.data.id);
          navigate(`/employee_dashboard`);
          // navigate(`/employee_dashboard/employee_detail/${result.data.employee.id}`);
        } else {
          setError(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
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

export default EmployeeLogin;
