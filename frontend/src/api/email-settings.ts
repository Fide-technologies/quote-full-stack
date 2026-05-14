export interface IEmailSettings {
  adminEmailEnabled: boolean;
  adminEmail: string;
  customerEmailEnabled: boolean;
  smtpEnabled: boolean;
  smtpProvider: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpFrom: string;
  smtpUser: string;
  smtpPass: string;
}

export async function getEmailSettings(): Promise<IEmailSettings> {
  const res = await fetch('/api/email-settings');
  if (!res.ok) throw new Error('Failed to load email settings');
  const json = await res.json();
  return json.data;
}

export async function updateEmailSettings(settings: Partial<IEmailSettings>) {
  const res = await fetch('/api/email-settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!res.ok) throw new Error('Failed to update email settings');
  return res.json();
}

export async function testSmtpConnection(
  settings: Partial<IEmailSettings>,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/email-settings/test-smtp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  const json = await res.json();
  return json;
}

export async function getSmtpProviders(): Promise<
  Array<{ label: string; value: string; host: string; port: number; secure: boolean }>
> {
  const res = await fetch('/api/email-settings/smtp-providers');
  if (!res.ok) throw new Error('Failed to load SMTP providers');
  const json = await res.json();
  return json.data;
}
