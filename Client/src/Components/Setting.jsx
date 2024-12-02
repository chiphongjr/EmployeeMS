import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Setting = () => {
  const [setting, setSetting] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Hàm kiểm tra độ mạnh mật khẩu (có thể kiểm tra yêu cầu cụ thể)
  const validatePassword = (password) => {
    // Kiểm tra mật khẩu có ít nhất 6 ký tự và chứa cả chữ cái và số
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordPattern.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (setting.newPassword !== setting.confirmPassword) {
      setError("Mật khẩu mới không trùng khớp");
      return;
    }

    if (!validatePassword(setting.newPassword)) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm chữ cái và số.");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:3000/auth/change-password",
        setting,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.Status) {
        navigate("/dashboard/employee");  // Chuyển hướng khi thay đổi mật khẩu thành công
      } else {
        setError(response.data.Error || "Đã xảy ra lỗi, vui lòng thử lại.");
      }
    } catch (err) {
      // Kiểm tra lỗi từ server
      if (err.response && err.response.data.Error) {
        setError(err.response.data.Error);
      } else {
        setError("Đã xảy ra lỗi, vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <div className="p-3 rounded w-50 border">
        {error && <div className="alert alert-danger">{error}</div>}
        {/* Hiện thông báo lỗi */}
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12 mt-3">
            <label htmlFor="inputOldPassword" className="form-label">
              Mật Khẩu Cũ
            </label>
            <input
              type="password"
              className="form-control rounded-0"
              id="inputOldPassword"
              placeholder="Enter Old Password"
              value={setting.oldPassword}
              onChange={(e) =>
                setSetting({ ...setting, oldPassword: e.target.value })
              }
              required
            />
          </div>
          <div className="col-12 mt-3">
            <label htmlFor="inputNewPassword" className="form-label">
              Mật Khẩu Mới
            </label>
            <input
              type="password"
              className="form-control rounded-0"
              id="inputNewPassword"
              placeholder="Enter New Password"
              // autoComplete="off"
              value={setting.newPassword}
              onChange={(e) =>
                setSetting({ ...setting, newPassword: e.target.value })
              }
              required
            />
          </div>
          <div className="col-12 mt-3">
            <label htmlFor="inputConFirmPassword" className="form-label">
              Xác Nhận Mật Khẩu Mới
            </label>
            <input
              type="password"
              className="form-control rounded-0"
              id="inputConFirmPassword"
              placeholder="Enter Confirm Password"
              // autoComplete="off"
              value={setting.confirmPassword}
              onChange={(e) =>
                setSetting({ ...setting, confirmPassword: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-warning w-100 mt-4">
              Đổi Mật Khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Setting;
