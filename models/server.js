const express = require('express')
var cors = require('cors');
const fileUpload = require('express-fileupload');

const { dbConnection } = require('../db/config');




// Tratar servidor como objeto 
// Express basado en classes
class Server {


  //es inecesario declarar la props , basta declaralos en el constructor
   constructor(){
     // express() es la funcion servidor
     this.app = express();   
     this.port = process.env.PORT;

    /* Definir urls ApiRest en el servidor de node , sino la defino no estara reconocida por mi servidore 
       cada ruta dispone de endpoints propios = archivos de routes , la suma de todos seria los endPoints de RestApi */
    this.paths = {
      auth:       '/api/auth',
      buscar:     '/api/buscar',
      categorias: '/api/categorias',
      productos:  '/api/productos',
      usuarios:   '/api/users',
      uploads:    '/api/uploads',
    }
  
     
     // Conectar a db atlass en nube , es um metodo , se ejecuta antes de lod middelware
     this.connectarDB();

    // Middelwares : funciones a nivel del servidor de express  : se ejecutan antes de llegar a las rutas
     this.middlewares();

    // Rutas de mi aplicacion 
     this.routes();

   }

   async connectarDB() {
     // aqui se implemeta varias conexiones a base de datos diferentes usar una o otra ... 
      await dbConnection(); 
   }

   /* aqui tenemos agrupados lo que son mdlrs a nivel de servidor */
   middlewares(){
     // app.use() es los middelware de express ver mas informacion en la doc de express ..
     // Cors , donde configuramos las cabezeras como los origines que tiene permioso a comunicar a los end-points del Restserver , 
     // Rest-server pude ser publica , o solo para algunosorigenes ...hay varios escenarios que pudede configura
     this.app.use( cors() );

     /* Lectura y parseo del body disparado por Origen o navigador o postman por cliente  hacia todos nuestros end-points en esta configuracion 
      Ex : un formulario dispara su post en este especifico punto codificamos valor req.body en formato json , en objeto json literal - apto a manipular en js  */
     this.app.use( express.json() );   
  
  
    //http://localhost:8080 - pagina statica a cargar en el dominio - express funcion paquete 
     this.app.use(express.static('public'));

     /* FileUpload - carga de archivos  - video:182 para cualquier duda 
      * puede ser cualquier tipo de  archivo - aqui no es el luguar donde estoy especificando que tiene que ser img o excel ....
     */
     this.app.use ( fileUpload({
       useTempFiles : true,
       tempFileDir : '/tmp/',
       createParentPath : true, // POR DEFAULT ES FALSE

     }));



   } 

   routes() { 
     /* middelware de express , segun this.paths entrante se require  el archivo de rutas : verbos http relacionado */
    this.app.use( this.paths.usuarios, require('../routes/users'));
    this.app.use( this.paths.buscar, require('../routes/buscar'));
    this.app.use( this.paths.auth, require('../routes/auth'));
    this.app.use( this.paths.categorias, require('../routes/categorias'));  
    this.app.use( this.paths.productos, require('../routes/productos')); 
    this.app.use( this.paths.uploads, require('../routes/uploads'));


   }

   listen() {
     this.app.listen(this.port, () => {
        console.log(`Example app listening at http://localhost:${this.port}`)
     })

   }
}



module.exports = Server;