const { Schema, model } = require('mongoose');

const ProductoSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
       /*   no me parece logico tener nombre en campo unico */
    },
    estado: { // aqui si , si es false como lo hubiera eleminado es decir fuera eleminado pero mantengo la integridad referencial  
        type: Boolean,
        default: true,
        required: true
    },
    usuario: {
        type: Schema.Types.ObjectId,  // id mongoose
        ref: 'Usuario', // modelo referencia
        required: true
    },
    precio: {
        type: Number,
        default: 0
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',  // modelo referencia
        required: true
    },
    descripcion: { type: String },
    disponible: { type: Boolean, defult: true }, // si esta false no segnifica que esta eleminado , segnifica que no tengo en el stock o el servicio producto no esta disponible por el memento o use un producto por temporada
    img:{ type: String }, // la acabo de añadir y ya , ahora le puedo asignar img al producto 
});



ProductoSchema.methods.toJSON = function() {
    const { __v, estado, ...data  } = this.toObject(); // en este caso no quiero emitir de forma global a Todos los servicios que interectuan con este  modelo las props desestructuradas de data .
    return data;
}  // __V : version 


module.exports = model( 'Producto', ProductoSchema );
