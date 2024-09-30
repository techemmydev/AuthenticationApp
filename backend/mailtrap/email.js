import { MailTrapclient, sender } from "./mailtrap.config.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";

// Function to send a verification email
export const sendverificationEmail = async (email, verificationToken) => {
  // Step 1: Define the recipient(s) of the email
  // The recipient is specified as an array of objects, where each object contains an `email` field.
  const recipent = [{ email }];

  try {
    // Step 2: Send the email using the Mailtrap client
    // Using the MailTrapclient's `send()` method to send an email to the specified recipient.
    // - `from`: The sender's information.
    // - `to`: The recipient's email address (array of objects with `email`).
    // - `subject`: The subject of the email.
    // - `html`: The email body, where the placeholder `{verificationCode}` in the email template is replaced with the actual verification token.
    // - `category`: Used to categorize the email for tracking purposes.
    const response = await MailTrapclient.send({
      from: sender, // Sender details imported from config
      to: recipent, // Array with the recipient's email
      subject: "Verify your email", // Subject of the email
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken // Replacing placeholder with actual verification token
      ),
      category: "Email Verification", // Tagging the email for organizational purposes
    });

    // Step 3: Log success message to the console
    console.log("Email sent successfully", response); // If email is sent successfully, log the response
  } catch (error) {
    // Step 4: Handle errors during email sending
    // If an error occurs while sending the email, log the error and throw a new one.
    console.error(`Error sending verification email`, error);
    throw new Error(`Error sending verification email ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipent = [{ email }];
  try {
    const respone = await MailTrapclient.send({
      from: sender,
      to: recipent,
      template_uuid: "d9e181e2-13cd-4dee-9e5c-d286c03876d4",
      template_variables: {
        company_info_name: " Emmy Dev Company",
        name: name,
      },
    });
    console.log(" Welcome Email sent Successfully", respone);
  } catch (error) {
    console.error("Error sending welcome email", error);
    throw new Error(`Error sending welcome email:,${error}`);
  }
};

export const sendpasswordResetEmail = async (email, resetURL) => {
  const recipent = [{ email }];
  try {
    const respone = await MailTrapclient.send({
      from: sender,
      to: recipent,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "password Reset",
    });
    console.log("password reset email sucessfully", respone);
  } catch (error) {
    console.error("Errror sending password reset email", error);
    throw new Error(`Error sending welcome email:,${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipent = [{ email }];
  try {
    const respone = await MailTrapclient.send({
      from: sender,
      to: recipent,
      subject: "password Reset was successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "password Reset",
    });
    console.log("password reset email sent successfully", respone);
  } catch (error) {
    console.log("Error sending password reset success email", error);
    throw new Error("Error sending password reset success email", error);
  }
};
