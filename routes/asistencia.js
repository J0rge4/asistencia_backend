// Importa Express para poder crear rutas.
const express = require('express');
// Crea una instancia de Router, usada para definir rutas que luego se montarán en app.js.
const router = express.Router();
// Importa la conexión a la base de datos MySQL desde el archivo db.js.
const db = require('../db');



// Ruta GET /api/asistencia/:matricula. Sirve para obtener el historial de asistencias de un alumno.
router.get('/:matricula', async (req, res) => {
    const { matricula } = req.params;

    // Verifica que la matrícula esté presente
    if (!matricula) {
        return res.status(400).json({ error: 'Matrícula es requerida' });
    }

    try {
        // Consulta todas las filas de la tabla asistencias en las que matrícula coincida con la recibida en la URL
        const [results] = await db.execute('SELECT fecha, presente FROM asistencias WHERE matricula = ?', [matricula]);

        // Si no hay registros para esa matrícula, responde con un mensaje adecuado
        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron registros de asistencia para esta matrícula' });
        }

        // Responde con los resultados de la consulta
        res.json(results);
    } catch (err) {
        console.error('Error al consultar asistencia:', err); // Loguea el error para depuración
        res.status(500).json({ error: 'Error al consultar asistencia' }); // Devuelve el error al cliente
    }
});

// Permite que este archivo sea usado en app.js
module.exports = router;

