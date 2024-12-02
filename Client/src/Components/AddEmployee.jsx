import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const [employee, setEmployee] = useState({
    id_emp:"",
    name: "",
    email: "",
    password: "",
    salary: "",
    address: "",
    category_id: "",
    image: "",
    role:"",
  });

  const [category, setCategory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/category")
      .then((result) => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("id_emp", employee.id_emp);
    formData.append("name", employee.name);
    formData.append("email", employee.email);
    formData.append("password", employee.password);
    formData.append("address", employee.address);
    formData.append("salary", employee.salary);
    formData.append("image", employee.image);
    formData.append("category_id", employee.category_id);
    formData.append("role", employee.role);

    axios
      .post("http://localhost:3000/auth/add_employee", formData)
      .then((result) => {
        if (result.data.Status) {
          navigate("/dashboard/employee");
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
            <label htmlFor="inputID_Emp" className="form-label">
              Mã NV
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputID_Emp"
              placeholder="Enter ID_Emp"
              onChange={(e) =>
                setEmployee({ ...employee, id_emp: e.target.value})
              }
              required
            />
          </div>

          <div className="col-12">
            <label htmlFor="inputName" className="form-label">
              Tên
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputName"
              placeholder="Enter Name"
              onChange={(e) =>
                setEmployee({ ...employee, name: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12">
            <label htmlFor="inputEmail" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control rounded-0"
              id="inputEmail"
              placeholder="Enter Email"
              autoComplete="off"
              onChange={(e) =>
                setEmployee({ ...employee, email: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12">
            <label htmlFor="inputPassword" className="form-label">
              Mật Khẩu
            </label>
            <input
              type="password"
              className="form-control rounded-0"
              id="inputPassword"
              placeholder="Enter Password"
              onChange={(e) =>
                setEmployee({ ...employee, password: e.target.value })
              }
              required
            />
            </div>

            <div className="col-12">
            <label htmlFor="selectRole" className="form-label">
              Vai trò
            </label>
            <select
              name="selectRole"
              id="selectRole"
              className="form-select"
              onChange={(e) =>
                setEmployee({ ...employee, role: e.target.value })
              }
              required
            >
              <option value="">Chọn vai trò</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>

            <div>
            <label htmlFor="inputSalary" className="form-label">
              Lương
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputSalary"
              placeholder="Enter Salary"
              autoComplete="off"
              onChange={(e) =>
                setEmployee({ ...employee, salary: e.target.value })
              }
              required
            />
          </div>

          <div className="col-12">
            <label htmlFor="inputAddress" className="form-label">
              Địa Chỉ
            </label>
            <input
              type="text"
              className="form-control rounded-0"
              id="inputAddress"
              placeholder="Enter Address"
              autoComplete="off"
              onChange={(e) =>
                setEmployee({ ...employee, address: e.target.value })
              }
              required
            />
          </div>
          <div className="col-12">
            <label htmlFor="category" className="form-label">
              Phòng Ban
            </label>
            <select
              name="category"
              id="category"
              className="form-select"
              onChange={(e) =>
                setEmployee({ ...employee, category_id: e.target.value })
              }
            >
              {category.map((c) => {
                return (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col-12 mb-3">
            <label className="form-label" htmlFor="inputGroupFile">
              Ảnh
            </label>
            <input
              type="file"
              className="form-control rounded-0"
              id="inputGroupFile"
              name="image"
              onChange={(e) =>
                setEmployee({ ...employee, image: e.target.files[0] })
              }
              required
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-success w-100">
              Tạo Mới NV
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
