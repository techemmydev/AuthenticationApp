import Jwt from "jsonwebtoken";

// Function to generate a JWT token and set it as a cookie in the response
export const generateTokenAndSetCookies = (res, userId) => {
  // Step 1: Generate a JWT token
  // Using the `Jwt.sign()` method to create a token with the user's ID (payload).
  // The token is signed using the secret key stored in `process.env.JWT_SECRET`.
  // The token is set to expire in 7 days ("7d").
  const token = Jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d", // The token will expire in 7 days.
  });

  // Step 2: Set the generated JWT token as a cookie in the response
  // `res.cookie()` is used to set the cookie in the HTTP response.
  // - "token" is the name of the cookie.
  // - The token is the value stored in the cookie.
  res.cookie("token", token, {
    httpOnly: true, // This ensures that the cookie is accessible only by the server (not client-side JS).
    secure: process.env.NODE_ENV === "production", // The `secure` flag ensures cookies are sent only over HTTPS when in production.
    sameSite: "strict", // `sameSite: "strict"` prevents the cookie from being sent along with cross-site requests, enhancing security.
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time is set to 7 days (in milliseconds).
  });

  // Step 3: Return the generated token
  // Returning the token in case it's needed elsewhere in the application.
  return token;
};
