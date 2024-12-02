import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const AddSalary = () => {
  const [salary, setSalary] = useState({
    id_salary: "",
    id_emp: "",
    salary: "",
    allowance: "",
    deduction: "",
    pay_date: "",
    total_salary: "",
  });
  const [employee, setEmployee] = useState([]);
  const [adminId, setAdminId] = useState(null); // State để lưu id của admin
  const navigate = useNavigate();
  const location = useLocation(); // Nhận location

  useEffect(() => {
    // Nhận thông tin admin từ cookie hoặc localStorage
    const userInfo = JSON.parse(localStorage.getItem("employeeData")); // Giả sử lưu trữ trong localStorage
    if (userInfo) {
      setAdminId(userInfo.id_emp); // Lưu id của admin
    }

    // Nhận id_salary từ location.state
    if (location.state) {
      setSalary((prev) => ({
        ...prev,
        id_salary: location.state.id_salary, // Cập nhật id_salary
      }));
    }
  }, [location.state]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/employee")
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  //xu ly DOM onchange
  const handleEmployeeChange = (e) => {
    const selectedId = e.target.value;
    setSalary({ ...salary, id_emp: selectedId });

    const employeeData = employee.find((emp) => emp.id_emp === selectedId);
    if (employeeData) {
      setSalary((prev) => ({
        ...prev,
        salary: employeeData.salary,
        total_salary: calculateTotalSalary(
          employeeData.salary,
          prev.allowance,
          prev.deduction
        ),
      }));
    }
  };

  const calculateTotalSalary = (salary, allowance, deduction) => {
    return salary + allowance - deduction;
  };

  const handleSalaryChange = (e) => {
    const newSalary = Number(e.target.value);
    setSalary((prev) => ({
      ...prev,
      salary: newSalary,
      total_salary: calculateTotalSalary(
        newSalary,
        prev.allowance,
        prev.deduction
      ),
    }));
  };

  const handleAllowanceChange = (e) => {
    const newAllowance = Number(e.target.value);
    setSalary((prev) => ({
      ...prev,
      allowance: newAllowance,
      total_salary: calculateTotalSalary(
        prev.salary,
        newAllowance,
        prev.deduction
      ),
    }));
  };

  const handleDeductionChange = (e) => {
    const newDeduction = Number(e.target.value);
    setSalary((prev) => ({
      ...prev,
      deduction: newDeduction,
      total_salary: calculateTotalSalary(
        prev.salary,
        prev.allowance,
        newDeduction
      ),
    }));
  };

  // ket thuc DOM

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kiểm tra các giá trị trước khi gửi
    if (
      !salary.id_salary ||
      !salary.id_emp ||
      !salary.salary ||
      !salary.allowance ||
      !salary.deduction ||
      !salary.pay_date
    ) {
      alert("All fields are required");
      return;
    }
    // Kiểm tra nếu admin đang cố gắng tính lương cho chính mình
    if (salary.id_emp === adminId) {
      alert("Admin cannot calculate salary for themselves.");
      return;
    }
    // Kiểm tra xem dữ liệu có hợp lệ không (ví dụ: kiểm tra số âm)
  if (salary.salary < 0 || salary.allowance < 0 || salary.deduction < 0) {
    alert("Salary, allowance, and deduction must be non-negative");
    return;
  }

    axios
    .post("http://localhost:3000/auth/add_salary", salary, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,  // Đảm bảo bạn lưu token khi người dùng đăng nhập
      },
    })
      .then((result) => {
        if (result.data.Status) {
          navigate("/dashboard/salary");
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border">
        <h3 className="text-center">New Employee</h3>
        <form className="row g-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label htmlFor="inputID_Salary" className="form-label">
              Mã Lương
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputID_Salary"
              placeholder="Enter ID_Salary"
              value={salary.id_salary} // Hiển thị ID đã tạo
              readOnly // Không cho phép nhập tay
            />
          </div>
          <div className="col-12">
            <label htmlFor="ID_Emp" className="form-label">
              Mã NV
            </label>
            <select
              name="ID_Emp"
              id="ID_Emp"
              className="form-select"
              onChange={handleEmployeeChange}
            >
              {employee
                .filter((e) => e.id_emp !== adminId) // Lọc bỏ admin khỏi danh sách
                .map((e) => {
                  return (
                    <option key={e.id_emp} value={e.id_emp}>
                      {e.id_emp}
                    </option>
                  );
                })}
            </select>
          </div>

          <div className="col-12">
            <label htmlFor="inputSalary" className="form-label">
              Lương
            </label>
            <input
              className="form-control rounded-0"
              id="inputSalary"
              placeholder="Enter Salary"
              onChange={handleSalaryChange} // Sử dụng hàm mới
              value={salary.salary}
              readOnly
            />
          </div>

          <div className="col-12">
            <label htmlFor="inputAllowance" className="form-label">
              Phụ Cấp
            </label>
            <input
              type="number"
              className="form-control rounded-0"
              id="inputAllowance"
              placeholder="Enter Allowance"
              autoComplete="off"
              onChange={handleAllowanceChange} // Sử dụng hàm mới
              required
            />
          </div>

          <div className="col-12">
            <label htmlFor="inputDeduction" className="form-label">
              Khấu Trừ
            </label>
            <input
              type="number"
              className="form-control rounded-0"
              id="inputDeduction"
              placeholder="Enter Deduction"
              onChange={handleDeductionChange}
              required
            />
            <label htmlFor="inputPaydate" className="form-label">
              Ngày Trả
            </label>
            <input
              type="date"
              className="form-control rounded-0"
              id="inputPaydate"
              placeholder="Enter Paydate"
              autoComplete="off"
              onChange={(e) =>
                setSalary({ ...salary, pay_date: e.target.value })
              }
              required
            />
          </div>
          <div className="col-12 mb-3">
            <label htmlFor="inputTotalSalary" className="form-label">
              Tổng Lương
            </label>
            <input
              className="form-control rounded-0"
              id="inputTotalSalary"
              placeholder="0"
              value={salary.total_salary} // Hiển thị tổng lương
              readOnly // Để người dùng không nhập tay
            />
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-success w-100">
              Xử Lý
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalary;
