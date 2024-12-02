import "./App.css";
import { Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Components/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Components/Dashboard";
import Home from "./Components/Home";
import Employee from "./Components/Employee";
import Category from "./Components/Category";
import Setting from "./Components/Setting";
import AddCategory from "./Components/AddCategory";
import AddEmployee from "./Components/AddEmployee";
import EditEmployee from "./Components/EditEmployee";
import EmployeeDetail from "./Components/EmployeeDetail";
import EmployeeDashboard from "./Components/EmployeeDashboard";
import Salary from "./Components/Salary";
import AddSalary from "./Components/AddSalary";
import Leaves from "./Components/Leaves";
import EmployeeLeaves from "./Components/EmployeeLeaves"
import AddLeave from "./Components/AddLeave";
import EmployeeSalary from "./Components/EmployeeSalary";
import EmployeeSetting from "./Components/EmployeeSetting";
import FaceRecognition from "./Components/FaceRecognition";

function App() {
  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />}></Route>
          

            <Route path="/employee_dashboard" element={<EmployeeDashboard />}>

            <Route path="/employee_dashboard/:id/employee_detail" element={<EmployeeDetail />} />
            <Route path="/employee_dashboard/:id/employee_leave" element={<EmployeeLeaves />} />
            <Route path="/employee_dashboard/:id/employee_salary" element={<EmployeeSalary />} />
            <Route path="/employee_dashboard/:id/change-password" element={<EmployeeSetting />} />
            <Route path="/employee_dashboard/add_leave" element={<AddLeave />} /> 

          </Route>

          <Route path="/dashboard" element={ <Dashboard />}>
            <Route path="" element={<Home />}></Route>
            <Route path="/dashboard/employee" element={<Employee />}></Route>
            <Route path="/dashboard/category" element={<Category />}></Route>
            <Route path="/dashboard/change-password" element={<Setting />}></Route>
            <Route path="/dashboard/add_category" element={<AddCategory />}></Route>
            <Route path="/dashboard/add_employee" element={<AddEmployee />}></Route>
            <Route path="/dashboard/edit_employee/:id" element={<EditEmployee />}></Route>
            <Route path="/dashboard/leaves" element={<Leaves/>}></Route>
            <Route path="/dashboard/salary" element={<Salary />}></Route> 
            <Route path="/dashboard/add_salary" element={<AddSalary />}></Route>
            <Route path="/dashboard/attendance" element={<FaceRecognition />} />

          </Route>
        </Routes>

      </BrowserRouter>
    </Fragment>
  );
}

export default App;
