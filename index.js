const express = require("express");
const crypto = require("crypto");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
app.use(express.urlencoded({ extended: true }));

// ---------- CONFIG WEBHOOK DISCORD ----------
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1451359934624174090/_AUS0GxiC47u7PnYgTwPFdlpTeyJk6COls_Lj_9Sq5UTDEQZ12_D2Arh1PnZ9mVYbBHI";

// ---------- SUBIDA DE IMÁGENES ----------
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB máximo
});

// ---------- GENERAR CÓDIGO ----------
function generarCodigo() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let codigo = "";
  for (let i = 0; i < 10; i++) {
    codigo += letras[crypto.randomInt(0, letras.length)];
  }
  return "SOPRIM-" + codigo;
}

// ---------- SUCCESS ----------
app.get("/success", (req, res) => {
  const codigo = generarCodigo();

  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Verificación de compra</title>
<style>
body { background:#0f0f0f; color:white; font-family:Arial; }
.container { max-width:600px; margin:40px auto; background:#1a1a1a; padding:30px; border-radius:10px; }
.code { font-size:26px; color:#00ff99; font-weight:bold; margin:15px 0; text-align:center; }
input, button { width:100%; margin:10px 0; padding:10px; border-radius:5px; border:none; }
button { background:#00ff99; font-weight:bold; cursor:pointer; }
</style>
</head>
<body>

<div class="container">
  <h2>Pago recibido</h2>
  <p>Tu código es:</p>
  <div class="code">${codigo}</div>

  <h3>Verificación manual</h3>
  <p>Sube la captura de PayPal y rellena los datos para validar tu compra.</p>

  <form action="/enviar-verificacion" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="codigo" value="${codigo}">
    <input type="file" name="captura" accept="image/*" required>
    <input type="text" name="nombrePaypal" placeholder="Nombre de PayPal" required>
    <input type="email" name="email" placeholder="Correo electrónico" required>
    <button type="submit">Enviar verificación</button>
  </form>
</div>

</body>
</html>
`);
});

// ---------- RECIBIR FORM Y ENVIAR A DISCORD ----------
app.post("/enviar-verificacion", (req, res) => {
  upload.single("captura")(req, res, async (err) => {
    if (err) {
      console.error("Error subiendo archivo:", err);
      return res.send("Error al subir la captura: " + err.message);
    }

    const { nombrePaypal, email, codigo } = req.body;

    if (!req.file) {
      return res.send("La captura de PayPal es obligatoria.");
    }

    try {
      // Preparamos el formulario para Discord
      const form = new FormData();
      form.append("file", req.file.buffer, req.file.originalname);
      form.append("payload_json", JSON.stringify({
        username: "Verificación Soprimico",
        embeds: [
          {
            title: "Nueva compra",
            color: 65280, // verde
            fields: [
              { name: "Código", value: codigo },
              { name: "Nombre PayPal", value: nombrePaypal },
              { name: "Email", value: email }
            ]
          }
        ]
      }));

      // Enviamos a Discord
      await axios.post(DISCORD_WEBHOOK_URL, form, {
        headers: form.getHeaders()
      });

      res.send("<h2>Verificación enviada correctamente al servidor de Discord.</h2>");
    } catch (error) {
      console.error("Error enviando a Discord:", error);
      res.send("Error enviando la verificación a Discord.");
    }
  });
});

// ---------- START ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor iniciado en puerto " + PORT));
