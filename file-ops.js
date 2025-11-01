// file-ops.js
const fs = require("fs");

// 1. Créer welcome.txt
fs.writeFileSync("welcome.txt", "Hello Node");

// 2. Lire hello.txt
fs.readFile("hello.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Erreur :", err);
  } else {
    console.log("Contenu de hello.txt :", data);
  }
});
