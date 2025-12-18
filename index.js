const express = require("express")
const crypto = require("crypto")

const app = express()

function generarCodigo() {
  return "SOPRIM-" + crypto.randomBytes().toString("hex").toUpperCase()
}

app.get("/", (req, res) => {
  res.send("Servidor activo")
})

app.get("/success", (req, res) => {
  const codigo = generarCodigo()

  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Compra completada</title>
      <style>
        body {
          background: #0f0f0f;
          color: white;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .box {
          background: #1a1a1a;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
        }
        .code {
          font-size: 28px;
          margin: 20px 0;
          color: #00ff99;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <h1>Pago completado</h1>
        <p>Tu código es:</p>
        <div class="code">${codigo}</div>
        <p>Úsalo en Discord para recibir tu producto</p>
      </div>
    </body>
    </html>
  `)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("Servidor iniciado en puerto " + PORT)
})
