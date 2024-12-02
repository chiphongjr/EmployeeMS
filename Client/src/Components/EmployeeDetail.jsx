import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployeeDetail = () => {
  const [employee, setEmployee] = useState(null); // Chú ý là khởi tạo với null
  const employeeId = localStorage.getItem("id_emp"); // Lấy id_emp từ localStorage
  const employeeData = JSON.parse(localStorage.getItem("employeeData"));

  useEffect(() => {
    if (employeeData) {
      // Kiểm tra nếu dữ liệu trong state khác với dữ liệu trong localStorage
      if (JSON.stringify(employeeData) !== JSON.stringify(employee)) {
        setEmployee(employeeData);
      }
    } else if (employeeId) {
      // Nếu chưa có dữ liệu trong localStorage, gọi API để lấy thông tin nhân viên
      const fetchEmployeeDetail = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3000/employee_detail/${employeeId}`
          );
          if (response.data.Status) {
            const employeeDetail = response.data.Result;
            setEmployee(employeeDetail); // Cập nhật dữ liệu từ API
            localStorage.setItem(
              "employeeData",
              JSON.stringify(employeeDetail)
            );
          } else {
            console.error(response.data.Error);
          }
        } catch (err) {
          console.error("Error fetching employee details:", err);
        }
      };
      fetchEmployeeDetail();
    }
  }, [employeeId, employeeData]);

  if (!employee) {
    return <div>Loading...</div>; // Hoặc có thể hiển thị "No employee data" nếu không có dữ liệu
  }

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{
        minHeight: "80vh", // Chiều cao tối thiểu của container
        backgroundColor: "#f8f9fa", // Màu nền sáng cho toàn bộ trang
      }}
    >
      {/* Nội dung sẽ căn giữa toàn màn hình */}
      <div
        className="d-flex w-75 p-5 shadow-lg border rounded-lg"
        style={{
          backgroundColor: "#ffffff", // Nền trắng cho phần thông tin
          borderRadius: "20px", // Viền bo tròn cho khung
        }}
      >
        {/* Left side: Image */}
        <div className="me-5 d-flex justify-content-center align-items-center">
          <img
            src={`http://localhost:3000/Images/${employee.image}`}
            alt="Employee"
            className="img-fluid rounded-circle border-4 border-primary shadow-lg"
            style={{
              width: "400px", // Tăng kích thước hình ảnh
              height: "300px", // Tăng kích thước hình ảnh
            }}
          />
        </div>

        {/* Right side: Employee details */}
        <div
          className="d-flex flex-column justify-content-center"
          style={{
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Thêm font chữ đẹp
            lineHeight: "1.6", // Tăng khoảng cách giữa các dòng
          }}
        >
          <div className="mb-3">
            <h1 className="fw-bold" style={{ fontSize: "1.4rem" }}>
              Mã NV: <i className="fw-normal">{employee.id_emp}</i>
            </h1>
          </div>
          <div className="mb-3">
            <h5 className="fw-bold" style={{ fontSize: "1.4rem" }}>
              Tên: <i className="fw-normal">{employee.name}</i>
            </h5>
          </div>
          <div className="mb-3 m-0">
            <h5 className="fw-bold" style={{ fontSize: "1.4rem" }}>
              Email: <i className="fw-normal">{employee.email}</i>
            </h5>
          </div>
          <div className="mb-3">
            <h5 className="fw-bold" style={{ fontSize: "1.4rem" }}>
              Lương: <i className="fw-normal">{employee.salary}</i>
            </h5>
          </div>
          <div>
            <h5 className="fw-bold" style={{ fontSize: "1.4rem" }}>
              Vai Trò: <i className="fw-normal">{employee.role}</i>
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
