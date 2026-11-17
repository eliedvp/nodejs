/**
 * Script d'envoi d'email via Gmail SMTP avec résolution DNS optimisée
 * 
 *  CONFIGURATION REQUISE (variables d'environnement, voir .env.example) :
 * - SMTP_USER : votre adresse Gmail
 * - SMTP_PASS : votre mot de passe d'application Gmail
 * - MAIL_TO   : l'adresse du destinataire
 * - Créez un mot de passe d'application : https://myaccount.google.com/apppasswords
 *
 * Lancement : node --env-file=.env email-sender.js  (ou npm run email)
 */

const nodemailer = require("nodemailer");
const dns = require("dns");
const { promisify } = require("util");

// Configuration DNS pour forcer IPv4 et éviter les timeouts
dns.setDefaultResultOrder("ipv4first");
dns.setServers(['8.8.8.8', '8.8.4.4']); // Utiliser les DNS de Google comme fallback

const lookup = promisify(dns.lookup);

// Les identifiants ne sont jamais écrits dans le code : ils viennent de l'environnement
const { SMTP_USER, SMTP_PASS, MAIL_TO } = process.env;
const variablesManquantes = ["SMTP_USER", "SMTP_PASS", "MAIL_TO"].filter((nom) => !process.env[nom]);
if (variablesManquantes.length > 0) {
  console.error(`Variables d'environnement manquantes : ${variablesManquantes.join(", ")}`);
  console.error("Copiez .env.example vers .env, renseignez-les puis lancez : npm run email");
  process.exit(1);
}

async function resolveHostIPv4(hostname) {
  try {
    // Résoudre explicitement en IPv4 seulement
    const { address } = await lookup(hostname, { family: 4 });
    console.log(`✅ Résolution DNS réussie : ${hostname} -> ${address}`);
    return address;
  } catch (error) {
    console.error(`❌ Erreur de résolution DNS pour ${hostname}:`, error.message);
    throw error;
  }
}

async function sendEmail() {
  try {
    // Résoudre manuellement l'adresse IPv4 avant de créer le transporteur
    console.log("🔍 Résolution de l'adresse IP de smtp.gmail.com...");
    const smtpHost = await resolveHostIPv4("smtp.gmail.com");
    
    // Configuration SMTP avec l'adresse IP résolue directement
    // Cela évite les problèmes de résolution DNS lors de la connexion
    let transporter = nodemailer.createTransport({
      host: smtpHost, // Utiliser l'IP directement
      port: 587,
      secure: false, // true pour 465, false pour autres ports
      auth: {
        user: SMTP_USER, // Votre adresse Gmail
        // ⚠️ IMPORTANT : Utilisez un MOT DE PASSE D'APPLICATION Gmail, pas votre mot de passe normal !
        // Créez-en un ici : https://myaccount.google.com/apppasswords
        pass: SMTP_PASS // Mot de passe d'application Gmail (16 caractères sans espaces)
      },
      // Options pour éviter les timeouts
      connectionTimeout: 15000, // 15 secondes
      greetingTimeout: 15000,
      socketTimeout: 15000,
      //  définir le nom d'hôte pour le certificat TLS
      tls: {
        servername: "smtp.gmail.com"
      }
    });

    // Vérifier la connexion avant d'envoyer
    await transporter.verify();
    console.log("Connexion SMTP vérifiée avec succès !");

    let info = await transporter.sendMail({
      from: SMTP_USER,
      to: MAIL_TO,
      subject: "Test Node.js Email",
      text: "Salut ! Ceci est un test depuis Node.js"
    });

    console.log("Email envoyé :", info.messageId);
    
    // Fermer la connexion
    transporter.close();
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error.message);
    
    // Suggestions de dépannage
    if (error.code === 'ETIMEOUT' || error.code === 'EDNS') {
      console.error("\n⚠️  Problème de résolution DNS détecté.");
      console.error("Solutions possibles :");
      console.error("1. Vérifiez votre connexion Internet");
      console.error("2. Vérifiez vos paramètres DNS/firewall");
      console.error("3. Essayez de changer vos serveurs DNS");
      console.error("4. Vérifiez que le port 587 n'est pas bloqué");
    } else if (error.code === 'EAUTH' || error.message.includes('Application-specific password required') || error.message.includes('InvalidSecondFactor')) {
      console.error("\n⚠️  PROBLÈME D'AUTHENTIFICATION - Mot de passe d'application requis");
      console.error("\n📋 Étapes pour créer un mot de passe d'application Gmail :");
      console.error("1. Activez la validation en 2 étapes sur votre compte Google si ce n'est pas déjà fait");
      console.error("2. Allez sur : https://myaccount.google.com/apppasswords");
      console.error("3. Sélectionnez 'Autre (nom personnalisé)' et donnez un nom (ex: 'Node.js Email')");
      console.error("4. Cliquez sur 'Générer'");
      console.error("5. Copiez le mot de passe à 16 caractères (sans espaces)");
      console.error("6. Renseignez ce mot de passe d'application dans la variable SMTP_PASS du fichier .env");
      console.error("\n⚠️  IMPORTANT : Vous devez utiliser un MOT DE PASSE D'APPLICATION, pas votre mot de passe Gmail normal !");
    }
    
    process.exit(1);
  }
}

sendEmail();
