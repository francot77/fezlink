/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import { logger } from './logger';
import { getEmailTemplate } from './email-template';
import enCommon from '@/locales/en/common.json';
import esCommon from '@/locales/es/common.json';

// Helper to get translations based on language
const getTranslations = (lang: string = 'es') => {
  return lang === 'en' ? enCommon : esCommon;
};

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

/**
 * Send an email using Brevo SMTP
 */
export const sendEmail = async (options: EmailOptions) => {
  const { to, subject, html } = options;

  try {
    const fromAddress = process.env.EMAIL_FROM || `"FezLink" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });

    logger.info('Email sent successfully', { messageId: info.messageId, to });
    return info;
  } catch (error: any) {
    // Log full error details
    logger.error('Error sending email', {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack,
      to
    });
    throw error;
  }
};

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (
  to: string,
  token: string,
  username: string,
  language: 'es' | 'en' = 'es'
) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://fezlink.com';
  const verificationUrl = `${appUrl}/verify?token=${token}`;

  const t = getTranslations(language);
  // @ts-expect-error - access dynamic property
  const tEmail = t.email?.verification || t.common?.email?.verification; // Fallback structure check

  if (!tEmail) {
    logger.error('Translation missing for email.verification', { language });
    // Fallback hardcoded in case of error
    return sendEmail({
      to,
      subject: 'Verify your account',
      html: `<a href="${verificationUrl}">Verify Email</a>`
    });
  }

  const html = getEmailTemplate({
    title: tEmail.title,
    greeting: tEmail.greeting.replace('{name}', username),
    message: tEmail.message,
    buttonText: tEmail.button,
    buttonUrl: verificationUrl,
    altLinkMessage: tEmail.altLinkMessage,
    expiryMessage: tEmail.expiryMessage,
    ignoreMessage: tEmail.ignoreMessage,
    copyright: tEmail.copyright.replace('{year}', new Date().getFullYear().toString()),
  });

  return sendEmail({
    to,
    subject: tEmail.subject,
    html,
  });
};
