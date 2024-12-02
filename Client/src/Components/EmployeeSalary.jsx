import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeSalary = () => {
  const [salary, setSalary] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]); // Dữ liệu đã lọc để hiển thị

  const navigate = useNavigate();
  // const [form1, setForm1] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  // const [form2, setForm2] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const [form1, setForm1] = useState({ month: null, year: null }); // Khởi tạo không có giá trị
  const [form2, setForm2] = useState({ month: null, year: null });

  const months = Array.from({ length: 12 }, (_, i) => i + 1); // Tạo mảng từ 1 đến 12
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i); // 10 năm gần nhất

  // Tạo mảng kết hợp tháng và năm
  const monthYearOptions = months.flatMap(month => 
    years.map(year => ({
      label: `${String(month).padStart(2, '0')}/${year}`,
      value: { month, year }
    }))
  );

  // Lấy dữ liệu lương từ API
  const fetchSalaryData = async () => {
    try {
      const result = await axios.get("http://localhost:3000/employee/employee_salary");
      if (result.data.Status) {
        setSalary(result.data.Result);
        setFilteredSalaries(result.data.Result);
      } else {
        alert(result.data.Error);
      }
    } catch (error) {
      console.error("Error fetching salary data", error);
    } 
  };

  useEffect(() => {
    fetchSalaryData();
  }, []);

  // Lọc dữ liệu lương theo các giá trị trong form1 và form2
  const filteredSalariesMemo = useMemo(() => {
    if (form1.month && form1.year && form2.month && form2.year) {
      const fromDate = new Date(form1.year, form1.month - 1, 1);
      const toDate = new Date(form2.year, form2.month, 0);
      return salary.filter((s) => {
        const payDate = new Date(s.pay_date);
        return payDate >= fromDate && payDate <= toDate;
      });
    }
    return salary;
  }, [form1, form2, salary]);

  useEffect(() => {
    setFilteredSalaries(filteredSalariesMemo);
  }, [filteredSalariesMemo]);


  const handleFormChange = (e, formSetter) => {
    const selectedOption = monthYearOptions.find(option => option.label === e.target.value);
    if (selectedOption) {
      formSetter(selectedOption.value);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const generateIdSalary = () => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}${String(
      date.getHours()
    ).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(
      date.getSeconds()
    ).padStart(2, "0")}`;
    return `ML${formattedDate}`;
  };
  

  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>Salary History</h3>
      </div>
      <div className="d-flex align-items-center justify-content-left">
      {/* Form 1 */}
      <div className="mb-3 w-25 me-4">
        <label htmlFor="monthYearSelect1" className="form-label">From:</label>
        {/* <select id="monthYearSelect1" className="form-select" value={`${String(form1.month).padStart(2, '0')}/${form1.year}`} onChange={(e) => handleFormChange(e, setForm1)}> */}
        <select id="monthYearSelect1" className="form-select" value={form1.month && form1.year ? `${String(form1.month).padStart(2, '0')}/${form1.year}` : ""} onChange={(e) => handleFormChange(e, setForm1)}>
    <option value="" disabled>Chọn tháng/năm</option>
          
          {monthYearOptions.map(option => (
            <option key={`${option.value.month}/${option.value.year}`} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
  
      {/* Form 2 */}
      <div className="mb-3 w-25">
        <label htmlFor="monthYearSelect2" className="form-label">To:</label>
        {/* <select id="monthYearSelect2" className="form-select" value={`${String(form2.month).padStart(2, '0')}/${form2.year}`} onChange={(e) => handleFormChange(e, setForm2)}> */}
        <select id="monthYearSelect2" className="form-select" value={form2.month && form2.year ? `${String(form2.month).padStart(2, '0')}/${form2.year}` : ""} onChange={(e) => handleFormChange(e, setForm2)}>
        <option value="" disabled>Chọn tháng/năm</option>
          {monthYearOptions.map(option => (
            <option key={`${option.value.month}/${option.value.year}`} value={option.label}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>

      <div className="mt-3">
        <table className="table">
          <thead>
            <tr>
              <th>Mã Lương</th>
              <th>Mã NV</th>
              <th>Lương</th>
              <th>Phụ Cấp</th>
              <th>Khấu Trừ</th>
              <th>Ngày Trả</th>
              <th>Tổng Lương</th>
            </tr>
          </thead>
          <tbody>
            {filteredSalaries.map((s) => (
              <tr key={s.id_salary}>
                <td>{s.id_salary}</td>
                <td>{s.id_emp}</td>
                <td>{s.salary} <i>$</i></td>
                <td>
                  {s.allowance} <i>$</i>
                </td>
                <td>{s.deduction} <i>$</i></td>
                <td>{formatDate(s.pay_date)}</td>
                <td>{s.total_salary} <i>$</i></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EmployeeSalary;
