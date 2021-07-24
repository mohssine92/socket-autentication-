const { Router }= require('express');
const { check } = require('express-validator');

//const { validarCampos } = require('../middlewares/validar-campos');
//const { validarJWT } = require('../middlewares/validar-jwt');
//const { tieneRole, RoleAndmismoId, esAdminRole } = require('../middlewares/validar-roles');
const {validarCampos, validarJWT, tieneRole, RoleAndmismoId, esAdminRole } = require('../middlewares');

// validacione perzonalizadas
const { esRoleValido,
        emailExiste,
        existeUsuarioPorId,
        esRoleValidoUp,
        veririficIfIsNumber } = require('../helpers/db-validators');

const { UsersGet, 
        UsersPost,
        UsersPut,
        UsersPatch,
        UsersDelete } = require('../controllers/user');





const router = Router();


// Restapi Endpoints , para Recurso de users:


// le paso Referencia de funcion UserGet , le ejecuta a su tiempo
router.get('/',[
   check('limit').custom( veririficIfIsNumber ),   // ver docs 
   check('desde').custom( veririficIfIsNumber ),
   validarCampos
],  UsersGet) 


// '/' => se carga directamente despues del prefix que esta recien configurado 
// si no configuramos prefix:api , la carga sera directamente despues del dominio  
// TODO: para actualizar user , necesitamos crear un servicio para el cliente donde respondemos con objeto de cliente auteticado
 router.put('/:id',[
    check('id', 'No es un ID válido').isMongoId(), // ver docs , id validado es del parametro de roota , no la prop del objeto en este caso  .
    check('id').custom( existeUsuarioPorId ),  // ver docs
    check('rol').custom( esRoleValidoUp ),   // ver docs
    validarCampos  // acumulador de errores
 ], UsersPut) 

 router.post('/',[
    //midlware collection
    // check() va captando los errores y validarCampos muestra los errores acumulador por este .
    check('nombre','el nombre es obligatorio').not().isEmpty(),  // en este caso captra campos del body
    check('password','el password debe ser mas de 6 letras').isLength({ min:6 }),
    check('correo', 'El correo ingresado no es valido').isEmail(), 
    check('correo').custom( (correo) => emailExiste(correo) ),
    // check('rol', 'no es rol valido').isIn(['ADMIN_ROLE', 'USER_ROLE']), => video 124 
    check('rol').custom( esRoleValido ),
    validarCampos
 ],UsersPost)  

 router.delete('/:id',[
   validarJWT,
   // esAdminRole,
   tieneRole('ADMIN_ROLE','VENTAS_ROLE'), // ustedes podeis pasar tanto roles necesite este end-point - asi ya sabemos como recibir args en nuestros propios  mdlrs
   // RoleAndmismoId('ADMIN_ROLE', 'VENTAR_ROLE'),
   check('id', 'No es un ID válido').isMongoId(), // ver docs , id validado es del parametro de roota , no la prop del objeto en este caso  .
   check('id').custom( existeUsuarioPorId ),  // ver docs check('id').custom( existeUsuarioPorId ),  // ver docs
   validarCampos  // acumulador de errores
 ],UsersPatch) 

 router.patch('/', UsersDelete)  



module.exports = router;