const { Schema, model } = require('mongoose');





const UsuarioSchema = Schema({
    
  nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio']
  },
  correo: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true
  },
  password: {
      type: String,
      required: [true, 'El password es obligatorio']
  },
  img: {
     type: String,  
  },
  rol: {
    type: String,
    required: true,
    default: 'USER_ROLE',
    emun: ['ADMIN_ROLE', 'USER_ROLE'] // role sera uno de los 2 ,  
  },
  estado: {
    type: Boolean,
    default: true
  },
  google: {
    type: Boolean,
    default: false
  }

})

// TODO : crear una prop boolean interna del modelo , sirve como punto de referancia en desactivar cuenta Temporalmente , asi la misma sera usada en las validacion de los mdlr
// es decir los servicios de autenticacion y el servicio de pefil seran accesibles y los demas no , mimso user autenticado tendra permiso de activar y desactivar su cuenta .  



// Reecribir metodo de monngose asi quito campos que no quiero devolver globalmente y renombrar , y quitar las prop internas del objeto que no me interesa que van como salida a los servicios relacionados es este modelo
UsuarioSchema.methods.toJSON = function() {
  const { __v, password, _id , ...usuario  } = this.toObject();
  
  usuario.uid = _id; 
  // extraer _id , crear proo nueva uid , asi quiero regresar como uid en el objeto, video 143

  return usuario;
}



// compilar  nuestra esquema en un modelo  => asi Usuario es una class .
module.exports = model('Usuario', UsuarioSchema );