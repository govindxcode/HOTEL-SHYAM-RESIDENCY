import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, required: true, min: 1, max: 20 },
    roomType: {
      type: String,
      required: true,
      enum: ["Family Room", "Deluxe Room"],
    },
    message: { type: String, trim: true, maxlength: 1000, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export default mongoose.model("Booking", bookingSchema);
