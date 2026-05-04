# Contributing

Danke, dass du My Cami classroom verbessern möchtest.

## Grundsätze

- Das Projekt wird ehrenamtlich gepflegt.
- Beiträge sollen freundlich, nachvollziehbar und gut testbar sein.
- Kleine, fokussierte Pull Requests sind leichter zu prüfen.
- Sicherheitsrelevante Änderungen brauchen besondere Sorgfalt.

## Lokale Entwicklung

```bash
docker compose up -d mysql
yarn api:dev
yarn dev
```

## Vor einem Pull Request

```bash
yarn build
mvn "-Dmaven.repo.local=E:\Jobs\ezber_app\.m2\repository" -f apps/api/pom.xml test
```

## Stil

- Frontend: bestehende React/Tailwind-Struktur verwenden.
- Backend: Controller, Service, Repository und DTOs getrennt halten.
- Keine sensiblen Daten committen.
- Neue geschützte API-Endpunkte müssen mit JWT funktionieren.
