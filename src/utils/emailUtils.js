import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//================================================

export const sendVerificationEmail = async (email, code, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Housely Support" <"no-reply@housely.com">`,
      to: email,
      subject: "Verify Your Housely Account",
      text: `Welcome to Housely! Your verification code is: ${code}. It will expire in 10 minutes.`,
      html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; max-width: 600px;">
    <div style="margin-bottom: 20px;">
        <div style="display: inline-block; vertical-align: middle; height: 100px; width: 100px; background: transparent;">
        <img src="cid:logo" alt="Housely" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="display: inline-block; vertical-align: middle; margin-left: 10px;">
            <h2 style="color: #333; margin: 0;">Welcome to Housely!</h2>
        </div>
    </div>

    <p style="color: #555;"> Hello ${name}, please use the following verification code:</p>
    
    <div style="font-size: 24px; font-weight: bold; padding: 15px; border: 1px solid #6941C6; background:transparent; border-radius: 10px; text-align: center; margin: 20px 0; color: #6941C6; letter-spacing: 2px;">
        ${code}
    </div>
    
    <p style="color: #777; font-size: 14px;">This code will expire in 10 minutes.</p>
    <p style="color: #777; font-size: 14px;">If you did not request this, please ignore this email.</p>
</div>
            `,
      attachments: [
        {
          filename: "icon.png",
          path: "/home/Eslam/backend projects/housely/src/assets/images/icon.png",
          cid: "logo", // same cid value as in the html img src
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending error:", error.message);
  }
};
