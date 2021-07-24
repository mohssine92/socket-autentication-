const { Schema, model } = require('mongoose');



/* 
 Modelo para hacer interacciones con la coleccion en db y toda informacion que quiero gravabar en esta nueva collecion llamada:categoria
*/
const CategoriaSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        unique: true // no puede tener dos categorias con mismo nombre
    },
    estado: {  // atraves del estado voy a saber si existe la categoria o fue borrada
        type: Boolean,
        default: true,
        required: true
    },
    usuario: { // cuando creo una categoria necesito saber que usuario el que ha creado esta categoria 
        type: Schema.Types.ObjectId,  // ? pero el usuario de que tipo es : es decir tiene que ser otro objeto que vamos a tener en mongo .
        ref: 'Usuario',  // mantener referencia a (model : se escribe igual como en su modelo ) donde va apuntar este ObjectId
        required: true // porque todas las categorias tienen que tener un usuario 
    }
});



/* para mas detalles ver model user  - configuracion de la salida emitida de la cplleccion en  db globalmente a los servicios*/
CategoriaSchema.methods.toJSON = function() {
    const { __v, estado , ...data  } = this.toObject();
   
    return data;
}
 

module.exports = model( 'Categoria', CategoriaSchema );
