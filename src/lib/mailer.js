import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


export async function sendContactEmail({ nome, email, mensagem }) {
  const mailOptions = {
    from: `"${nome}" <${email}>`,
    to: '075railan@gmail.com',
    subject: `Nova mensagem de contato de ${nome}`,
    text: mensagem,
    html: `<p><b>De:</b> ${nome} (${email})</p><p><b>Mensagem:</b></p><p>${mensagem}</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso! ID da mensagem:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erro ao enviar o email:', error);
    throw new Error('Falha ao enviar o email.');
  }
}