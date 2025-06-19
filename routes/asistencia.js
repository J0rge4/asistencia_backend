//Importa Express para poder crear rutas.
const express = require('express');
//Crea una instancia de Router, usada para definir rutas que luego se montarán en app.js.
const router = express.Router();
// Importa la conexión a la base de datos MySQL desde el archivo db.js.
const db = require('../db');


//Define una ruta POST /api/asistencia/pasar. Se usa cuando se quiere guardar la asistencia de varios alumnos.
router.post('/pasar', (req, res) => {
    //Extrae del cuerpo de la petición:lista: un arreglo de alumnos, cada uno con su matrícula y si estuvo presente (true o false)fecha: la fecha del pase de lista (tipo YYYY-MM-DD)
    const { lista, fecha } = req.body;
    //Por cada alumno en la lista:Inserta en la tabla asistencias una fila con su:matricula,fecha,presente (booleano o 0/1)
    lista.forEach(a => {
        db.query('INSERT INTO asistencias (matricula, fecha, presente) VALUES (?, ?, ?)', 
        [a.matricula, fecha, a.presente]);
    });
    // Al terminar el forEach, responde al cliente con un JSON que indica éxito.
    res.json({ success: true });
});

//Ruta GET /api/asistencia/:matricula.Sirve para obtener el historial de asistencias de un alumno.
router.get('/:matricula', (req, res) => {
    //Consulta todas las filas de la tabla asistencias en las que matricula coincida con la recibida en la URL.
    db.query('SELECT fecha, presente FROM asistencias WHERE matricula = ?', 
    [req.params.matricula], (err, results) => {
        //Si hay error, lo devuelve al cliente.Si todo sale bien, responde con los resultados: un arreglo con fecha y presente para ese alumno.
        if (err) return res.status(500).json({ error: 'Error al consultar asistencia' });
        res.json(results);
    });
});

//Permite que este archivo sea usado en app.js
module.exports = router;