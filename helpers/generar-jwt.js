const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');


// usado en el constroller de autenticacion , En cada autenticacion se genera JWT 
const generarJWT = ( uid = '' ) => {

    return new Promise( (resolve, reject) => {

        const payload = { uid };  // 2 hash : lo que estoy almazenando en jwt

        // en la documentacion , esta isntruccion de implementacion trabajar con callback , eso segnifica la instruccion es ASyncronica , asi lo hemos manejado dentro de una promesa que encaja en nuestros
        // controller funcion asyc . asi la llamada a esta funcion desde nuestro controller implementa await .
        jwt.sign( payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '4h'
        }, ( err, token ) => {

            if ( err ) {
                console.log(err);
                reject( 'No se pudo generar el token' )
            } else {
                resolve( token );
            }
        })

    })
}



/* la idea en el controler de mi sockets , cuando un cliente se conecta debo validar su token recibido para la Obtencion del objeto user connectado
 * esta usa esta funcion como validacion 
*/
const comprobarJWT = async( token = '') => {

    try {
        
        if(  token.length < 10 ) {
            return null; // en este caso segnificaria no viene un token , viene otra cosqa rara
        }

        const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY ); // verificar token contra nuestro firma  : desincriptarlo
        const usuario = await Usuario.findById( uid ); // obtengo id puedo - solicito objeto del user

        if ( usuario ) {
            if ( usuario.estado ) { // true en esta implenetacion de REstSErver segnifica user existe no fue borrado o desactivado la cuenta
                return usuario;
            } else {
                return null;
            }
        } else {
            return null;
        }

    } catch (error) {
        return null;
    }

}




module.exports = {
    generarJWT,
    comprobarJWT
}

