const express = require('express');
const router = express.Router();
const db = require('../db');
const cors = require('cors');

// Middleware CORS - ¡Añadido aquí al principio!
router.use(cors({
  origin: 'https://asistencia-front.netlify.app/maestro/maestro.html', // Reemplaza con la URL de tu front-end
  methods: ['GET', 'POST', 'DELETE'], // Especifica los métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Especifica los encabezados permitidos
}));


//Define una ruta POST /api/alumnos/registrar.
router.post('/registrar', (req, res) => {
    // Extrae nombre y matricula del cuerpo del request (req.body), que viene desde el frontend cuando registras a un alumno.
    const { nombre, matricula } = req.body;
    //Ejecuta un INSERT en la tabla usuarios, guardando:nombre: nombre del alumno,usuario: igual a la matrícula, contrasena: también igual a matrícula (puedes mejorar esto luego con seguridad),matricula: matrícula del alumno, "alumno": el valor fijo para la columna rol
    db.query('INSERT INTO usuarios (nombre, usuario, contrasena, matricula, rol) VALUES (?, ?, ?, ?, "alumno")',
    [nombre, matricula, matricula, matricula], (err) => {
        //Si hay error al insertar, devuelve un mensaje de error. Si funciona, responde con { success: true }.
        if (err) return res.status(500).json({ error: 'Error al registrar' });
        res.json({ success: true });
    });
});

//Define una ruta DELETE /api/alumnos/:matricula.
router.delete('/:matricula', (req, res) => {
    // Borra al alumno con la matrícula recibida en la URL.
    db.query('DELETE FROM usuarios WHERE matricula = ?', [req.params.matricula], (err) => {
        //Si hay error, responde con 500. Si funciona, indica que fue exitoso.
        if (err) return res.status(500).json({ error: 'Error al eliminar' });
        res.json({ success: true });
    });
});

//Obtener lista de alumnos,  Ruta GET /api/alumnos
router.get('/', (req, res) => {
    //Consulta a todos los usuarios cuyo rol es "alumno". Solo devuelve nombre y matricula.
    db.query('SELECT nombre, matricula FROM usuarios WHERE rol = "alumno"', (err, results) => {
        // Devuelve los resultados en formato JSON para que el frontend los muestre.
        if (err) return res.status(500).json({ error: 'Error al obtener alumnos' });
        res.json(results);
    });
});

//Exporta las rutas para que puedan ser usadas en app.js
module.exports = router;