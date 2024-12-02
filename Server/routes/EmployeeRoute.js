import express from "express";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const router = express.Router();
// Middleware để xác thực JWT
const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Lấy token từ cookie

  if (!token) {
    return res.status(403).json({ Status: false, Error: "No token provided" });
  }

  // Giải mã token để lấy thông tin người dùng
  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.status(403).json({ Status: false, Error: "Invalid token" });
    }

    // Lưu thông tin người dùng vào request để sử dụng ở các route tiếp theo
    req.user = decoded; // Lưu decoded vào req.user
    next(); // Cho phép tiếp tục đến route tiếp theo
  });
};

router.post("/employee_login", (req, res) => {
  const sql = "SELECT * from employee WHERE email = ?";

  con.query(sql, [req.body.email], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res
        .status(500)
        .json({ loginStatus: false, Error: "Database query error" });
    }

    if (result.length > 0) {
      // Kiểm tra mật khẩu
      bcrypt.compare(req.body.password, result[0].password, (err, isMatch) => {
        if (err) {
          console.error("Password comparison error:", err);
          return res
            .status(500)
            .json({ loginStatus: false, Error: "Error checking password" });
        }

        if (isMatch) {
          const employeeData = result[0];
          const token = jwt.sign(
            {
              // role: "employee",
              role: employeeData.role,
              email: employeeData.email,
              salary: employeeData.salary,
              id: employeeData.id_emp,
              image: employeeData.image,
            },
            "jwt_secret_key",
            { expiresIn: "1d" }
          );

          res.cookie("token", token, { httpOnly: true }); // Cookie nên có tùy chọn httpOnly để bảo mật
        } else {
          return res.json({ loginStatus: false, Error: "Wrong Password" });
        }
      });
    } else {
      return res.json({
        loginStatus: false,
        Error: "Sai Email hoặc Password. NHẬP LẠI !!!",
      });
    }
  });
});

// Route lấy thông tin nghỉ phép của nhân viên
router.get("/employee_leave", verifyToken, (req, res) => {
  const id_emp = req.user.id; // Lấy ID từ token
  const sql = "SELECT * FROM leaves WHERE id_emp = ?";

  con.query(sql, [id_emp], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error: " + err });
    return res.json({ Status: true, Result: result });
  });
});
router.get("/employee_salary", verifyToken, (req, res) => {
  const id_emp = req.user.id;
  const sql = "Select * from salary where id_emp=?";

  con.query(sql, [id_emp], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Querry Error" + err });
    return res.json({ Status: true, Result: result });
  });
});
// router.put("/change-password", async (req, res) => {
//   const id = req.user.id;
//   const { oldPassword, newPassword } = req.body;
//   try {
//     // Lấy thông tin user từ DB
//     const userQuery = "SELECT * FROM employee WHERE id_emp = ?";
//     const userResult = await queryAsync(userQuery, [id]);

//     if (userResult.length === 0) {
//       return res.json({ Status: false, Error: "User not found" });
//     }

//     const user = userResult[0];

//     // Kiểm tra mật khẩu cũ
//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) {
//       return res.json({ Status: false, Error: "Mật khẩu cũ không đúng" });
//     }

//     // Mã hóa mật khẩu mới và cập nhật vào DB
//     const hashPassword = await bcrypt.hash(newPassword, 10);
//     const updateUserQuery = "UPDATE employee SET password = ? WHERE id_emp = ?";
//     await queryAsync(updateUserQuery, [hashPassword, id]);

//     return res.json({ Status: true });
//   } catch (err) {
//     return res.json({ Status: false, Error: "Lỗi truy vấn: " + err.message });
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
//     const users = await queryAsync("SELECT id_emp, password FROM employee");
//     for (let user of users) {
//       // Bỏ qua nếu mật khẩu đã được mã hóa
//       if (user.password && !user.password.startsWith("$2b$")) {
//         const hashedPassword = await bcrypt.hash(user.password, 10);
//         await queryAsync("UPDATE employee SET password = ? WHERE id_emp = ?", [
//           hashedPassword,
//           user.id,
//         ]);
//         console.log(`Updated password for user ID: ${user.id}`);
//       }
//     }
//   } catch (error) {
//     console.error("Error updating passwords:", error);
//   }
// };

// // Gọi hàm để mã hóa mật khẩu
// hashAllPasswords();
router.put("/change-password", verifyToken, async (req, res) => {
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

// Backend route để xử lý thêm đơn nghỉ phép
router.post("/add_leave", verifyToken, (req, res) => {
  const { id_emp, leaveType, startDate, endDate, reason, status } = req.body;

  // Kiểm tra dữ liệu
  if (!id_emp || !leaveType || !startDate || !endDate || !reason) {
    return res
      .status(400)
      .json({ Status: false, Error: "Missing required fields" });
  }

  const now = new Date();
  const id_leave = `MD${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}${now
    .getHours()
    .toString()
    .padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;

  // Thêm đơn nghỉ phép vào cơ sở dữ liệu
  const sql =
    "INSERT INTO leaves (id_leave,id_emp, leaveType, startDate, endDate, reason, status) VALUES (?, ?, ?, ?, ?, ?,?)";
  con.query(
    sql,
    [id_leave, id_emp, leaveType, startDate, endDate, reason, status],
    (err, result) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ Status: false, Error: "Database query error" });
      }
      return res
        .status(200)
        .json({ Status: true, Message: "Leave request added successfully" });
    }
  );
});


router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: true });
});

export { router as employeeRouter };
