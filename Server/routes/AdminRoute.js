import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = express.Router();
const getUserFromDatabase = (email, callback) => {
  const query = "SELECT * FROM employee WHERE email = ?"; // Truy vấn lấy thông tin người dùng từ bảng `employee`

  con.query(query, [email], (err, result) => {
    if (err) {
      callback(err, null);
    } else if (result.length === 0) {
      callback(null, null); // Không tìm thấy người dùng
    } else {
      callback(null, result[0]); // Trả về người dùng đầu tiên
    }
  });
};

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if (err) return res.json({ Status: false, Error: "wrong token" });
      req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
      next();
    });
  } else {
    return res.json({ Status: false, Error: "Not authenticated" });
  }
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Gọi hàm getUserFromDatabase để kiểm tra người dùng trong cơ sở dữ liệu
  getUserFromDatabase(email, (err, user) => {
    if (err) {
      return res
        .status(500)
        .json({ loginStatus: false, Error: "Database error" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ loginStatus: false, Error: "User not found" });
    }

    // So sánh mật khẩu
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res
          .status(500)
          .json({ loginStatus: false, Error: "Error comparing password" });
      }

      if (isMatch) {
        // Tạo JWT token nếu mật khẩu đúng
        const token = jwt.sign(
          { id: user.id_emp, role: user.role, email: user.email },
          "jwt_secret_key",
          { expiresIn: "1d" }
        );

        // Gửi token dưới dạng cookie
        res.cookie("token", token, { httpOnly: true });

        // Điều hướng dựa trên role
        return res.json({
          loginStatus: true,
          role: user.role,
          id: user.id_emp, // Đảm bảo trả về id_emp
          employee: {
            id_emp: user.id_emp, // Hoặc bất kỳ thông tin nhân viên nào bạn muốn trả về
            name: user.name,
            email: user.email,
            role: user.role,
            salary: user.salary,
            image: user.image,
            // Các trường thông tin khác nếu cần
          },
          redirectTo:
            user.role === "admin" ? "/dashboard" : "/employee_dashboard",
        });
      } else {
        return res.json({
          loginStatus: false,
          Error: "Sai Email hoặc Password. NHẬP LẠI !!!",
        });
      }
    });
  });
});

router.get("/category", (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/add_category", (req, res) => {
  const sql = "INSERT INTO category (`name`) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" });
    return res.json({ Status: true });
  });
});

//xu ly anh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});
//ket thuc xu ly anh

router.get("/employee", (req, res) => {
  const sql = "SELECT * FROM employee ";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" });
    return res.json({ Status: true, Result: result });
  });
});

router.post("/add_employee", verifyUser, upload.single("image"), (req, res) => {
  const id_emp = req.body.id_emp; // Lấy id_emp từ body

  // Kiểm tra xem ID đã tồn tại chưa
  const checkIdQuery = "SELECT * FROM employee WHERE id_emp = ?";
  con.query(checkIdQuery, [id_emp], (err, results) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });

    if (results.length > 0) {
      return res.json({
        Status: false,
        Error: "ID_Emp đã tồn tại, vui lòng chọn ID khác.",
      });
    }

    // Nếu ID không tồn tại, tiếp tục thêm nhân viên
    const sql = `INSERT INTO employee (id_emp, name, email, password,role, address, salary, image, category_id) VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) return res.json({ Status: false, Error: "Query Error" });

      const values = [
        id_emp, // Thêm id_emp vào values
        req.body.name,
        req.body.email,
        hash,
        req.body.role,
        req.body.address,
        req.body.salary,
        req.file.filename,
        req.body.category_id,
        
      ];

      con.query(sql, [values], (err, result) => {
        if (err) return res.json({ Status: false, Error: err });
        return res.json({ Status: true });
      });
    });
  });
});

const calculateTotalSalary = (salary, allowance, deduction) => {
  const validSalary = Number(salary) || 0; // Nếu không phải số, gán là 0
  const validAllowance = Number(allowance) || 0;
  const validDeduction = Number(deduction) || 0;

  return validSalary + validAllowance - validDeduction;
};

router.post("/add_salary", verifyUser, (req, res) => {
  const { id_salary, id_emp, salary, allowance, deduction, pay_date } =
    req.body;
  const { id, role } = req.user; // Lấy id và role của admin đang đăng nhập

  // Kiểm tra nếu admin đang cố gắng tính lương cho chính mình
  if (role === "admin" && id_emp === id) {
    return res.json({
      Status: false,
      Error: "Admin không thể tính lương cho chính mình",
    });
  }

  const sql = `INSERT INTO salary (id_salary, id_emp, salary, allowance, deduction, pay_date, total_salary) VALUES (?)`;
  const total_salary = calculateTotalSalary(salary, allowance, deduction); // Tính tổng lương

  const values = [
    id_salary,
    id_emp,
    salary,
    allowance,
    deduction,
    pay_date,
    total_salary,
  ];

  con.query(sql, [values], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ Status: false, Error: err });
    }
    return res.json({ Status: true });
  });
});


router.put("/edit_employee/:id", verifyUser, (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employee set name= ?, email=?, salary=?, address=?, category_id=?, role=? where id_emp=?`;

  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id,
    req.body.role
  ];
  con.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.delete("/delete_employee/:id", verifyUser, (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employee where id_emp = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_count", (req, res) => {
  const sql = "SELECT COUNT(*) AS admin FROM employee WHERE role = 'admin'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/employee_count", (req, res) => {
  const sql = "select count(id_emp) as employee from employee";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/salary_count", (req, res) => {
  const sql = "select sum(total_salary) as salary from salary";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/leave_count", (req, res) => {
  const sql = "select count(id_leave) as leaves from leaves";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/leaveApproved_count", (req, res) => {
  const sql = "SELECT COUNT(*) AS leaveApproved FROM leaves WHERE status = 'approved'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});
router.get("/leavePending_count", (req, res) => {
  const sql = "SELECT COUNT(*) AS leavePending FROM leaves WHERE status = 'pending'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});
router.get("/leaveRejected_count", (req, res) => {
  const sql = "SELECT COUNT(*) AS leaveRejected FROM leaves WHERE status = 'rejected'";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/admin_records", (req, res) => {
  const sql = "select * from admin";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

router.get("/employee/:id", verifyUser, (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employee WHERE id_emp = ?"; // Sửa lại để tìm theo id_emp
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    if (result.length === 0) {
      return res.json({ Status: false, Error: "Không tìm thấy nhân viên" });
    }
    return res.json({ Status: true, Result: result[0] }); // Trả về nhân viên đầu tiên
  });
});

router.get("/salary", (req, res) => {
  const sql = "Select * from salary";
  con.query(sql, (err, result) => {
    if (err)
      return res.json({ Status: false, Error: "History Salary Error" } + err);
    return res.json({ Status: true, Result: result });
  });
});

router.delete("/delete_category/:id", verifyUser, (req, res) => {
  const id = req.params.id;
  const updateCategory_ID = `UPDATE employee Set category_id = NULL where category_id=? `;
  con.query(updateCategory_ID, [id], (err) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    const sql = "DELETE From category where id=?";
    con.query(sql, [id], (err, result) => {
      if (err) return res.json({ Status: false, Error: "Querry Error" + err });
      return res.json({ Status: true, Result: result });
    });
  });
});

// Cấu hình transporter cho Nodemailer
// const transporter = nodemailer.createTransport({
//   service: "gmail", // Hoặc dịch vụ bạn muốn sử dụng
//   auth: {
//     user: "your_email@gmail.com", // Thay bằng email của bạn
//     pass: "your_email_password", // Thay bằng mật khẩu email
//   },
// });

// let verificationCode;

// Route gửi mã xác thực
// router.post("/send-verification-code", verifyUser, (req, res) => {
//   const email = req.user.email; // Giả sử bạn lưu email trong token
//   verificationCode = Math.floor(100000 + Math.random() * 900000); // Tạo mã xác thực 6 chữ số

//   const mailOptions = {
//     from: "your_email@gmail.com",
//     to: email,
//     subject: "Mã xác thực đổi mật khẩu",
//     text: `Mã xác thực của bạn là: ${verificationCode}`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return res.json({ Status: false, Error: "Gửi email thất bại" });
//     }
//     return res.json({ Status: true, message: "Mã xác thực đã được gửi" });
//   });
// });

// //Xac thuc ma~
// router.post("/verify-code", (req, res) => {
//   const { code } = req.body;

//   if (code == verificationCode) {
//     return res.json({ Status: true, message: "Mã xác thực đúng" });
//   } else {
//     return res.json({ Status: false, Error: "Mã xác thực không đúng" });
//   }
// });

const queryAsync = (query, params) => {
  return new Promise((resolve, reject) => {
    con.query(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// const hashAllPasswords = async () => {
//   try {
//     const users = await queryAsync("SELECT id, password FROM admin");
//     for (let user of users) {
//       // Bỏ qua nếu mật khẩu đã được mã hóa
//       if (user.password && !user.password.startsWith("$2b$")) {
//         const hashedPassword = await bcrypt.hash(user.password, 10);
//         await queryAsync("UPDATE admin SET password = ? WHERE id = ?", [
//           hashedPassword,
//           user.id,
//         ]);
//         console.log(`Updated password for user ID: ${user.id}`);
//       }
//     }
//     console.log("Password update completed");
//   } catch (error) {
//     console.error("Error updating passwords:", error);
//   }
// };

// // Gọi hàm để mã hóa mật khẩu
// hashAllPasswords();

router.put("/change-password", verifyUser, async (req, res) => {
  const id = req.user.id;
  const { oldPassword, newPassword } = req.body;
  try {
    // Lấy thông tin user từ DB
    const userQuery = "SELECT * FROM employee WHERE id_emp = ?";
    const userResult = await queryAsync(userQuery, [id]);

    if (userResult.length === 0) {
      return res.json({ Status: false, Error: "User not found" });
    }

    const user = userResult[0];

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.json({ Status: false, Error: "Mật khẩu cũ không đúng" });
    }

    // Mã hóa mật khẩu mới và cập nhật vào DB
    const hashPassword = await bcrypt.hash(newPassword, 10);
    const updateUserQuery = "UPDATE employee SET password = ? WHERE id_emp = ?";
    await queryAsync(updateUserQuery, [hashPassword, id]);

    return res.json({ Status: true });
  } catch (err) {
    return res.json({ Status: false, Error: "Lỗi truy vấn: " + err.message });
  }
});

router.get("/leave", (req, res) => {
  const sql = "select * from leaves";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});

// Route để cập nhật trạng thái đơn nghỉ
router.put("/update_leave_status/:id_leave", verifyUser, (req, res) => {
  const id_leave = req.params.id_leave; // Lấy ID của đơn nghỉ từ URL
  const { status } = req.body; // Lấy trạng thái mới từ body (approved/rejected)
  const { id, role } = req.user; // ID của user hiện tại

  // Kiểm tra trạng thái có hợp lệ không
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.json({ Status: false, Error: "Trạng thái không hợp lệ" });
  }

  // Truy vấn để lấy thông tin về đơn nghỉ
  const sql = "SELECT * FROM leaves WHERE id_leave = ?";
  con.query(sql, [id_leave], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });

    if (result.length === 0) {
      return res.json({ Status: false, Error: "Không tìm thấy đơn nghỉ" });
    }

    // Kiểm tra xem admin có đang cố gắng xử lý đơn nghỉ của chính mình không
    if (role === "admin") {
      const leave = result[0];
      // Nếu admin đang cố gắng xử lý đơn nghỉ của chính mình
      if (leave.id_emp === id) {
        return res.json({
          Status: false,
          Error: "Admin không thể xử lý đơn nghỉ của chính mình",
        });
      }
    }

    // Cập nhật trạng thái đơn nghỉ trong cơ sở dữ liệu
    const updateStatusQuery = "UPDATE leaves SET status = ? WHERE id_leave = ?";
    con.query(updateStatusQuery, [status, id_leave], (err, updateResult) => {
      if (err) return res.json({ Status: false, Error: "Update Error" });
      return res.json({
        Status: true,
        Message: "Cập nhật trạng thái thành công",
      });
    });
  });
});

router.get("/leave_detail/:id_leave",verifyUser,(req,res)=>{
  const id_leave=req.body.id_leave;
  const sql="Select *from leaves where id_leave =?";
  con.query(sql,[id_leave],(err,result)=>{
    if(err)
      return res.json({Status: false,Error: "Querry error" +err});
    return res.json({Status: true,Result: result});
  })
})

router.get("/employee_detail/:id_emp", verifyUser, (req, res) => {
  const employeeId = req.params.id_emp;

  // Truy vấn thông tin nhân viên từ DB
  const sql = "SELECT * FROM employee WHERE id_emp = ?";
  con.query(sql, [employeeId], (err, result) => {
    if (err) {
      return res.status(500).json({ Status: false, Error: "Database query error" });
    }

    if (result.length > 0) {
      const employeeData = result[0];

      // Giả sử hình ảnh được lưu trữ trong thư mục 'uploads'
      const imageUrl = `http://localhost:3000/Images/${employeeData.image}`;

      // Trả lại thông tin nhân viên và đường dẫn ảnh
      res.json({
        Status: true,
        Result: {
          id_emp: employeeData.id_emp,
          name: employeeData.name,
          email: employeeData.email,
          salary: employeeData.salary,
          role: employeeData.role,
          image: imageUrl, // Trả lại đường dẫn ảnh
        },
      });
    } else {
      return res.status(404).json({ Status: false, Error: "Employee not found" });
    }
  });
});

// router.post("/attendance", verifyUser, (req, res) => {
//   const { userId, timestamp, status } = req.body;

//   if (!userId || !timestamp || !status) {
//     return res.status(400).json({ Status: false, Error: "Missing required fields" });
//   }

//   const sql = "select * from attendence where id=?";
//   con.query(sql, [userId, timestamp, status], (err, result) => {
//     if (err) {
//       console.error("Error inserting attendance:", err);
//       return res.status(500).json({ Status: false, Error: "Error inserting attendance" });
//     }

//     res.status(200).json({ Status: true, Message: "Attendance recorded successfully" });
//   });
// });

export { router as adminRouter };
