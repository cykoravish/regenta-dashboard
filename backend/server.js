import fs from "fs";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dbConnect } from "./helpers/dbConnect.js";
import Payment from "./models/Payment.js";
import { verifyToken } from "./auth/verify.js";
import jwt from "jsonwebtoken";
import UserData from "./models/UserData.js";
import multer from "multer";
import csv from "csv-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

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

app.post("/api/upload-csv", upload.single("csvFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const results = [];
    const filePath = req.file.path;

    // Parse CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        // console.log("data: ", data);
        // Validate and transform data
        if (data.amount && data.fullName && data.email && data.phone) {
          results.push({
            amount: Number.parseFloat(data.amount),
            fullName: data.fullName.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
          });
        }
      })
      .on("end", async () => {
        try {
          // Insert data into MongoDB
          if (results.length > 0) {
            await UserData.insertMany(results);

            // Delete the uploaded file after processing
            fs.unlinkSync(filePath);

            res.json({
              success: true,
              message: "CSV data uploaded successfully",
              count: results.length,
            });
          } else {
            fs.unlinkSync(filePath);
            res.status(400).json({
              error: "No valid data found in CSV file",
            });
          }
        } catch (error) {
          console.error("Error inserting data:", error);
          fs.unlinkSync(filePath);
          res.status(500).json({
            error: "Failed to insert data into database",
          });
        }
      })
      .on("error", (error) => {
        console.error("Error parsing CSV:", error);
        fs.unlinkSync(filePath);
        res.status(500).json({ error: "Failed to parse CSV file" });
      });
  } catch (error) {
    console.error("Error uploading CSV:", error);
    res.status(500).json({ error: "Failed to upload CSV file" });
  }
});

app.get("/api/user-data/next", async (req, res) => {
  try {
    const userData = await UserData.findOne({ processed: false }).sort({
      createdAt: 1,
    });

    if (!userData) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

app.patch("/api/user-data/:id/processed", async (req, res) => {
  try {
    const { id } = req.params;
    await UserData.findByIdAndUpdate(id, { processed: true });
    res.json({ success: true, message: "User data marked as processed" });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Failed to update user data" });
  }
});

dbConnect().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
