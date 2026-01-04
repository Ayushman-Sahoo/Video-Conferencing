// Import mongoose and Schema class
import mongoose, { Schema } from "mongoose";

// =====================
// User Schema
// =====================
// This schema defines how a user document
// will be stored inside MongoDB
const userSchema = new Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true,
      trim: true, // removes extra spaces
    },

    // Username for login (must be unique)
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Encrypted password (bcrypt hash)
    password: {
      type: String,
      required: true,
    },

    // Token (JWT or session token)
    token: {
      type: String,
    },
  },
  {
    // Automatically adds createdAt & updatedAt fields
    timestamps: true,
  }
);

// =====================
// User Model
// =====================
// Converts schema into a MongoDB collection
const User = mongoose.model("User", userSchema);

// Export model so it can be used in controllers
export default User;