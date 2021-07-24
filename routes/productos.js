const { Router } = require('express');
const { check } = require('express-validator');


// Mdlrs : customs Mdlres : token , contra db , etc .. capas de funciones antes de acceder al controller del servcio .
const { validarJWT, validarCampos, esAdminRole } = require('../middlewares');


// Controllers
const { crearProducto,
        obtenerProductos,
        obtenerProducto,
        actualizarProducto, 
        borrarProducto } = require('../controllers/productos');

const { existeCategoriaPorId, existeProductoPorId, existeProductoConEsteNombre } = require('../helpers/db-validators');

const router = Router();

/**
 * {{url}}/api/categorias
 */

/*  Publico
  * obtener todos los objetos de de productos 
*/
router.get('/', obtenerProductos );

/* Obtener Objeto producto por id - publico 
  * deje obtener producto que su estado false , para que el user sabra que fue borrado , pero en la lista de productos no .
*/
router.get('/:id',[
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeProductoPorId ),
    validarCampos,
], obtenerProducto );
  
/* Crear categoria - privado - cualquier persona con un token válido en este caso, pueede implementar crear cuenta vendedor : es decir tener rol vendedor donde pide cuenta bancaria , y solo rol vendedor tiene acceso 
   a este servicio  con los admintradores  */ 
router.post('/', [ 
    validarJWT, // verificar user autenticado
    check('nombre','El nombre es obligatorio').not().isEmpty(),
    check('categoria','No es un id de Mongo').isMongoId(),
    check('categoria').custom( existeCategoriaPorId ), // recibe como arg lo que viene en categoria : en este caso categoria es en un campo de body - categoria relacionada al producto 
    validarCampos
], crearProducto );

/* Actualizar - privado - cualquiera con token válido
 * mdlrs que puedo poner : permitir solo a rol admin actualizar y solo al user que creo dicho producto , todo depende del logica del negocio .  
 * en este caso  - permisos de acceder al servicio todo depende del systeme de que se trata , puede ser systema de una empresa todos trabajadores actualizan - o puede ser
 * ecommerce , store de tiendas : solo user autenticado modifica los productos emitidos por el mismo .++ siempre los administradores tendran acceso total .
 * obligar campo en actualizacion no : porque puede ser que solo este actualizando el precio y el nombre no 
*/
router.put('/:id',[
   validarJWT,
   //check('categoria','No es un id de Mongo').isMngoId(), raro
   check('categoria').custom( existeCategoriaPorId ),  // verificar si a categoria es de mi db: en general sera de mi DB - profe no ha usado no quiere obligar enviar categoria
   check('id').custom( existeProductoPorId ), // verifico el ide del producto a actualizar si es de mi db:validacion contra DB
    // no voy a verificar estado porque en la realidad el cliente vo obtendra id de producto de estado false , 
   validarCampos 
], actualizarProducto );

// Borrar una categoria - Admin
router.delete('/:id',[
    validarJWT,
    esAdminRole,
    check('id', 'No es un id de Mongo válido').isMongoId(),
    check('id').custom( existeProductoPorId ),
    validarCampos,
], borrarProducto);


module.exports = router;



/* mdlrs: verificar si hay oferta es true , manipulampos precios de objeto de offertas . */

/* ObjectUber{ producto _> viaje
  id ,
  id_conductor,
  relacion con id cliente 
  punto inicio{

  },
  punto llegada{

  },
  distancia,
  precioPagado,
  metodo de pago,
  hora recibida viaje,
  hora recogida cliente,
  hora_llehada_cleinet,
  la_ciudadad,
  kilometrajes_corridos
  kilometrajes_debe_correr,
  pagos_adicionales_
  oferta
  precio_kms_offerta



} */

/* Objeto empresa - objeto conductor - objeto cliente - objetoDistanciageolocalizacion:entre punto recogida y llegad  - ubicacion del conductor , distancia minima para captar conductor - conductores en el diametro 
tiempo de recogida en funcion de distancia , horas de conexion    */