//Importa Express para poder crear rutas.
const express = require('express');
//Crea una instancia de Router, usada para definir rutas que luego se montarán en app.js.
const router = express.Router();
// Importa la conexión a la base de datos MySQL desde el archivo db.js.
const db = require('../db');

//Define una ruta POST /api/asistencia/pasar. Se usa cuando se quiere guardar la asistencia de varios alumnos.
router.post('/pasar', async (req, res) => {
    // Extrae del cuerpo de la petición: lista: un arreglo de alumnos, cada uno con su matrícula y si estuvo presente (true o false) fecha: la fecha del pase de lista (tipo YYYY-MM-DD)
    const { lista, fecha } = req.body;

    // Asegúrate de que 'lista' sea un array y que 'fecha' esté presente
    if (!Array.isArray(lista) || !fecha) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    // Inicia una transacción para asegurar que todas las inserciones se realicen correctamente
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Insertar los registros de asistencia para cada alumno
        for (const a of lista) {
            await connection.execute('INSERT INTO asistencias (matricula, fecha, presente) VALUES (?, ?, ?)', 
            [a.matricula, fecha, a.presente]);
        }

        // Confirmar la transacción
        await connection.commit();

        // Responder al cliente que todo fue exitoso
        res.json({ success: true });

    } catch (err) {
        // Si ocurre un error, hacer rollback y devolver el error
        await connection.rollback();
        console.error('Error al registrar asistencia:', err);
        res.status(500).json({ error: 'Error al registrar asistencia' });
    } finally {
        // Liberar la conexión después de la transacción
        connection.release();
    }
});

// Ruta GET /api/asistencia/:matricula. Sirve para obtener el historial de asistencias de un alumno.
router.get('/:matricula', (req, res) => {
    // Consulta todas las filas de la tabla asistencias en las que matricula coincida con la recibida en la URL.
    db.query('SELECT fecha, presente FROM asistencias WHERE matricula = ?', 
    [req.params.matricula], (err, results) => {
        // Si hay error, lo devuelve al cliente. Si todo sale bien, responde con los resultados: un arreglo con fecha y presente para ese alumno.
        if (err) return res.status(500).json({ error: 'Error al consultar asistencia' });
        res.json(results);
    });
});

//Permite que este archivo sea usado en app.js
module.exports = router;
