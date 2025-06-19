//Importa Express para poder crear rutas
const express = require('express');
//Crea una instancia del enrutador (Router) que nos permite definir rutas de forma modular.
const router = express.Router();
// Importa el archivo db.js, que contiene la configuración y conexión activa a la base de datos MySQL.
const db = require('../db');

//Define una ruta tipo POST en /api/auth/login.Esta ruta se llama cuando el usuario intenta iniciar sesión desde el frontend.
router.post('/login', (req, res) => {
    //Extrae del body los datos enviados:usuario: lo que escribió el usuario en el campo usuario
    //contrasena: lo que escribió como contraseña
    //rol: el tipo de usuario que intenta acceder ("alumno" o "maestro")
    //Estos datos son enviados desde el frontend al hacer login.
    const { usuario, contrasena, rol } = req.body;
    //Ejecuta una consulta SQL que busca un usuario exacto con:
    //usuario igual al ingresado
    //contraseña igual a la ingresada
    //rol igual al seleccionado
    // El uso de ? evita inyección SQL, ya que los valores son inyectados de forma segura como parámetros.
    db.query('SELECT * FROM usuarios WHERE usuario = ? AND contrasena = ? AND rol = ?', 
    [usuario, contrasena, rol], (err, results) => {
        //Si hubo un error técnico (como que se cayó la base), responde con error 500.
        if (err) return res.status(500).json({ error: 'Error del servidor' });
        //Si no se encontró ningún usuario con esos datos, responde con error 401 (no autorizado) y un mensaje de “Credenciales inválidas”.
        if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
        //Si todo está bien:Devuelve { success: true } También incluye los datos del usuario (results[0]), por si el frontend quiere guardarlos (por ejemplo, para saber el nombre o rol)
        res.json({ success: true, user: results[0] });
    });
});

//Permite usar estas rutas desde app.js

module.exports = router;