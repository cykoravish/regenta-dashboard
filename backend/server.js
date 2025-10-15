import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dbConnect } from "./helpers/dbConnect.js";
import Payment from "./models/Payment.js";
import { verifyToken } from "./auth/verify.js";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "dashboard api is up and running" });
});

app.post("/api/admin/verify-token", verifyToken);
app.post(
  "/api/admin/login",

  (req, res) => {
    const { emailOrPhone, password } = req.body;

    const isEmailOrPhoneValid =
      emailOrPhone === process.env.ADMIN_EMAIL ||
      emailOrPhone === process.env.ADMIN_PHONE;

    if (isEmailOrPhoneValid && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ user: emailOrPhone }, process.env.JWT_SECRET, {
        expiresIn: "16h",
      });

      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  }
);

// Get payment details
// app.get("/api/payment/:paymentId", verifyToken, async (req, res) => {
//   try {
//     const { paymentId } = req.params;
//     const payment = await razorpay.payments.fetch(paymentId);

//     res.json({
//       success: true,
//       payment,
//     });
//   } catch (error) {
//     console.error("Error fetching payment:", error);
//     res.status(500).json({
//       error: "Failed to fetch payment details",
//       details: error.message,
//     });
//   }
// });

// GET all successful payments
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }); // latest first

    res.json({ success: true, verifyToken, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch payments" });
  }
});

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
