const mysql = require('mysql2');
//Establece la conexión con la base de datos MySQL. Aquí:
const connection = mysql.createConnection({
    host: 'localhost', // dirección del servidor (en este caso, local)
    user: 'root', //nombre de usuario (usualmente root)
    password: 'admin123', //contraseña del usuario (vacía si no has definido una)
    database: 'asistencia_db' //nombre de la base de datos que creaste
});
connection.connect();
module.exports = connection;