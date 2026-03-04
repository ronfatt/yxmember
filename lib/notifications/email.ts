type EmailInput = {
  to: string;
  subject: string;
  html: string;
};

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return null;
  }

  return { apiKey, from };
}

export async function sendEmail(input: EmailInput) {
  const config = getEmailConfig();
  if (!config) {
    return { ok: false as const, skipped: true as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: config.from,
      to: [input.to],
      subject: input.subject,
      html: input.html
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown email error");
    throw new Error(errorText);
  }

  return { ok: true as const, skipped: false as const };
}

export function renderProgramEmail({
  heading,
  intro,
  lines
}: {
  heading: string;
  intro: string;
  lines: string[];
}) {
  const details = lines.map((line) => `<li style="margin: 0 0 8px;">${line}</li>`).join("");

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f6f1e8; padding: 32px; color: #123524;">
      <div style="max-width: 640px; margin: 0 auto; background: white; border-radius: 24px; padding: 32px; border: 1px solid rgba(18,53,36,0.08);">
        <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(18,53,36,0.6);">
          元象能量会员系统
        </p>
        <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">${heading}</h1>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.8; color: rgba(18,53,36,0.8);">
          ${intro}
        </p>
        <ul style="padding-left: 18px; margin: 0 0 24px; font-size: 14px; line-height: 1.7; color: rgba(18,53,36,0.78);">
          ${details}
        </ul>
        <p style="margin: 0; font-size: 13px; line-height: 1.7; color: rgba(18,53,36,0.62);">
          为长期而设计的能量与回馈空间。
        </p>
      </div>
    </div>
  `;
}

export function renderProductEmail({
  heading,
  intro,
  lines
}: {
  heading: string;
  intro: string;
  lines: string[];
}) {
  const details = lines.map((line) => `<li style="margin: 0 0 8px;">${line}</li>`).join("");

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background: #f6f1e8; padding: 32px; color: #123524;">
      <div style="max-width: 640px; margin: 0 auto; background: white; border-radius: 24px; padding: 32px; border: 1px solid rgba(18,53,36,0.08);">
        <p style="margin: 0 0 12px; font-size: 12px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(18,53,36,0.6);">
          元象能量会员系统
        </p>
        <h1 style="margin: 0 0 16px; font-size: 28px; line-height: 1.2;">${heading}</h1>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.8; color: rgba(18,53,36,0.8);">
          ${intro}
        </p>
        <ul style="padding-left: 18px; margin: 0 0 24px; font-size: 14px; line-height: 1.7; color: rgba(18,53,36,0.78);">
          ${details}
        </ul>
        <p style="margin: 0; font-size: 13px; line-height: 1.7; color: rgba(18,53,36,0.62);">
          为长期而设计的能量与回馈空间。
        </p>
      </div>
    </div>
  `;
}
