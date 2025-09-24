import nodemailer from 'nodemailer';
import 'dotenv/config';

// Configura o "transportador" de email usando as credenciais do .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // Use 'true' para a porta 465, pois é uma conexão SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


// Função que vamos usar para enviar o email do formulário de contato
export async function sendContactEmail({ nome, email, mensagem }) {
  const mailOptions = {
    from: `"${nome}" <${email}>`, // Remetente
    to: '075railan@gmail.com', // Destinatário
    subject: `Nova mensagem de contato de ${nome}`,
    text: mensagem, // Corpo do email em texto puro
    html: `<p><b>De:</b> ${nome} (${email})</p><p><b>Mensagem:</b></p><p>${mensagem}</p>`, // Corpo em HTML
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