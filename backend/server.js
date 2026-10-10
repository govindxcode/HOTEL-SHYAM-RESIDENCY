import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import express from "express";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Booking from "./models/Booking.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });
dns.setServers(["8.8.8.8"]);

const app = express();
const PORT = Number(process.env.PORT) || 5000;
let databaseError = "";
const useMemoryDatabase =
  process.env.MONGODB_USE_MEMORY === "true" ||
  !process.env.MONGODB_URI ||
  process.env.MONGODB_URI === "YOUR_MONGODB_URI";

app.use(cors());
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    hotel: "Hotel Shyam Residency",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    database: useMemoryDatabase ? "in-memory" : "mongodb-atlas",
    error: databaseError || undefined,
  });
});

app.use("/api/bookings", (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: databaseError
        ? "The booking database is unavailable. Please try again shortly or contact us by phone or WhatsApp."
        : "The booking service is starting. Please try again shortly.",
    });
  }
  next();
});

app.post("/api/bookings", async (req, res) => {
  try {
    const { name, phone, checkIn, checkOut, guests, roomType, message } =
      req.body || {};

    if (!name?.trim() || !phone?.trim() || !checkIn || !checkOut || !roomType) {
      return res.status(400).json({
        message: "Please fill name, phone, dates and room type.",
      });
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return res.status(400).json({
        message: "Check-out must be after check-in.",
      });
    }

    const guestCount = Number(guests);
    if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 20) {
      return res.status(400).json({ message: "Guest count looks invalid." });
    }

    const allowed = ["Family Room", "Deluxe Room"];
    if (!allowed.includes(roomType)) {
      return res.status(400).json({ message: "Please choose a valid room type." });
    }

    const booking = await Booking.create({
      name: name.trim(),
      phone: phone.trim(),
      checkIn,
      checkOut,
      guests: guestCount,
      roomType,
      message: (message || "").trim(),
      status: "Pending",
    });

    res.status(201).json({
      message: "Enquiry received. We will confirm on WhatsApp or phone.",
      booking,
    });
  } catch (error) {
    console.error("POST /api/bookings", error);
    res.status(500).json({ message: "Could not save enquiry. Please try again." });
  }
});

app.get("/api/bookings", async (_req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
    res.json(bookings);
  } catch (error) {
    console.error("GET /api/bookings", error);
    res.status(500).json({ message: "Could not load bookings." });
  }
});

app.patch("/api/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};
    const allowed = ["Pending", "Confirmed", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.json(booking);
  } catch (error) {
    console.error("PATCH /api/bookings/:id/status", error);
    res.status(500).json({ message: "Could not update status." });
  }
});

async function connectDatabase() {
  let uri = process.env.MONGODB_URI;

  if (useMemoryDatabase) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const memory = await MongoMemoryServer.create();
    uri = memory.getUri("shyam-residency");
    console.log(
      "MONGODB_URI is a placeholder. Using in-memory MongoDB for local running. Set a real URI in backend/.env for lasting storage."
    );
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected");
}

app.listen(PORT, () => {
  console.log(`Hotel Shyam Residency API on http://localhost:${PORT}`);
});

async function connectDatabaseWithRetry() {
  while (mongoose.connection.readyState !== 1) {
    try {
      await connectDatabase();
      databaseError = "";
    } catch (error) {
      databaseError = error.message;
      console.error("Database connection failed; retrying in 10 seconds", error);
      await new Promise((resolve) => setTimeout(resolve, 10_000));
    }
  }
}

connectDatabaseWithRetry();
