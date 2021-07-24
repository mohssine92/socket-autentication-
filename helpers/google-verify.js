const {OAuth2Client} = require('google-auth-library');

// Verificar la integridad del token de identificación emitido por Api de google de autenticacion

const client = new OAuth2Client( process.env.GOOGLE_CLIENT_ID );

const googleVerify = async ( idToken ) => {
   
  const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID ,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });


  const { name: nombre,   // esto no es objeto llave valor , es desestructuracion del objeto y renomrar las prop desestructuradas
          picture: img, 
          email: correo
  } = ticket.getPayload();  // en Payload viene toda la informacion del usuario de google - obtenida desde api de google de froma tokonizada .
 
  console.log(ticket.getPayload())

  return { nombre, img, correo };

  // const userid = payload['sub']; // extraer 



}
//verify().catch(console.error); - coy a manejar la excepcion de otro forma 

module.exports = {
  googleVerify

}