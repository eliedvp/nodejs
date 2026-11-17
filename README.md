# Scripts Node.js — premiers pas

Ensemble de petits scripts Node.js couvrant les bases du runtime : serveur HTTP natif, système de fichiers, utilisation de paquets npm et envoi d'email.
Checkpoint réalisé dans le cadre de la formation développeur Full Stack GoMyCode.

## Contenu

| Script                  | Commande           | Description |
|-------------------------|--------------------|-------------|
| `hello-world.js`        | `npm run hello`    | Serveur HTTP (module `http`) qui répond « Hello Node!!!! » sur `http://localhost:3000` |
| `file-ops.js`           | `npm run files`    | Crée `welcome.txt` puis lit `hello.txt` (module `fs`) ; affiche une erreur si `hello.txt` n'existe pas |
| `password-generator.js` | `npm run password` | Génère un mot de passe aléatoire de 12 caractères (paquet `generate-password`) |
| `email-sender.js`       | `npm run email`    | Envoie un email de test via le SMTP Gmail (paquet `nodemailer`) |

## Stack

- Node.js 20.6 ou plus récent (option `--env-file` utilisée pour charger `.env`)
- nodemailer, generate-password

## Installation

```bash
npm install
```

## Configuration de l'envoi d'email

Le script `email-sender.js` lit sa configuration dans les variables d'environnement ; aucun identifiant n'est écrit dans le code.

```bash
cp .env.example .env   # puis renseigner les valeurs
npm run email
```

| Variable    | Description |
|-------------|-------------|
| `SMTP_USER` | Adresse Gmail utilisée pour l'envoi |
| `SMTP_PASS` | Mot de passe d'application Gmail ([créer un mot de passe d'application](https://myaccount.google.com/apppasswords), validation en deux étapes requise) |
| `MAIL_TO`   | Adresse du destinataire |

Le script vérifie la connexion SMTP avant l'envoi et affiche des pistes de dépannage en cas d'erreur DNS ou d'authentification. La capture `image-email-reçu.png` montre un email reçu lors d'un test.
