require('dotenv').config();  // Carga las variables de entorno desde el archivo .env
const mysql = require('mysql2/promise');  // Importa el cliente mysql2
const express = require('express');  // Importa express
const cors = require('cors');  // Importa el middleware CORS
const alumnosRouter = require('./routes/alumnos');

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

// Ruta para registrar un alumno
app.post('/api/alumnos/registrar', async (req, res) => {
    const { nombre, matricula } = req.body;
    if (!nombre || !matricula) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.execute('INSERT INTO usuarios (nombre, usuario, contrasena, matricula, rol) VALUES (?, ?, ?, ?, "alumno")', [nombre, matricula, matricula, matricula]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error al registrar alumno:', err);
        res.status(500).json({ error: 'Error al registrar alumno' });
    }
});

// Ruta para obtener la lista de alumnos
app.get('/api/alumnos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT nombre, matricula FROM usuarios WHERE rol = "alumno"');
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener alumnos:', err);
        res.status(500).json({ error: 'Error al obtener alumnos' });
    }
});

// Iniciar servidor Express
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

