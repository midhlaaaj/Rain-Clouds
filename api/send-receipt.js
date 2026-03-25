
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, amount } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const dashboardUrl = `${req.headers.origin || 'https://rain-clouds.vercel.app'}/dashboard`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Rain Clouds', email: 'no-reply@rainclouds.online' }, // This should be your verified Brevo sender
        to: [{ email }],
        subject: 'Thank you for purchasing Rain Clouds!',
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h1 style="color: #4a90d9; font-size: 24px; margin-bottom: 20px;">Thank you for your purchase!</h1>
            <p style="font-size: 16px; line-height: 1.5;"> We are delighted that you chose to read <strong>Rain Clouds (മഴമേഘങ്ങളെ പ്രണയിച്ചവൾ)</strong>. Your payment of ₹${amount} was successful.</p>
            <p style="font-size: 16px; line-height: 1.5;">You can now access your ebook and start reading directly from your dashboard.</p>
            <div style="margin: 30px 0;">
              <a href="${dashboardUrl}" style="background-color: #4a90d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            <p style="font-size: 14px; color: #777;">If the button above doesn't work, copy and paste this link into your browser:<br>
            <a href="${dashboardUrl}" style="color: #4a90d9;">${dashboardUrl}</a></p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999;">© 2025 Rain Clouds. All rights reserved.</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email');
    }

    return res.status(200).json({ success: true, messageId: data.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: error.message });
  }
}
