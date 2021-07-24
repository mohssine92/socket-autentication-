const { response, request } = require('express');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

// capa validacion ,  Middelware perzonalizado  se dispara con 3 args 
const validarJWT = async( req = request, res = response, next ) => {  // res = response para tener el tipado tener ayuda al escribir
 
    const token = req.header('x-token'); // console.log(token);
    
    if ( !token ) {  // primer o verificar si llega el token 
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {
        
        // desestructura  lo que esta almacenado en JWT
        // const payload =  jwt.verify( token, process.env.SECRETORPRIVATEKEY );  console.log(payload) 
        // id autenticado
        const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY ); // console.log(uid);
          
        // leer el Modelo / usuario que corresponde al uid - obtencion del usuario autenticado {} atravez del jwt
        // el usuario que va hacer la accion
        const usuario = await Usuario.findById( uid ); 
 

        if( !usuario ) {
             return res.status(401).json({
                msg: 'Token no válido - usuario no existe DB'
            })
        }

        // Verificar si el uid tiene estado true , si es false segnifica que la cuenta ususario borrada o desctivada , asi la cuenta no existe no hay logica de hacer mas acciones .
        // depende de como programamos 
        if ( !usuario.estado ) {
            return res.status(401).json({
                msg: 'Token no válido - usuario con estado: false'
            })
        }
      
      
        // lo que estoy haciendo aqui simplemente , como el objeto req viene viajando desde el cliente hacia el controller , aproveche y le asigne nueva prop interna . obviamente este objeto va pasando por los middlr .
        req.usuario = usuario; // console.log(req)


        next();
         
    } catch (error) {
        
        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        })
    }


   
}




module.exports = {
    validarJWT
}