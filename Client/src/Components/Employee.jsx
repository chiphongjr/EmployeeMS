import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Employee = () => {
  const [employee, setEmployee] = useState([]);
  const [searchId, setSearchId] = useState("");

  // const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios
      .get("http://localhost:3000/auth/employee")
      .then((result) => {
        if (result.data.Status) {
          setEmployee(result.data.Result);
        } else {
          setEmployee([]); // Nếu có lỗi, reset danh sách nhân viên
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchId(value);
  };

  const filteredEmployees = employee.filter((emp) =>
    emp.id_emp.toString().includes(searchId)
  );

  const handleDelete = (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa nhân viên này?")) {
      axios
        .delete(`http://localhost:3000/auth/delete_employee/${id}`)
        .then((result) => {
          if (result.data.Status) {
            fetchEmployees(); // Tải lại danh sách nhân viên
          } else {
            alert(result.data.Error); // Hiển thị thông báo lỗi nếu có
          }
        })
        .catch((err) => {
          console.log(err);
          alert("Xóa nhân viên thất bại!");
        })
        
    }
  };
  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>Employees List</h3>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          placeholder="Tìm theo Mã NV"
          value={searchId}
          onChange={handleSearch} // Gọi hàm tìm kiếm khi nhập
          className="form-control w-25 me-2" // Thêm margin bên phải cho khoảng cách
        />
        <Link to="/dashboard/add_employee" className="btn btn-success">
          Thêm NV
        </Link>
      </div>
      <div className="mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Tên</th>
              <th>Ảnh</th>
              <th>Email</th>
              <th>Lương</th>
              <th>Địa Chỉ</th>
              <th>Vai Trò</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((e) => (
                <tr key={e.id_emp}>
                  <td>{e.id_emp}</td>
                  <td>{e.name}</td>
                  <td>
                    <img
                      src={`http://localhost:3000/Images/` + e.image}
                      className="employee_image"
                    />
                  </td>
                  <td>{e.email}</td>
                  <td>
                    {e.salary} <i>$</i>
                  </td>
                  <td>{e.address}</td>
                  <td>{e.role}</td>
                  <td>
                    <Link
                      to={`/dashboard/edit_employee/` + e.id_emp}
                      className="btn btn-primary btn-sm me-2"
                    >
                      Sửa
                    </Link>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => handleDelete(e.id_emp)}
                    >
                      Xóa
                    </button>

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  Không tìm thấy mã nhân viên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Employee;
