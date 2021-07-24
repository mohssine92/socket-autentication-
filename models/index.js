

/*  aqui tengo todos mis modelos almazenados en constantes - escribimos constantes igual como se escribe los modelos 
    este es nuestro index no va ayudar a centralizar todos nuestros modelos en un unico archivo*/
const Categoria = require('./categoria');
const Producto = require('./producto');
const Role = require('./role');
const Server = require('./server');
const Usuario = require('./usuario');


module.exports = {
    Categoria,
    Producto,
    Role,
    Server,
    Usuario,
}

