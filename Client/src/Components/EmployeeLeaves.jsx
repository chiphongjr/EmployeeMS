import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const EmployeeLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [searchId, setSearchId] = useState("");
  const employeeId = localStorage.getItem("id_emp");

  useEffect(() => {
    if (employeeId) {
      fetchLeaves(employeeId);
    }
  }, [employeeId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchLeaves = () => {
    axios
      .get(`http://localhost:3000/employee/employee_leave`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Gửi token trong header
        },
      }) // Gửi yêu cầu với ID nhân viên
      .then((result) => {
        if (result.data.Status) {
          setLeaves(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  const filteredLeave = leaves.filter(
    (leave) => leave.id_emp.toString().includes(searchId.trim().toLowerCase()) // Lọc khi có dữ liệu nhập vào
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchId(value);
  };

  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>Leaves</h3>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          placeholder="Tìm theo Mã Đơn"
          value={searchId}
          onChange={handleSearch} // Gọi hàm tìm kiếm khi nhập
          className="form-control w-25 me-2" // Thêm margin bên phải cho khoảng cách
        />
      </div>

      <Link to="/employee_dashboard/add_leave" className="btn btn-success">
        Tạo Đơn Nghỉ Phép
      </Link>
      <div className="mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Mã NV</th>
              <th>Loại Đơn</th>
              <th>Từ</th>
              <th>Đến</th>
              {/* <th>Số Ngày Nghỉ</th> */}
              <th>Lí Do</th>
              <th>Tình Trạng</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeave.length > 0 ? (
              filteredLeave.map((e) => (
                <tr key={e.id_leave}>
                  <td>{e.id_leave}</td>
                  <td>{e.id_emp}</td>
                  <td>{e.leaveType}</td>
                  <td>{formatDate(e.startDate)}</td>
                  <td>{formatDate(e.endDate)}</td>
                  <td>{e.reason}</td>
                  <td>{e.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  Không tìm thấy đơn xin nghỉ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EmployeeLeaves;
