const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos, validarArchivoSubir } = require('../middlewares'); // INDEX

const { cargarArchivo  , actualizarImagen , mostrarImagen  , actualizarImagenCloudinary , mostrarImagenCloudinary  } = require('../controllers/uploads');
const { coleccionesPermitidas } = require('../helpers');

 
const router = Router();

/* usualmente se usa post para crear nuevo recurso en servidor  : en este caso un archivo excel , img , pdf etc ... 
 '/' : no quiere decir que se renderiza en la raiz de la routa , siempre el servidor de express quien decida donde se va renderizar esta ruta : es decir tengo que ir al servidor y crear un path para el manejo de la carga de los archivos
 * este end-point sera usado para subir un archivo a nuestro servidor de express y lo vamos a colocar en algun lado de nuestro servidor
 * segundo arg ,[], : recuerden pueden implementar cualquier validacion : como para subir un archivo verificar jwt etc .. eso lo hemos hecho varias veces , ahora solo enfocamos en la carga de archivos : pero en proyecto real si o si 
 * hay que implementar validaciones  ..
 * asi puedo crear , mas end-points para la subida de fotos perfil - imgs products - pdf : generando la carpeta coreespondiente en el servidor */
router.post( '/', validarArchivoSubir, cargarArchivo ); 



/* usualmente se usa put para actualizar un recurso  - en servicio mi archivo se suba en un servicio exxterno que es Cloudinary */
router.put('/:coleccion/:id', [
    validarArchivoSubir,
    check('id','the id should be id mongoDb valid').isMongoId(),
    check('coleccion').custom( c => coleccionesPermitidas( c, ['usuarios','productos'] ) ), // estamos mandando una funcion porque ocupamos mandar argumentos : felxible mas colecciones 
    validarCampos
], actualizarImagenCloudinary )
//], actualizarImagen )


/* aqui basicamenet donde mando la coleccion y el id y este servico debe responder con el path correcta para la carga del archivo  */
router.get('/:coleccion/:id', [
    check('id','El id debe de ser de mongo').isMongoId(),
    check('coleccion').custom( c => coleccionesPermitidas( c, ['usuarios','productos'] ) ),
    validarCampos
//],  mostrarImagen  )
], mostrarImagenCloudinary ) 



module.exports = router;