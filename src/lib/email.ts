import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("Missing SENDGRID_API_KEY");
  }

  const from = process.env.EMAIL_FROM!;
  if (!from) throw new Error("Missing EMAIL_FROM");

  await sgMail.send({
    to,
    from,
    subject,
    html,
  });
}
