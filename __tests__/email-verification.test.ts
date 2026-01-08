import { sendVerificationEmail } from '@/lib/email';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Mock dependencies
jest.mock('nodemailer');
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Email Verification System', () => {
  describe('Token Logic', () => {
    it('should generate a token and validate it via hash correctly', () => {
      // Generation logic
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      // Validation logic
      const inputToken = rawToken;
      const computedHash = crypto.createHash('sha256').update(inputToken).digest('hex');

      expect(computedHash).toBe(hashedToken);
    });

    it('should fail validation if token is different', () => {
      const rawToken = 'token1';
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      const inputToken = 'token2';
      const computedHash = crypto.createHash('sha256').update(inputToken).digest('hex');

      expect(computedHash).not.toBe(hashedToken);
    });
  });

  describe('Email Service', () => {
    const mockSendMail = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    beforeEach(() => {
      jest.clearAllMocks();
      process.env.NEXT_PUBLIC_APP_URL = 'http://test.com';
    });

    it('should send verification email with correct link', async () => {
      const email = 'test@example.com';
      const token = '123456';

      await sendVerificationEmail(email, token, 'testuser');

      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: email,
        subject: 'Verifica tu cuenta - URLShortener',
        html: expect.stringContaining('http://test.com/verify?token=123456'),
      }));
    });
  });
});
