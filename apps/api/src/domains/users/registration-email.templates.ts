import type { User } from "./users.schema";

type EmailTemplate = { subject: string; html: string; text: string };

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
  return value.replace(/[&<>'"]/g, (character) => entities[character] ?? character);
}

function emailShell(content: string, footer: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;background-color:#e9eef3"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#e9eef3" style="padding-top:32px;padding-right:18px;padding-bottom:32px;padding-left:18px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px"><tr><td bgcolor="#ffffff" style="border:1px solid #d6dde6;border-radius:14px;overflow:hidden">${content}</td></tr><tr><td style="padding-top:16px;padding-left:4px"><p style="margin:0;color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;text-align:center">${footer}</p></td></tr></table></td></tr></table></body></html>`;
}

export function pendingRegistrationAdminEmail(user: User, registrationsUrl: string): EmailTemplate {
  const name = escapeHtml(user.name);
  const email = escapeHtml(user.email);
  const content = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#254e70" style="padding-top:24px;padding-right:28px;padding-bottom:24px;padding-left:28px"><p style="margin:0 0 10px 0;color:#aef3e7;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase">Approval queue</p><h1 style="margin:0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:31px;font-weight:700">New registration pending review.</h1></td></tr><tr><td style="padding-top:28px;padding-right:28px;padding-bottom:28px;padding-left:28px"><p style="margin:0 0 20px 0;color:#254e70;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px">A new registration has entered the approval queue. Review the details and approve it when everything looks right.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#f5f7fa" style="padding-top:18px;padding-right:18px;padding-bottom:18px;padding-left:18px;border:1px solid #d6dde6;border-radius:10px"><p style="margin:0 0 6px 0;color:#254e70;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;font-weight:700">${name}</p><p style="margin:0;color:#64748b;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px">${email}</p></td></tr></table><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td height="24" style="height:24px;font-size:1px;line-height:1px">&nbsp;</td></tr><tr><td bgcolor="#254e70" style="padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;border-radius:6px"><a href="${registrationsUrl}" style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:600;text-decoration:none">Review registration</a></td></tr></table></td></tr></table>`;

  return {
    subject: `New registration pending review — ${user.name}`,
    text: `A new registration is waiting for review.\n\nName: ${user.name}\nEmail: ${user.email}\n\nReview registration: ${registrationsUrl}`,
    html: emailShell(content, "NewJobTracker · Automated notification for administrators"),
  };
}

export function registrationApprovedUserEmail(user: User, appUrl: string): EmailTemplate {
  const name = escapeHtml(user.name);
  const content = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-top:28px;padding-right:28px;padding-bottom:8px;padding-left:28px;text-align:center"><span style="display:inline-block;padding-top:7px;padding-right:10px;padding-bottom:7px;padding-left:10px;background-color:#e0f5f2;border-radius:999px;color:#254e70;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;font-weight:700;letter-spacing:.8px;text-transform:uppercase">Account approved</span><h1 style="margin:20px 0 0 0;color:#254e70;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:34px;font-weight:700">You’re ready to get started.</h1></td></tr><tr><td style="padding-top:20px;padding-right:28px;padding-bottom:30px;padding-left:28px;text-align:center"><p style="margin:0;color:#254e70;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px">Hi, ${name}. Your access to NewJobTracker is ready. Sign in and keep every opportunity moving.</p><table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td height="24" style="height:24px;font-size:1px;line-height:1px">&nbsp;</td></tr><tr><td bgcolor="#254e70" style="padding-top:12px;padding-right:16px;padding-bottom:12px;padding-left:16px;border-radius:6px"><a href="${appUrl}" style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:600;text-decoration:none">Open NewJobTracker</a></td></tr></table></td></tr></table>`;

  return {
    subject: "Your account is approved — NewJobTracker",
    text: `Hi, ${user.name}!\n\nYour account has been approved and is ready to use. Open NewJobTracker: ${appUrl}`,
    html: emailShell(content, "Your next career move, organized."),
  };
}
