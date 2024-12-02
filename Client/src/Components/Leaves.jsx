import axios from "axios";
import React, { useEffect, useState,Link } from "react";


const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [searchId, setSearchId] = useState("");

  // const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString); 
    const day = String(date.getDate()).padStart(2, "0"); 
    const month = String(date.getMonth() + 1).padStart(2, "0"); 
    const year = date.getFullYear(); 
    return `${day}/${month}/${year}`; 
  };

  const fetchLeaves = () => {
    axios
      .get("http://localhost:3000/auth/leave")
      .then((result) => {
        if (result.data.Status) {
          setLeaves(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchId(value);
  };

  const filteredLeave = leaves.filter((leave) =>
    leave.id_emp.toString().includes(searchId)
  );

  const handleStatusChange = (id_leave, newStatus) => {
    axios
      .put(`http://localhost:3000/auth/update_leave_status/${id_leave}`, { status: newStatus })
      .then((response) => {
        if (response.data.Status) {
          // Cập nhật lại trạng thái trong danh sách
          setLeaves((prevLeaves) =>
            prevLeaves.map((leave) =>
              leave.id_leave === id_leave ? { ...leave, status: newStatus } : leave
            )
          );
        } else {
          alert(response.data.Error);
        }
      })
      .catch((err) => console.log(err));
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
              <th>Thao Tác</th>
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
                  <td>
                    {e.status === "pending" && (
                      <>
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleStatusChange(e.id_leave, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleStatusChange(e.id_leave, "rejected")}
                        >
                          Reject
                        </button>

                      </>
                    )}
                  </td>
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
export default Leaves;
