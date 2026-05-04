# My Cami classroom

My Cami classroom ist ein ehrenamtlich verwaltetes Open-Source-Projekt für Lern- und Kursverwaltung.

Das Monorepo nutzt React, TypeScript und Tailwind im Frontend sowie Spring Boot, JWT-Auth, REST-API und MySQL im Backend.
Die Datenbankstruktur wird mit Flyway-Migrationen unter `apps/api/src/main/resources/db/migration` versioniert.

## Open Source

- Lizenz: MIT
- Beiträge sind willkommen
- Entscheidungen und Änderungen sollen nachvollziehbar bleiben
- Der geschützte Verwaltungsbereich bleibt per JWT abgesichert

## Struktur

```text
apps/
  api/   Spring Boot REST API
  web/   React + TypeScript + Tailwind
docker-compose.yml
package.json
```

## Start

1. MySQL starten:

```bash
docker compose up -d mysql
```

Die MySQL-Daten werden projektlokal unter `.docker/mysql` gespeichert, damit sie auf dem `E:`-Laufwerk bleiben.

2. Backend starten:

```bash
yarn api:dev
```

3. Frontend starten:

```bash
yarn dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html

Frontend-Routen:

- `/` öffentlicher Bereich
- `/login` Login und Registrierung
- `/app` geschützter Verwaltungsbereich

## Google Login

Für Google Registrierung und Login brauchst du eine OAuth Client-ID aus der Google Cloud Console.

Backend:

Für die lokale Entwicklung ist die Client-ID bereits in `application.yml` als Development-Default gesetzt. In Produktion solltest du sie trotzdem als Umgebungsvariable setzen:

```bash
GOOGLE_CLIENT_ID=502571807799-4vn2lsldle120j68t700or8nlk2m5plb.apps.googleusercontent.com
```

Frontend:

Die lokale Datei `apps/web/.env.local` enthält bereits:

```bash
VITE_GOOGLE_CLIENT_ID=502571807799-4vn2lsldle120j68t700or8nlk2m5plb.apps.googleusercontent.com
```

Ohne diese Werte bleibt der Google-Button deaktiviert. Nach erfolgreicher Google-Prüfung erstellt das Backend bei Bedarf einen lokalen Account und gibt wie beim normalen Login ein eigenes JWT zurück.

## E-Mail-Bestätigung und Passwort-Reset

Neue Registrierungen per E-Mail/Passwort müssen ihre E-Mail-Adresse bestätigen, bevor sie sich anmelden können. Die Links werden an diese Frontend-Routen geschickt:

- `/verify-email?token=...`
- `/reset-password?token=...`

Ohne SMTP-Konfiguration schreibt das Backend die E-Mail-Inhalte in das Log. Für echten Versand setze:

```bash
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=dein-user
MAIL_PASSWORD=dein-passwort
MAIL_FROM=no-reply@example.com
FRONTEND_BASE_URL=http://localhost:3000
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/health`
- `GET /v3/api-docs`

Die geschützten Routen erwarten `Authorization: Bearer <token>`.

Accounts haben neben der eindeutigen E-Mail einen stabilen `accountHash`. Dadurch dürfen Anzeigenamen doppelt vorkommen, ohne dass sie als technische Kennung verwendet werden.

Beim Start legt das Backend einen Admin an, falls noch kein Account mit Rolle `ADMIN` existiert:

- E-Mail: `admin@ezber.local`
- Passwort: `Admin123456!`

Die Werte können über `ADMIN_EMAIL`, `ADMIN_PASSWORD` und `ADMIN_NAME` überschrieben werden.

## Mitmachen

Lies [CONTRIBUTING.md](CONTRIBUTING.md), bevor du größere Änderungen vorbereitest.
