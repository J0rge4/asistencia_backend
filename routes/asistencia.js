// Importa Express para poder crear rutas.
const express = require('express');
// Crea una instancia de Router, usada para definir rutas que luego se montarán en app.js.
const router = express.Router();
// Importa la conexión a la base de datos MySQL desde el archivo db.js.
const db = require('../db');

// Define una ruta POST /api/asistencia/pasar. Se usa cuando se quiere guardar la asistencia de varios alumnos.
router.post('/pasarLista', async (req, res) => {
    // Extrae del cuerpo de la petición: lista: un arreglo de alumnos, cada uno con su matrícula y si estuvo presente (true o false) fecha: la fecha del pase de lista (tipo YYYY-MM-DD)
    const { lista, fecha } = req.body;

    // Asegúrate de que 'lista' sea un array y que 'fecha' esté presente
    if (!Array.isArray(lista) || !fecha) {
        return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    const connection = await db.getConnection();
    try {
        // Inicia una transacción para asegurar que todas las inserciones se realicen correctamente
        await connection.beginTransaction();

        // Insertar los registros de asistencia para cada alumno
        for (const a of lista) {
            // Validación de que los datos del alumno estén presentes
            if (!a.matricula || a.presente === undefined) {
                return res.status(400).json({ error: 'Datos del alumno incompletos' });
            }

            // Inserta la asistencia en la base de datos
            await connection.execute('INSERT INTO asistencias (matricula, fecha, presente) VALUES (?, ?, ?)', 
            [a.matricula, fecha, a.presente]);
        }

        // Confirmar la transacción si todo ha ido bien
        await connection.commit();

        // Responder al cliente que todo fue exitoso
        res.json({ success: true });

    } catch (err) {
        // Si ocurre un error, hace rollback de la transacción
        await connection.rollback();
        console.error('Error al registrar asistencia:', err); // Loguea el error para depuración
        return res.status(500).json({ error: 'Error al registrar asistencia' }); // Devuelve el error al cliente
    } finally {
        // Liberar la conexión después de la transacción
        connection.release();
    }
});

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

