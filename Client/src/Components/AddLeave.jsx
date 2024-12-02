import axios from "axios";
import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddLeaveForm = () => {
  const navigate=useNavigate();

  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("pending"); // Default status is "pending"
  const [leaveId, setLeaveId] = useState(""); // State to store the generated leave ID
  const employeeId = localStorage.getItem("id_emp"); // Get employee id from localStorage

  // Handle input changes
  const handleLeaveTypeChange = (e) => setLeaveType(e.target.value);
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleReasonChange = (e) => setReason(e.target.value);

  useEffect(() => {
    // Tạo mã đơn nghỉ phép khi người dùng vào trang AddLeaveForm
    const generateLeaveId = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      return `MD${year}${month}${day}${hours}${minutes}${seconds}`;
    };

    // Tạo id_leave và lưu vào state khi trang được load
    setLeaveId(generateLeaveId());
  }, []);
  // Submit form to add a new leave
  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent form submission
    console.log("Submitting leave request");
  
    if (!leaveType || !startDate || !endDate || !reason) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
  
    // Create leave data object
    const leaveData = {
      
      id_emp: employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      status,  // Default status is "pending"
    };
  
    if (new Date(startDate) > new Date(endDate)) {
      alert("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
      return;
    }
  
    // Send leave data to the server
    axios
      .post("http://localhost:3000/employee/add_leave", leaveData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((result) => {
        if (result.data.Status) {
          alert("Đơn nghỉ phép đã được gửi!");
          // Reset form fields after successful submission
          setLeaveId(result.data.id_leave);  // Store the generated leave ID from response
          setLeaveType("");
          setStartDate("");
          setEndDate("");
          setReason("");
          setStatus("pending");  // Reset status back to "pending"
          navigate("/employee_dashboard/:id/employee_detail")
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => {
        console.error("Error submitting leave:", err);
        alert("Đã có lỗi xảy ra khi gửi đơn nghỉ phép. Vui lòng thử lại.");
      });
  };
  

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Thêm Đơn Nghỉ Phép</h3>
      <form onSubmit={handleSubmit}>
      <div className="mb-3">
          <label htmlFor="leaveId" className="form-label">Mã Đơn Nghỉ Phép</label>
          <input
            type="text"
            id="leaveId"
            className="form-control"
            value={leaveId}
            disabled
          />
        </div>
        <div className="mb-3">
          <label htmlFor="leaveType" className="form-label">Loại Đơn Nghỉ</label>
          <select
            id="leaveType"
            className="form-select"
            value={leaveType}
            onChange={handleLeaveTypeChange}
            required
          >
            <option value="">Chọn loại đơn nghỉ</option>
            <option value="Sick">Nghỉ ốm</option>
            <option value="Vacation">Nghỉ phép</option>
            <option value="Personal">Nghỉ cá nhân</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="startDate" className="form-label">Ngày Bắt Đầu</label>
          <input
            type="date"
            id="startDate"
            className="form-control"
            value={startDate}
            onChange={handleStartDateChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="endDate" className="form-label">Ngày Kết Thúc</label>
          <input
            type="date"
            id="endDate"
            className="form-control"
            value={endDate}
            onChange={handleEndDateChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="reason" className="form-label">Lý Do Nghỉ</label>
          <textarea
            id="reason"
            className="form-control"
            rows="3"
            value={reason}
            onChange={handleReasonChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Gửi Đơn Nghỉ Phép</button>
      </form>
    </div>
  );
};

export default AddLeaveForm;
