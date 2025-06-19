require('dotenv').config();  // Carga las variables de entorno desde el archivo .env
const mysql = require('mysql2/promise');  // Importa el cliente mysql2
const express = require('express');  // Importa express

// Configuración de Express
const app = express();
const port = process.env.PORT || 3000;

async function createConnection() {
    try {
        // URL pública de conexión proporcionada por Railway (modificada)
        const mysqlURL = process.env.MYSQL_URL || "mysql://root:JQSdBkXHUuBFpkOkWpPHlSkequoaHmPX@hopper.proxy.rlwy.net:38737/railway";
        
        // Crea la conexión con la base de datos usando la URL de Railway
        const connection = await mysql.createConnection(mysqlURL);

        // Probar la conexión a la base de datos
        const [rows, fields] = await connection.execute('SELECT NOW()');
        console.log('Conectado a la base de datos en Railway');
        console.log('Fecha y hora de la base de datos:', rows[0]['NOW()']);

        return connection;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);  // Si no se puede conectar, termina la aplicación
    }
}

// Conexión a la base de datos
createConnection();

// Iniciar servidor Express
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
