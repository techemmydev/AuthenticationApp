// Import the Mailtrap client to handle email sending
import { MailtrapClient } from "mailtrap";

// Import dotenv to load environment variables from a .env file
import dotenv from "dotenv";

// Load environment variables from the .env file
dotenv.config();

// Step 1: Initialize MailtrapClient with API token and endpoint
// The token and endpoint values are retrieved from environment variables
export const MailTrapclient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN, // Mailtrap API token, loaded from .env file
  endpoint: process.env.MAILTRAP_ENDPOINT, // Mailtrap API endpoint, loaded from .env file
});

// Step 2: Define the sender's email address and name
// This object contains information about the email sender (used in the "from" field)
export const sender = {
  email: "hello@demomailtrap.com", // Sender's email address
  name: "chukwuma Emmanuel Chidera", // Sender's name
};
