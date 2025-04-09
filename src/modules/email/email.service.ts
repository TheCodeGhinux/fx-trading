import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly templatesDir: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? '',
      port: Number(process.env.SMTP_PORT ?? 465),
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
      secure: false,
      auth: {
        user: process.env.SMTP_USER ?? '',
        pass: process.env.SMTP_PASSWORD ?? '',
      },
    });

    this.templatesDir = join(__dirname, 'templates');
  }


  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
  ): Promise<{ messageId: string }> {
    try {
      const templatePath = join(this.templatesDir, `${template}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');

      const compiledTemplate = handlebars.compile(templateSource);

      const html = compiledTemplate(context);

      const info = await this.transporter.sendMail({
        from: `"No Reply" <${process.env.SMTP_FROM ?? ''}>`,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);

      return { messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}. Error: ${error}`);

      throw new Error(`Email sending failed: ${error.message}`);
    }
  }


  async sendOtpVerificationEmail(email: string, code: string, expiresAt: Date): Promise<{ messageId: string }> {
    const expiresInMinutes = Math.round((expiresAt.getTime() - Date.now()) / 60000);

    return this.sendMail(
      email,
      'Your Verification Code',
      'otp-verification',
      {
        code,
        expiresInMinutes,
        email,
        year: new Date().getFullYear(),
        appName: process.env.APP_NAME || 'Our App'
      }
    );
  }
}