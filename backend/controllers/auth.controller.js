import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookies } from "../utils/generateTokenAndSetCookies.js";
import {
  sendverificationEmail,
  sendWelcomeEmail,
  sendpasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/email.js"; // Import the function to send a verification email

// Signup controller function
export const signup = async (req, res) => {
  const { email, password, name } = req.body; // Destructure the required fields from the request body
  try {
    // Step 1: Validate required fields
    // Ensure that all the required fields (email, password, name) are provided
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    // Step 2: Check if user already exists in the database
    // Query the database to check if a user with the provided email already exists
    const userAlreadyExists = await User.findOne({ email });
    console.log("useralreadyExist", userAlreadyExists);
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" }); // If user exists, return an error response
    }

    // Step 3: Hash the password for secure storage
    // Hash the user's password using bcryptjs before saving it to the database
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Step 4: Generate a verification token for email confirmation
    const verificationToken = generateVerificationToken(); // Generate a token for email verification

    // Step 5: Create a new user instance with the hashed password and verification token
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
    });

    // Step 6: Save the new user to the database
    await user.save(); // Save the new user in the database

    // Step 7: Generate a JWT token and set cookies for authentication
    // Create a JWT for the user and set it in the response cookies
    generateTokenAndSetCookies(res, user._id);

    // Step 8: Send a verification email to the user
    // Use the `sendverificationEmail` function to send a verification email with the token
    await sendverificationEmail(user.email, verificationToken);

    // Step 9: Respond with a success message and user details (without the password)
    res.status(201).json({
      success: true,
      message: "User created successfully", // Confirmation message for successful user creation
      user: {
        ...user._doc,
        password: undefined, // Exclude the password from the response
      },
    });
  } catch (error) {
    // Step 10: Handle errors
    // If any error occurs during the process, respond with an appropriate error message
    res.status(400).json({ success: false, message: "User already exists" });
  }
};

// Placeholder function for verifyEmail
export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        sucess: false,
        message: "Invalid or expired verification code",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    // saving the user to the database
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined, // Exclude the password from the response
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ sucess: false, message: "server error" });
  }
};

// Placeholder function for login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ sucess: false, message: "Invalid credentials" });
    }
    //else generate a token
    generateTokenAndSetCookies(res, user._id);
    user.lastLogin = new Date();
    //save it in the database
    await user.save();
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined, // Exclude the password from the response
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ sucess: false, message: error.message });
  }
  // res.send("login routes");
};

// Placeholder function for logout
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ sucess: true, message: "log out successfuly" });
};

export const forgotpassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ sucess: false, message: "User not found" });
    }
    //generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpireAt = Date.now() + 3 * 60 * 60 * 1000; // 1 hour

    user.resetpasswordExpiresAt = resetTokenExpireAt;
    user.resetpasswordToken = resetToken;

    await user.save();

    //send email
    await sendpasswordResetEmail(
      user.email,
      ` ${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res.status(200).json({
      sucess: true,
      message: "password was sent successfully to your email provided",
    });
  } catch (error) {
    console.log("check your passwordforgot ", error);
    res.status(500).json({ sucess: false, message: "server error" });
  }
};

export const resetpassword = async (req, res) => {
  try {
    // Extract the reset token from the request parameters and the new password from the request body
    const { token } = req.params; // lowercase 'p'
    const { password } = req.body;
    // Find the user in the database with the matching reset token and check if the token hasn't expired
    const user = await User.findOne({
      resetpasswordToken: token, // token should match the one stored in the database
      resetpasswordExpiresAt: { $gt: Date.now() }, // token expiration should be in the future (not expired)
    });
    console.log("Token from request:", token);
    console.log("Current time:", Date.now());
    // If no matching user is found, or the token is expired, return an error response
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // Hash the new password before saving it to the database
    const hashedPassword = await bcryptjs.hash(password, 10); // 10 is the salt rounds for bcrypt
    user.password = hashedPassword; // assign the hashed password to the user's password field

    // Clear the reset token and expiration time from the user's record (no longer needed)
    user.resetpasswordToken = undefined;
    user.resetpasswordExpiresAt = undefined;

    // Save the updated user data to the database
    await user.save();

    // Optionally, send a confirmation email to the user that the password has been successfully reset
    await sendResetSuccessEmail(user.email);

    // Respond with a success message once the password reset process is complete
    res
      .status(200) // Change to status 200 (OK) for success
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    // If any error occurs during the process, log it and return a failure response with the error message
    console.log("Error in resetPassword", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: flase, message: "user not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("user error", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
