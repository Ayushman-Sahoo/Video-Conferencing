// HTTP status codes (clean & readable)
import httpStatus from "http-status";

// Import User and Meeting models (DEFAULT exports)
import User from "../models/userModels.js";
import Meeting from "../models/meetingmodels.js";

// For hashing & comparing passwords
import bcrypt from "bcrypt";

// For generating random auth tokens
import crypto from "crypto";

/* =====================================================
   LOGIN USER
===================================================== */
const login = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Username and password are required" });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    // Compare entered password with hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid username or password" });
    }

    // Generate random token
    const token = crypto.randomBytes(20).toString("hex");

    // Save token in DB
    user.token = token;
    await user.save();

    // Send token to client
    return res.status(httpStatus.OK).json({ token });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/* =====================================================
   REGISTER USER
===================================================== */
const register = async (req, res) => {
  const { name, username, password } = req.body;

  // Validate input
  if (!name || !username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.CONFLICT)
        .json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "User registered successfully" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/* =====================================================
   ADD MEETING TO HISTORY
===================================================== */
const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  try {
    // Find user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    // Create meeting entry linked to user ObjectId
    const newMeeting = new Meeting({
      userId: user._id,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "Meeting added to history" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/* =====================================================
   GET USER MEETING HISTORY
===================================================== */
const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    // Find user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    // Fetch meetings linked to this user
    const meetings = await Meeting.find({ userId: user._id });

    return res.status(httpStatus.OK).json(meetings);
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/* =====================================================
   EXPORT CONTROLLERS
===================================================== */
export {
  login,
  register,
  addToHistory,
  getUserHistory,
};