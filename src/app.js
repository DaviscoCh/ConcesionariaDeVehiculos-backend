const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Backend funcionando en Render 🚀");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
