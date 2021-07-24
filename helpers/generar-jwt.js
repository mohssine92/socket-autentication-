const jwt = require('jsonwebtoken');


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




module.exports = {
    generarJWT
}

