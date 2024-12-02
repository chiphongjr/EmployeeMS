import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const handleLogout = () => {
    axios.get("http://localhost:3000/auth/logout").then((result) => {
      if (result.data.Status) {
        localStorage.removeItem("valid");
        localStorage.removeItem("id_emp"); // Xóa id_emp khỏi localStorage khi đăng xuất
        localStorage.removeItem("employeeData");
        navigate("/login");
        window.location.reload();
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <Link
              to="/dashboard"
              className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-5 fw-bolder d-none d-sm-inline">
                Sidebar Homepage
              </span>
            </Link>
            <ul
              className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
              id="menu"
            >
              <li className="w-100">
                <Link
                  to="/dashboard"
                  className="nav-link text-white px-0 align-middle"
                >
                  <i className="fs-4 bi-speedometer2 ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/employee"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-people ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Management</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/category"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-columns ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Category</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/leaves"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi bi-file-earmark-bar-graph ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Leaves</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/salary"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi bi-currency-dollar ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Salary</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/attendance"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi-camera ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Attendance</span>
                </Link>
              </li>
              <li className="w-100">
                <Link
                  to="/dashboard/change-password"
                  className="nav-link px-0 align-middle text-white"
                >
                  <i className="fs-4 bi bi-gear ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Setting</span>
                </Link>
              </li>
              <li className="w-100" onClick={handleLogout}>
                <Link className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-power ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Logout</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="col p-0 m-0">
          <div className="p-2 d-flex justify-content-center shadow helloDashboard">
            <h3>EMPLOYEE MANAGEMENT SYSTEM</h3>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
