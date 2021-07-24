const { Router }= require('express');
const { check } = require('express-validator');

// Controller Funcion 
const { login, googleSignin } = require('../controllers/auth');

const { validarCampos } = require('../middlewares/validar-campos');










// Instancia Router

const router = Router();


//la ruta de inicio de sesión. 
router.post('/login',[
  check('correo', 'El correo es obligatorio, o asegurarse que el formato de correo es correcto').isEmail(),
  check('password', 'La contraseña es obligatoria').not().isEmpty(), // esta prop debe traer valor ,sino se emite este error al acumulador
  validarCampos
], login );

router.post('/google',[
   check('id_token', 'El id_token es necesario').not().isEmpty(), 
   validarCampos
], googleSignin );






// si no exporto router la app se crashea , 
module.exports = router; 