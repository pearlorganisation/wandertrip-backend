import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import {
  COOKIE_OPTIONS,
  OAUTH_EXCHANGE_EXPIRY,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../../../constants.js";
import { FRONTEND_URL } from "../../config/index.js";
import { google } from "../../config/oauth.js";
import OTP from "../../models/otp/otp.model.js";
import User from "../../models/users/user.model.js";
import ApiError from "../../utils/error/ApiError.js";
import { asyncHandler } from "../../utils/error/asyncHandler.js";
import {
  sendPasswordResetOTPOnMail,
  sendRegistrationOTPOnMail,
} from "../../utils/mail/emailTemplate.js";
import { generateOTP } from "../../utils/otpUtils.js";
import jwt from "jsonwebtoken";

export const signup = asyncHandler(async (req, res, next) => {
  const { email, fullName } = req?.body;
  const existingUser = await User.findOne({ email });
  const otp = generateOTP();
  try {
    if (existingUser) {
      if (existingUser.isVerified) {
        return next(new ApiError("User already exists!", 400));
      }

      await sendRegistrationOTPOnMail(email, { fullName, otp });
      await OTP.findOneAndReplace(
        { email, type: "REGISTER" },
        { otp, email, type: "REGISTER" },
        { upsert: true, new: true } // upsert: Creates a new document if no match is found., new: returns updated doc
      );

      return res.status(200).json({
        success: true,
        message: "OTP resent successfully. Please verify your email.",
      });
    }
    // Create new user and send OTP
    await sendRegistrationOTPOnMail(email, { fullName, otp });
    await OTP.create({
      otp,
      email,
      type: "REGISTER",
    });
    await User.create({ ...req?.body, isVerified: false }); // thsi will through error if user creation fails
    res.status(201).json({
      success: true,
      message: "OTP sent successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Error Sending OTP:", error);
    return next(new ApiError(`Failed to send OTP: ${error.message}`, 400));
  }
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;
  if (!email || !password) {
    return next(new ApiError("All fields are required.", 400));
  }
  const existingUser = await User.findOne({ email });
  if (!existingUser) return next(new ApiError("User not found", 400));

  // Check if the user is verified (if necessary)
  if (!existingUser.isVerified) {
    return next(
      new ApiError("Please verify your email before logging in.", 403)
    );
  }

  const isValidPassword = await existingUser.isPasswordCorrect(password);

  if (!isValidPassword) {
    return next(new ApiError("Wrong password.", 400));
  }

  const access_token = existingUser.generateAccessToken();
  const refresh_token = existingUser.generateRefreshToken();

  // // Convert Mongoose document to plain object
  // const sanitizedUser = existingUser.toObject();
  // sanitizedUser.password = undefined;
  // sanitizedUser.createdAt = undefined;
  // sanitizedUser.updatedAt = undefined;
  // sanitizedUser.__v = undefined;

  res
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    })
    .status(200)
    .json({
      success: true,
      message: "Login Successfull.",
      // user: sanitizedUser,
    });
});

export const logout = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    // Check if user was found
    if (!user) {
      return next(new ApiErrorResponse("User not found", 404)); // Return 404 if no user found
    }

    res
      .cookie("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      .cookie("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      .status(200)
      .json({ success: true, message: "Logout successfully!" });
  } catch (error) {
    console.log(`Error in logout: ${error.message}`);
    return next(new ApiErrorResponse("Error in logout", 500));
  }
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError("Email is required.", 400));
  }
  const existingUser = await User.findOne({ email });

  if (!existingUser) return next(new ApiError("User not found.", 400));

  if (!existingUser.isVerified) {
    return next(
      new ApiError("Please verify your email before resetting password.", 403)
    );
  }
  const otp = generateOTP();
  await sendPasswordResetOTPOnMail(email, {
    fullName: existingUser.fullName,
    otp,
  });
  await OTP.findOneAndReplace(
    { email, type: "FORGOT_PASSWORD" },
    { otp, email, type: "FORGOT_PASSWORD" },
    { upsert: true, new: true } // upsert: Creates a new document if no match is found., new: returns updated doc
  );
  return res.status(200).json({
    success: true,
    message: "OTP sent for password reset to your email.",
  });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, newPassword, confirmNewPassword } = req.body;
  if (!email || !newPassword || !confirmNewPassword) {
    return next(new ApiError("All fields are required", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(new ApiError("Passwords do not match", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ApiError("User not found!", 401));
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password reset successfully." });
});

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp, type } = req?.body;
  if (!email || !otp || !type) {
    return next(new ApiError("Email , Otp, and type are required!", 400));
  }
  const otpDoc = await OTP.findOne({ email, otp, type });
  if (!otpDoc) return next(new ApiError("OTP is expired", 400));

  let action;
  let message;

  if (type === "REGISTER") {
    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );
    if (!user) return next(new ApiError("User not found", 400));
    message = "OTP verified. User registered successfully.";
    action = "LOGIN";
  } else if (type === "FORGOT_PASSWORD") {
    const user = await User.findOne({ email });
    if (!user) return next(new ApiError("User not found", 400));
    message = "OTP verified. You can now reset your password.";
    action = "RESET_PASSWORD";
  } else {
    return next(new ApiError("Invalid OTP type", 400));
  }

  // OTP is verified — remove it
  await OTP.deleteOne({ email, otp, type });

  res.status(200).json({
    success: true,
    message,
    action,
  });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const clientRefreshToken = req.cookies.refresh_token;
  if (!clientRefreshToken) {
    return next(new ApiError("Session expired. Please log in again", 403)); // Expired or Invalid Refresh Token. force the user to log out in front end and login again
  }

  try {
    const decoded = jwt.verify(
      clientRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id);
    if (!user || clientRefreshToken !== user.refreshToken) {
      // Token mismatch or user not found, clear the cookies
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");
      return next(new ApiError("Refresh token is expired", 401));
    }

    const access_token = user.generateAccessToken();
    const refresh_token = user.generateRefreshToken(); // User will be logged in for longer time. will logout only when it logged out.

    user.refreshToken = refresh_token;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .cookie("access_token", access_token, {
        ...COOKIE_OPTIONS,
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      })
      .cookie("refresh_token", refresh_token, {
        ...COOKIE_OPTIONS,
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      })
      .json({ success: true, message: "Tokens refreshed successfully" });
  } catch (error) {
    // Catch JWT verification error and clear cookies
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    return next(new ApiErrorResponse("Invalid refresh token", 401));
  }
});

export const googleAuth = asyncHandler(async (req, res, next) => {
  const state = generateState(); // Save to DB/session if you plan to validate
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);
  res.cookie("google_oauth_state", state, {
    ...COOKIE_OPTIONS,
    maxAge: OAUTH_EXCHANGE_EXPIRY, // 15min
  });
  res.cookie("google_code_verifier", codeVerifier, {
    ...COOKIE_OPTIONS,
    maxAge: OAUTH_EXCHANGE_EXPIRY, //15min
  });

  res.redirect(url.toString());
});

export const googleAuthCallback = asyncHandler(async (req, res, next) => {
  console.log("inside googleAuthCallback");
  const { code, state } = req.query;
  console.log("query", req.query);
  const { google_oauth_state, google_code_verifier } = req.cookies;
  console.log("cookies", req.cookies);

  // const google_oauth_state = "efbjsSbla1adhK2NEFfx-Bz5NvEpRzKdF3OckcY73XM";
  // const google_code_verifier = "E3LZiuhMDFmRbyS3AXPhRy2mixuC36K1V-qCCdnsQEQ";
  if (
    !code ||
    !state ||
    !google_oauth_state ||
    !google_code_verifier ||
    state !== google_oauth_state
  ) {
    return next(
      new ApiError(
        "Couldn't login with Google because with invalid login attempt. Please try agian!",
        400
      )
    );
    // return res.redirect("/login");
  }

  let tokens;

  try {
    tokens = await google.validateAuthorizationCode(code, google_code_verifier);
    console.log("Tokens received:", tokens);
  } catch (error) {
    console.error("Error getting tokens:", error);
    return next(
      new ApiError("Failed to get tokens from Google. Please try again.", 500)
    );
    // /login
  }

  const claims = decodeIdToken(tokens.data.id_token);
  console.log("Decoded claims:", claims);
  const { sub: googleUserId, name, email, email_verified } = claims;

  // 1. User already exists wiht googleId
  // 2. If user does not exist, create a new user with googleId
  // 3. user already exists with email, but google auth is not linked

  let user = await User.findOne({
    oauthAccounts: {
      $elemMatch: { provider: "GOOGLE", oauthSub: googleUserId },
    },
  });
  if (!user) {
    console.log("User not found with Google ID:");
    // User not found with Google ID
    //If no user with googleUserId, find user by email to link Google account
    user = await User.findOne({ email });
    if (user) {
      // Check if Google account is already linked
      const hasGoogle = user.oauthAccounts.some(
        (acc) => acc.provider === "GOOGLE" && acc.oauthSub === googleUserId
      );
      if (!hasGoogle) {
        // Link Google OAuth account
        user.oauthAccounts.push({ provider: "GOOGLE", oauthSub: googleUserId });
        await user.save();
      }
    } else {
      // user is not register and try to login with google
      user = await User.create({
        fullName: name || "Google User", // Default name if not provided
        email,
        oauthAccounts: [{ provider: "GOOGLE", oauthSub: googleUserId }],
        isVerified: email_verified,
      });
    }
  }

  const access_token = user.generateAccessToken();
  const refresh_token = user.generateRefreshToken();

  res
    .cookie("access_token", access_token, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_EXPIRY, // 1 day
    })
    .cookie("refresh_token", refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_EXPIRY, // 15 days
    });

  res.clearCookie("google_oauth_state", { ...COOKIE_OPTIONS, maxAge: 0 });
  res.clearCookie("google_code_verifier", { ...COOKIE_OPTIONS, maxAge: 0 });
  // res.status(200).json({
  //   success: true,
  //   message: "Google authentication successful.",
  //   user, // Return the user object if needed
  // });
  res.redirect(`${FRONTEND_URL}/profile`);
});
