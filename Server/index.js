import express from "express";
import cors from "cors";
import { adminRouter } from "./routes/AdminRoute.js";
import { employeeRouter } from "./routes/EmployeeRoute.js";
import cookieParser from "cookie-parser";
import path from "path";


const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/auth", adminRouter);
app.use("/employee", employeeRouter);
app.use(express.static("Public"));
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use("/Images", express.static(path.join(__dirname, "public/Images")));

app.listen(3000, () => {
  console.log("Server is running");
});
