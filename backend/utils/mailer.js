import nodemailer from "nodemailer";

export const mailer = (email) => {
    // Generate a random OTP.
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send the OTP to the user's email address.

    // Create a transporter object.
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
    });

    // Create an email object.
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "OTP for admin login",

        // Add HTML content if needed.
        html: `
            <div style="text-align: center;">
            <p>This is a one time OTP for admin login.</p>
            <p>It will expire immediately after login.</p>
            <p>Your OTP is <strong style="color: white; background-color: blue; width: 50px;">${otp}</strong>.</p>
            </div>
        `,
    };

    // Send the email.
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(`OTP sent to ${email}`);
        }
    });

    return otp;
};