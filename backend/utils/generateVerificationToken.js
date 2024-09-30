// Function to generate a 6-digit verification token
export const generateVerificationToken = () => {
  // Step 1: Generate a random 6-digit number
  // `Math.random()` generates a random number between 0 and 1.
  // Multiplying by 900000 ensures the random number is in the range of 0 to 899999.
  // Adding 100000 ensures the final number is in the range of 100000 to 999999 (i.e., always a 6-digit number).
  // `Math.floor()` rounds the number down to the nearest whole number.
  const token = Math.floor(100000 + Math.random() * 900000);

  // Step 2: Convert the token to a string and return it
  // The `.toString()` method converts the number to a string, which is easier to handle as a token.
  return token.toString();
};
