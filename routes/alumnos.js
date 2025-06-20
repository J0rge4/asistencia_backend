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
