package com.ezber.api.auth;

import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.mail.MailProperties;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class AuthMailService {
    private static final Logger log = LoggerFactory.getLogger(AuthMailService.class);

    private final JavaMailSender mailSender;
    private final MailProperties mailProperties;
    private final String from;
    private final String senderName;
    private final String imprintName;
    private final String imprintAddress;
    private final String imprintEmail;
    private final String imprintUrl;

    public AuthMailService(
        JavaMailSender mailSender,
        MailProperties mailProperties,
        @Value("${app.mail.from}") String from,
        @Value("${app.mail.sender-name}") String senderName,
        @Value("${app.mail.imprint.name}") String imprintName,
        @Value("${app.mail.imprint.address}") String imprintAddress,
        @Value("${app.mail.imprint.email}") String imprintEmail,
        @Value("${app.mail.imprint.url}") String imprintUrl
    ) {
        this.mailSender = mailSender;
        this.mailProperties = mailProperties;
        this.from = from;
        this.senderName = senderName;
        this.imprintName = imprintName;
        this.imprintAddress = imprintAddress;
        this.imprintEmail = imprintEmail;
        this.imprintUrl = imprintUrl;
    }

    public void sendEmailVerification(String to, String name, String link) {
        send(
            to,
            "E-Mail-Adresse bestätigen",
            "E-Mail bestätigen",
            "Bestätige deine E-Mail-Adresse",
            "Hallo " + name + ", bitte bestätige deine E-Mail-Adresse, damit du My Ezber App nutzen kannst.",
            "E-Mail bestätigen",
            link,
            "Wenn du dieses Konto nicht erstellt hast, kannst du diese E-Mail ignorieren."
        );
    }

    public void sendPasswordReset(String to, String name, String link) {
        send(
            to,
            "Passwort zurücksetzen",
            "Passwort zurücksetzen",
            "Setze dein Passwort zurück",
            "Hallo " + name + ", wir haben eine Anfrage erhalten, dein Passwort zurückzusetzen.",
            "Passwort zurücksetzen",
            link,
            "Der Link ist zeitlich begrenzt. Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren."
        );
    }

    private void send(
        String to,
        String subject,
        String preheader,
        String headline,
        String intro,
        String buttonLabel,
        String link,
        String securityNote
    ) {
        var text = plainText(headline, intro, buttonLabel, link, securityNote);
        var html = html(preheader, headline, intro, buttonLabel, link, securityNote);

        if (mailProperties.getHost() == null || mailProperties.getHost().isBlank()) {
            log.info("Mail delivery is not configured. To: {}, Subject: {}, Body:\n{}", to, subject, text);
            return;
        }

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from, senderName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, html);
            mailSender.send(message);
        } catch (MailException | MessagingException exception) {
            log.warn("Mail delivery failed for {}", to, exception);
        } catch (java.io.UnsupportedEncodingException exception) {
            log.warn("Mail sender name could not be encoded", exception);
        }
    }

    private String plainText(String headline, String intro, String buttonLabel, String link, String securityNote) {
        return headline + "\n\n"
            + intro + "\n\n"
            + buttonLabel + ": " + link + "\n\n"
            + securityNote + "\n\n"
            + "Impressum\n"
            + imprintName + "\n"
            + imprintAddress + "\n"
            + imprintEmail + "\n"
            + imprintUrl + "\n";
    }

    private String html(String preheader, String headline, String intro, String buttonLabel, String link, String securityNote) {
        return """
            <!doctype html>
            <html lang="de">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>My Ezber App</title>
              </head>
              <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif;">
                <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">%s</span>
                <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 12px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                        <tr>
                          <td style="background:#0f172a;padding:24px 28px;color:#ffffff;">
                            <div style="font-size:20px;font-weight:700;">My Ezber App</div>
                            <div style="margin-top:6px;color:#a7f3d0;font-size:14px;">Open Source Lernverwaltung</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:28px;">
                            <h1 style="margin:0 0 14px;font-size:24px;line-height:1.3;color:#0f172a;">%s</h1>
                            <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">%s</p>
                            <p style="margin:0 0 24px;">
                              <a href="%s" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 18px;border-radius:6px;">%s</a>
                            </p>
                            <p style="margin:0 0 18px;font-size:13px;line-height:1.7;color:#64748b;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br><a href="%s" style="color:#047857;word-break:break-all;">%s</a></p>
                            <div style="border-top:1px solid #e2e8f0;margin-top:24px;padding-top:18px;">
                              <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">%s</p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="background:#f1f5f9;padding:20px 28px;color:#64748b;font-size:12px;line-height:1.7;">
                            <strong style="color:#334155;">Impressum</strong><br>
                            %s<br>
                            %s<br>
                            <a href="mailto:%s" style="color:#047857;">%s</a><br>
                            <a href="%s" style="color:#047857;">%s</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
            """.formatted(
            escape(preheader),
            escape(headline),
            escape(intro),
            escapeAttribute(link),
            escape(buttonLabel),
            escapeAttribute(link),
            escape(link),
            escape(securityNote),
            escape(imprintName),
            escape(imprintAddress),
            escapeAttribute(imprintEmail),
            escape(imprintEmail),
            escapeAttribute(imprintUrl),
            escape(imprintUrl)
        );
    }

    private String escape(String value) {
        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;");
    }

    private String escapeAttribute(String value) {
        return escape(value).replace("'", "&#39;");
    }
}
