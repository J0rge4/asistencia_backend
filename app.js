require('dotenv').config();  // Carga las variables de entorno desde el archivo .env
const mysql = require('mysql2/promise');  // Importa el cliente mysql2
const express = require('express');  // Importa express
const cors = require('cors');  // Importa el middleware CORS

// Configuración de Express
const app = express();
const port = process.env.PORT || 3000;

// Configura CORS para permitir solicitudes desde el dominio del frontend (Netlify)
app.use(cors({
  origin: 'https://asistencia-front.netlify.app',  // Cambia esto si tu frontend está en otro dominio
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configura Express para usar JSON
app.use(express.json());

// Configuración del pool de conexiones a MySQL
const pool = mysql.createPool(process.env.MYSQL_URL || "mysql://root:JQSdBkXHUuBFpkOkWpPHlSkequoaHmPX@hopper.proxy.rlwy.net:38737/railway");

// Función para probar la conexión a la base de datos
async function testConnection() {
    try {
        const [rows] = await pool.execute('SELECT NOW()');
        console.log('Conectado a la base de datos en Railway');
        console.log('Fecha y hora de la base de datos:', rows[0]['NOW()']);
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);  // Si no se puede conectar, termina la aplicación
    }
}

// Probar la conexión a la base de datos
testConnection();

// Rutas de ejemplo
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

// Iniciar servidor Express
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
