// Variables de entorno
require('dotenv').config();


// modelo de mi servider de back-end
const Server = require('./models/server');




// Instacia de Servidor de Express
const server = new Server();
server.listen();





 



