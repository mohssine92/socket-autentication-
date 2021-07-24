const { Router } = require('express');  //
const { buscar } = require('../controllers/buscar'); 




const router = Router();


// las peticiones de busquedas pueden ser cualquier cosa - pero usualmente son get - y los argumentos se pasan por url . 
/* 
  :coleccion : la coleccion en db que euiere buscar
  :termino : termino de la busqueda en la coleccion 
  asi debe recibir dos queries requeridos en request
*/
router.get('/:coleccion/:termino', buscar )




module.exports = router; //