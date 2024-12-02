import axios from "axios";
import React, { useEffect, useState } from "react";
import {FaFileAlt,FaCheckCircle,FaHourglassHalf,FaTimesCircle} from "react-icons/fa"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import SummaryCard from "./SummaryCard";

const Home = () => {
  const data = [
    {
      name: "T1~T2",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "T3~T4",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "T5~T6",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "T7~T8",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "T9~T10",
      uv: 6850,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "T11~T12",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
  ];
  const [adminTotal, setAdminTotal] = useState(0);
  const [employeeTotal, setEmployeeTotal] = useState(0);
  const [salaryTotal, setSalaryTotal] = useState(0);
  const [leaveTotal, setLeaveTotal] = useState(0);
  const [leaveApproved, setLeaveApproved] = useState(0);
  const [leavePending, setLeavePending] = useState(0);
  const [leaveRejected, setLeaveRejected] = useState(0);
  // const [admins, setAdmins] = useState([]);

  useEffect(() => {
    adminCount();
    employeeCount();
    salaryCount();
    leaveCount();
    leaveApprovedCount();
    leavePendingCount();
    leaveRejectedCount();
    // adminRecords();
  }, []);

  // const adminRecords = () => {
  //   axios.get("http://localhost:3000/auth/admin_records").then((result) => {
  //     if (result.data.Status) {
  //       setAdmins(result.data.Result);
  //     } else {
  //       alert(result.data.Error);
  //     }
  //   });
  // };

  const adminCount = () => {
    axios.get("http://localhost:3000/auth/admin_count").then((result) => {
      if (result.data.Status) {
        setAdminTotal(result.data.Result[0].admin);
      }
    });
  };

  const employeeCount = () => {
    axios.get("http://localhost:3000/auth/employee_count").then((result) => {
      if (result.data.Status) {
        setEmployeeTotal(result.data.Result[0].employee);
      }
    });
  };

  const salaryCount = () => {
    axios.get("http://localhost:3000/auth/salary_count").then((result) => {
      if (result.data.Status) {
        setSalaryTotal(result.data.Result[0].salary);
      }
    });
  };
  const leaveCount=()=>{
    axios.get("http://localhost:3000/auth/leave_count").then((result)=>{
      if(result.data.Result){
        setLeaveTotal(result.data.Result[0].leaves)
      }
    })
  }
  const leaveApprovedCount=()=>{
    axios.get("http://localhost:3000/auth/leaveApproved_count").then((result)=>{
      if(result.data.Result){
        setLeaveApproved(result.data.Result[0].leaveApproved)
      }
    })
  }
  const leavePendingCount=()=>{
    axios.get("http://localhost:3000/auth/leavePending_count").then((result)=>{
      if(result.data.Result){
        setLeavePending(result.data.Result[0].leavePending)
      }
    })
  }
  const leaveRejectedCount=()=>{
    axios.get("http://localhost:3000/auth/leaveRejected_count").then((result)=>{
      if(result.data.Result){
        setLeaveRejected(result.data.Result[0].leaveRejected)
      }
    })
  }

  return (
    <div className="container-fluid">
      <div className="p-3 d-flex justify-content-around mt-2">
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25 bg-light mb-2">
          <div className="text-center pb-1">
            <h4>Quản Trị Viên</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Tổng:</h5>
            <h5>{adminTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25 bg-light mb-2">
          <div className="text-center pb-1">
            <h4>Nhân Viên</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Tổng: </h5>
            <h5>{employeeTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25 bg-light mb-2">
          <div className="text-center pb-1">
            <h4>Thống Kê Lương</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Tổng:</h5>
            <h5>{salaryTotal} $</h5>
          </div>
        </div>
      </div>

      

      {/* Leave Detail Summary */}
      <div className="row">
        <div className="col-sm-6 col-md-3">
          <SummaryCard
            icon={<FaFileAlt />}
            text="Đơn Nghỉ Phép"
            number={leaveTotal}
            color="bg-primary"
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <SummaryCard
            icon={<FaCheckCircle />}
            text="Thông Duyệt"
            number={leaveApproved}
            color="bg-success"
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <SummaryCard
            icon={<FaHourglassHalf />}
            text="Đang Chờ"
            number={leavePending}
            color="bg-warning"
          />
        </div>
        <div className="col-sm-6 col-md-3">
          <SummaryCard
            icon={<FaTimesCircle />}
            text="Từ Chối"
            number={leaveRejected}
            color="bg-danger"
          />
        </div>
      </div>


      {/* List of rechart  */}
      <div className="charts bg-light rounded">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          right: 50,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="pv" fill="#8884d8" />
        <Bar dataKey="uv" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>

    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          right: 60,
          left: 10,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="pv"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  </div>
    </div>
  );
};

export default Home;
