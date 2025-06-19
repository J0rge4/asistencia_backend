//Importa el módulo express, que se usa para crear servidores web rápidos en Node.js.
const express = require('express'); 
// Importa el módulo cors (Cross-Origin Resource Sharing) para permitir que tu frontend se comunique con el backend aunque estén en dominios distintos (útil si el frontend está en otro puerto o desplegado).
const cors = require('cors');
// Importa el módulo mysql2 para conectarse a la base de datos MySQL. Esta es una versión más moderna que mysql y soporta promesas.
const mysql = require('mysql2');
//Crea una aplicación de Express. Esta variable app se usa para definir rutas, middlewares, y configurar el servidor.
const app = express();
//Usa cors como middleware para permitir peticiones desde cualquier origen (por defecto). Esto habilita la comunicación entre frontend y backend.
app.use(cors());
//Permite que Express entienda datos JSON enviados en el cuerpo (body) de las peticiones HTTP como POST o PUT.
app.use(express.json());

const authRoutes = require('./routes/auth'); //Importa el archivo auth.js ubicado en la carpeta /routes/.Ese archivo probablemente contiene rutas como /login, usadas para autenticar usuarios.
const alumnoRoutes = require('./routes/alumnos'); //Importa el archivo alumnos.js, que contiene las rutas para registrar, listar o eliminar alumnos.
const asistenciaRoutes = require('./routes/asistencia'); //Importa el archivo asistencia.js, donde están las rutas que permiten pasar lista o consultar asistencias.


app.use('/api/auth', authRoutes); //Cada vez que alguien acceda a /api/auth, usa las rutas que están definidas en authRoutes
app.use('/api/alumnos', alumnoRoutes); // Asocia todas las rutas de alumnos.
app.use('/api/asistencia', asistenciaRoutes); //Asocia las rutas que gestionan la asistencia.

// Inicia el servidor y lo deja escuchando en el puerto 3000.Cuando abras http://localhost:3000 desde el navegador o el frontend, este será el backend que responde.
app.listen(3000, () => console.log("Servidor corriendo en puerto 3000"));