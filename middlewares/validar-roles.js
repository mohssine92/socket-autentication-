const { response,  request } = require('express')


const esAdminRole = ( req, res = response, next ) => {
 // permite solo al administrador

    // req.usario : se asigna en el mdlt de jwt
    if ( !req.usuario ) {
        return res.status(500).json({ // 500 falla algo en mi codigo
            msg: 'Se quiere verificar el role sin validar el token primero'
        });
    }

    // recuerda usuario esta establecido en el mdl de validar-jwt - user autenticado
    const { rol, nombre } = req.usuario; 
    
    if ( rol !== 'ADMIN_ROLE' ) {
        return res.status(401).json({
            msg: `${ nombre } no es administrador - no tiene permiso de hacer esta accion `
        });
    }

    next();
}


const tieneRole = ( ...roles  ) => {
    // permite acceso solo a roles indicados 
    return (req , res = response, next ) => {
        
        if ( !req.usuario ) {
            return res.status(500).json({
                msg: 'Se quiere verificar el role sin validar el token primero'
            });
        }

        if ( !roles.includes( req.usuario.rol ) ) {
            return res.status(401).json({
                msg: `El servicio requiere uno de estos roles ${ roles }`
            });
        }


        next();
    }
}

const RoleAndmismoId = (...roles) => {


    return (req = request, res = response, next) => {
       // esta validacion permite a los roles indicados , permite al user autenticado modifiquesu objeto user como borrar su cuenta .

        if ( !req.usuario ) {
            return res.status(500).json({
                msg: 'Se quiere verificar el role sin validar el token primero'
            });
        } // si pasa esta validacion segnifica ya he validado el token y tengo el objeto de user autenticado - user en accion .

       
       const { _id } = req.usuario;   // id autenticado , user en accion
       const { id } = req.params;   // id del objeto a modificar 


        if ( roles.includes( req.usuario.rol ) || _id == id ) {
            next();
        }else{

            return res.status(401).json({
                msg: `El servicio requiere uno de estos roles ${ roles } - O mismo user `
            });

        }
    }

}
 



module.exports = {
    esAdminRole,
    tieneRole,
    RoleAndmismoId
}