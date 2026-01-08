
interface TemplateData {
  title: string;
  greeting: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
  altLinkMessage: string;
  expiryMessage: string;
  ignoreMessage: string;
  copyright: string;
}

export const getEmailTemplate = (data: TemplateData) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #000000;
          color: #e5e7eb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #111827;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
          border: 1px solid #374151;
        }
        .header {
          background-color: #000000;
          padding: 30px 20px;
          text-align: center;
          border-bottom: 1px solid #374151;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #10b981; /* Green-500 */
          text-decoration: none;
        }
        .content {
          padding: 40px 30px;
          text-align: left;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 20px;
        }
        .text {
          font-size: 16px;
          line-height: 1.6;
          color: #d1d5db; /* Gray-300 */
          margin-bottom: 24px;
        }
        .button-container {
          text-align: center;
          margin: 32px 0;
        }
        .button {
          display: inline-block;
          background-color: #10b981; /* Green-500 */
          color: #ffffff;
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 8px;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #059669; /* Green-600 */
        }
        .link-text {
          font-size: 14px;
          color: #9ca3af; /* Gray-400 */
          word-break: break-all;
          margin-top: 8px;
        }
        .link-url {
          color: #34d399; /* Green-400 */
          text-decoration: none;
        }
        .footer {
          background-color: #000000;
          padding: 24px;
          text-align: center;
          border-top: 1px solid #374151;
          font-size: 12px;
          color: #6b7280; /* Gray-500 */
        }
      </style>
    </head>
    <body>
      <div style="padding: 40px 20px;">
        <div class="container">
          <div class="header">
            <a href="#" class="logo">FezLink</a>
          </div>
          <div class="content">
            <h1 class="title">${data.title}</h1>
            <p class="text">${data.greeting},</p>
            <p class="text">${data.message}</p>
            
            <div class="button-container">
              <a href="${data.buttonUrl}" class="button">${data.buttonText}</a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #374151;">
              <p class="text" style="font-size: 14px; margin-bottom: 10px;">${data.altLinkMessage}</p>
              <p class="link-text">
                <a href="${data.buttonUrl}" class="link-url">${data.buttonUrl}</a>
              </p>
              <p class="text" style="font-size: 14px; margin-top: 20px; color: #9ca3af;">
                ${data.expiryMessage}
              </p>
              <p class="text" style="font-size: 14px; color: #6b7280;">
                ${data.ignoreMessage}
              </p>
            </div>
          </div>
          <div class="footer">
            <p>${data.copyright}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
