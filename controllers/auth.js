const { response } = require('express');

const bcryptjs = require('bcryptjs')

const Usuario = require('../models/usuario');

const { generarJWT } = require('../helpers/generar-jwt');
const { googleVerify } = require('../helpers/google-verify');


const login = async (req, res = response) => {
  
  // Extraer las propiedad que quiero que llegan atraves del body del cliente 
  const { correo, password } = req.body;

  try {
     
     // verificar si el email existe
     const usuario = await Usuario.findOne({ correo }); // recuerda que correo es una propiedad interna de nuestro modelo , 
     console.log(' objeto de tipo user recuperado por correo :',usuario);


      if ( !usuario ) {
          return res.status(400).json({
            //  msg: 'Usuario / Password no son correctos - correo'
                msg: 'El correo Introducido No existe en nuestra base de datos' 
          });
      }

      if( !usuario.estado ) {  // es booleana false
          return res.status(400).json({
             //  msg: 'Usuario / Password no son correctos - password'
             msg: 'Usuario esta borrado o desactivado temporalmente'
          });
      }

      // Verificar la contraseña existente si es correcta
      const validPassword = bcryptjs.compareSync( password, usuario.password );   
      if ( !validPassword ) {
          return res.status(400).json({
             // msg: 'Usuario / Password no son correctos - password'
              msg: 'password introducido no es correcto'
          });
      }

      // Generar el JWT
      // cada vez se autentica se genera un JWT nuevo
      // lo que voy a almazanar en jwt en este caso solo id , por favor no almazenar datios sensibles , porque se decifra el apyload del lado del cliente 
      const token = await generarJWT( usuario.id );


     // no usamos return porque usalmente res , es el ultimo que debo ejecutar , no puede mandar 2 respuesta en el mismo proceso ,
     // proceso lo que tengo perocesar y mandlo lo que debo mandar , siempre segun la tarea . que debe hacer el servicio . 
     res.json({
       usuario,
       token
     
     })


  } catch (error) {
     // status 500 es algo no debe disparares , si se dispara es algo falla en mi codigo
     console.log(error)
     res.status(500).json({  
        msg: 'Hable con el administrador'
     });

  }
        



}

const googleSignin = async(req, res = response) => {
   
  const { id_token } = req.body; 
 

  
  try {
    //  const { correo, nombre, img } = await googleVerify( id_token );

    //  let usuario = await Usuario.findOne({ correo });

    const { correo, nombre, img } = await googleVerify( id_token );
   

    /* ahora me toca crear el proceso de auteticacion en mi DB , porque se si llego a este punto el usuario de goole fue verificado correctamente , este proceso de db 
      sera el mismo para los demas Apis como youtube , githb etc .. lo unico que se va cambiando son los helpers y lo del frond-end(pasarme id_token en este caso de google para
      verificarlo en helper) donde  voy a implementar cada logica  de verificancion de tokenz del api de auth que quiero permitir en mi back end como forma de autenticacion - . */  
    let usuario = await Usuario.findOne({ correo });
     
      if (! usuario ) {

        // console.log(usuario, 'usuario no existe en db ');
        // Tengo que crearlo
        const data = {
            nombre,
            correo,
            password: 'auth-api-etern', // es requerido en nuestro modelo 
            img,
            google: true
        }; // recordar las props internas de data deben ser igual al modelo paraque se caen encima y se registra el objeto correctamente .

        usuario = new Usuario( data );
        await usuario.save(); 
       
     } 

    // Si el usuario en DB 
    if ( !usuario.estado ) { // false
      return res.status(401).json({
          msg: 'Hable con el administrador, usuario bloqueado'
      });
    }

    // Generar el JWT - a esta altuta user deberia existir o se acaba de generarse , asi si o si debemos tener id de monggose para almacenarlo en jwt :D 
    const token = await generarJWT( usuario.id );
    console.log(token)
    res.json({
      usuario,
      token
    });

   
      
} catch (error) {

  res.status(400).json({
      msg: 'Token de Google no es válido'
  })

}



}



module.exports = {
    login,
    googleSignin
}
