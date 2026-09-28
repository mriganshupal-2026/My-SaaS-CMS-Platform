import { Resend } from 'resend';
import { dbQueries } from './db';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmailViaResend(params: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string; simulated: boolean }> {
  const settings = dbQueries.getSettings();
  const apiKey = process.env.RESEND_API_KEY || settings.resendApiKey;
  const defaultSender = process.env.RESEND_FROM_EMAIL || settings.emailSender || 'ViralMuse <onboarding@resend.dev>';

  if (!apiKey || !apiKey.trim()) {
    console.log('[Resend Email] API key not configured. Email simulated:', {
      to: params.to,
      subject: params.subject,
    });
    return {
      success: true,
      simulated: true,
      id: `sim_${Date.now()}`,
    };
  }

  try {
    const resend = new Resend(apiKey.trim());
    const response = await resend.emails.send({
      from: params.from || defaultSender,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (response.error) {
      console.error('[Resend Error]:', response.error);
      return {
        success: false,
        error: response.error.message,
        simulated: false,
      };
    }

    return {
      success: true,
      id: response.data?.id,
      simulated: false,
    };
  } catch (err: any) {
    console.error('[Resend Exception]:', err);
    return {
      success: false,
      error: err.message || 'Failed to send email via Resend',
      simulated: false,
    };
  }
}
