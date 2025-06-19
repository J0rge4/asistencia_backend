// Importa Express para crear rutas.
const express = require('express');
// Crea una instancia de Router.
const router = express.Router();
// Conexión a la base de datos (asegúrate de que 'db' esté bien configurado)
const db = require('../db');
// Importa el middleware CORS
const cors = require('cors');

// Middleware CORS para permitir solicitudes desde el frontend.
router.use(cors({
  origin: 'https://asistencia-front.netlify.app', // Reemplaza con la URL de tu frontend
  methods: ['GET', 'POST', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));

// Ruta POST /api/alumnos/registrar
router.post('/registrar', (req, res) => {
    const { nombre, matricula } = req.body;

    // Verifica que los datos necesarios están presentes
    if (!nombre || !matricula) {
        return res.status(400).json({ error: 'Nombre y matrícula son requeridos' });
    }

    // Inserta en la base de datos
    db.query('INSERT INTO usuarios (nombre, usuario, contrasena, matricula, rol) VALUES (?, ?, ?, ?, "alumno")',
    [nombre, matricula, matricula, matricula], (err) => {
        if (err) {
            console.error('Error al registrar:', err);  // Loguea el error para depuración
            return res.status(500).json({ error: 'Error al registrar alumno' });
        }
        res.json({ success: true });
    });
});

// Ruta DELETE /api/alumnos/:matricula
router.delete('/:matricula', (req, res) => {
    const { matricula } = req.params;

    // Elimina al alumno con la matrícula especificada
    db.query('DELETE FROM usuarios WHERE matricula = ?', [matricula], (err) => {
        if (err) {
            console.error('Error al eliminar:', err);  // Loguea el error para depuración
            return res.status(500).json({ error: 'Error al eliminar alumno' });
        }
        res.json({ success: true });
    });
});

// Ruta GET /api/alumnos para obtener la lista de alumnos
router.get('/', (req, res) => {
    // Consulta a los usuarios cuyo rol es "alumno"
    db.query('SELECT nombre, matricula FROM usuarios WHERE rol = "alumno"', (err, results) => {
        if (err) {
            console.error('Error al obtener alumnos:', err);  // Loguea el error para depuración
            return res.status(500).json({ error: 'Error al obtener alumnos' });
        }
        res.json(results);  // Responde con la lista de alumnos
    });
});

// Exporta el router para ser usado en el archivo principal (app.js)
module.exports = router;
