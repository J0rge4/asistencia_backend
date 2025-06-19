require('dotenv').config();  // Carga las variables de entorno desde el archivo .env
const mysql = require('mysql2/promise');  // Importa el cliente mysql2

async function createConnection() {
    try {
        // URL de conexión proporcionada por Railway
        const mysqlURL = "mysql://root:JQSdBkXHUuBFpkOkWpPHlSkequoaHmPX@mysql.railway.internal:3306/railway";
        
        // Crea la conexión con la base de datos usando la URL de Railway
        const connection = await mysql.createConnection(mysqlURL);

        console.log('Conectado a la base de datos');
        return connection;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        process.exit(1);  // Si no se puede conectar, termina la aplicación
    }
}

createConnection();  // Ejecuta la función para crear la conexión
module.exports = createConnection;
