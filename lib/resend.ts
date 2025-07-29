import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const guideUrl = "https://<your-netlify-site>.netlify.app/OneAppGuide.pdf";

export async function sendWelcomeEmail(email: string, customerName: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: "One App <onboarding@resend.dev>",
            to: [email],
            subject: "🎉 Welcome to One App Per Day - Your Guide is Ready!",
            html: `
                <h1>Welcome, ${customerName}!</h1>
                <p>Thank you for your purchase. You can now access your guide using the link below:</p>
                <a href="${guideUrl}">Download Your Guide</a>
                <p>If you have any questions, feel free to reply to this email.</p>
            `,
        });

        if (error) {
            console.error("Error sending email:", error);
            throw new Error("Failed to send email");
        }

        console.log("Email sent successfully:", data);
        return data;
    } catch (error) {
        console.error("An unexpected error occurred while sending the email:", error);
        throw error;
    }
}
