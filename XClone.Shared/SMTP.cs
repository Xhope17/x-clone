using System.Net;
using System.Net.Mail;

namespace XClone.Shared
{
    public class SMTP(string host, string from, int port, string user, string password)
    {
        public async Task Send(string to, string subject, string body)
        {
            var smtpClient = new SmtpClient
            {
                Host = host,
                Credentials = new NetworkCredential(user, password),
                Port = port,
                EnableSsl = true
            };

            var message = new MailMessage(from, to, subject, body)
            {
                IsBodyHtml = true
            };

            //await smtpClient.SendMailAsync(message);
            smtpClient.Send(message);
        }
    }
}
