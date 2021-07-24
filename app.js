// Variables de entorno
require('dotenv').config();

const Server = require('./models/server');




// Instacia de Servidor de Express
const server = new Server();
server.listen();





 



