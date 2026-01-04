import mongoose, { Schema } from "mongoose";
// =====================
// Meeting Schema
// =====================
const meetingSchema = new Schema(
  {
    // Reference to User who created the meeting
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Unique meeting code
    meetingCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    // Automatically adds createdAt & updatedAt
    timestamps: true,
  }
);
// =====================
// Meeting Model
// =====================
const Meeting = mongoose.model("Meeting", meetingSchema);
// Export model (default for consistency)
export default Meeting;