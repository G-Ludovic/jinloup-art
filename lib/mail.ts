import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT ?? 465);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, // true pour 465 (SSL), false pour 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Confirmez votre inscription sur Jinloup.Art",
    text: `Bonjour ${name},\n\nBienvenue sur Jinloup.Art ! Cliquez sur ce lien pour confirmer votre adresse email (valable 1 heure) :\n${url}\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez cet email.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 32px; border-radius: 12px; max-width: 520px; margin: 0 auto;">
        <h1 style="color: #fbbf24; margin-top: 0;">Jinloup.Art</h1>
        <p>Bonjour <strong>${name}</strong>,</p>
        <p>Merci pour votre inscription ! Pour activer votre compte et rejoindre la galerie et le forum, confirmez votre adresse email en cliquant ci-dessous :</p>
        <p style="margin: 28px 0;">
          <a href="${url}" style="background-color: #f59e0b; color: #09090b; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
            Confirmer mon adresse email
          </a>
        </p>
        <p style="font-size: 12px; color: #a1a1aa;">
          Ce lien est valable pendant 1 heure.<br />
          Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />
          <span style="color: #fbbf24; word-break: break-all;">${url}</span>
        </p>
      </div>
    `,
  });
}

export async function sendResetPasswordEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Réinitialisation de votre mot de passe — Jinloup.Art",
    text: `Bonjour ${name},\n\nVous avez demandé à réinitialiser votre mot de passe sur Jinloup.Art. Cliquez sur ce lien (valable 1 heure) :\n${url}\n\nSi vous n'avez rien demandé, ignorez simplement cet email.`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 32px; border-radius: 12px; max-width: 520px; margin: 0 auto;">
        <h1 style="color: #fbbf24; margin-top: 0;">Jinloup.Art</h1>
        <p>Bonjour <strong>${name}</strong>,</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau :</p>
        <p style="margin: 28px 0;">
          <a href="${url}" style="background-color: #f59e0b; color: #09090b; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p style="font-size: 12px; color: #a1a1aa;">
          Ce lien expire dans 1 heure. Si vous n&apos;êtes pas à l&apos;origine de cette demande, ignorez simplement cet email.<br /><br />
          <span style="color: #fbbf24; word-break: break-all;">${url}</span>
        </p>
      </div>
    `,
  });
}
