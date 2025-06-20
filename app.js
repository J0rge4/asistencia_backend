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

// Ruta para consultar la asistencia de un alumno por matrícula y fecha
app.get('/api/alumnos/asistencia/:matricula', async (req, res) => {
    const { matricula } = req.params;  // Obtener la matrícula del parámetro de la URL
    const { fecha } = req.query;       // Obtener la fecha desde los parámetros de la consulta

    if (!fecha) {
        return res.status(400).json({ error: 'Fecha no proporcionada' });
    }

    try {
        // Consultar la base de datos para obtener los registros de asistencia
        const [rows] = await pool.execute('SELECT fecha, presente FROM asistencias WHERE matricula = ? AND fecha = ?', [matricula, fecha]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron registros de asistencia para esta matrícula y fecha.' });
        }

        res.json(rows);  // Devolver los resultados de la consulta
    } catch (error) {
        console.error('Error al obtener la asistencia:', error);
        res.status(500).json({ error: 'Error al obtener la asistencia' });
    }
});

// Ruta para eliminar un alumno por matrícula
app.delete('/api/alumnos/:matricula', async (req, res) => {
    const { matricula } = req.params;

    if (!matricula) {
        return res.status(400).json({ error: 'Matrícula no proporcionada' });
    }

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute('DELETE FROM usuarios WHERE matricula = ?', [matricula]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error al eliminar alumno:', err);
        res.status(500).json({ error: 'Error al eliminar alumno' });
    }
});

// Ruta para registrar asistencia (pasar lista)
app.post('/api/alumnos/pasarLista', async (req, res) => {
    const { lista, fecha } = req.body;

    // Verifica que los datos estén completos
    if (!Array.isArray(lista) || !fecha) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // Insertar la asistencia para cada alumno en la base de datos
        for (const alumno of lista) {
            await connection.execute('INSERT INTO asistencias (matricula, fecha, presente) VALUES (?, ?, ?)', 
            [alumno.matricula, fecha, alumno.presente]);
        }

        // Confirmar la transacción
        await connection.commit();
        res.json({ success: true });

    } catch (err) {
        // Si ocurre un error, hacer rollback y devolver el error
        await connection.rollback();
        console.error('Error al registrar asistencia:', err);
        res.status(500).json({ error: 'Error al registrar asistencia' });
    }
});

// Iniciar servidor Express
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

