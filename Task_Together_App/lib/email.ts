import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"${process.env.SMTP_USERNAME}" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      text,
      html,
    })

    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

