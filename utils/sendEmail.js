const nodemailer = require('nodemailer');

const sendEmail = async (email, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    to: email,
    subject: 'Réinitialisation de votre mot de passe - Safoua Academy',
    html: `
      <h2>Réinitialisation du mot de passe</h2>
      <p>Vous avez demandé une réinitialisation de mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe (valide 15 minutes) :</p>
      <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Réinitialiser le mot de passe
      </a>
      <p>Ou copiez ce lien : ${resetUrl}</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
