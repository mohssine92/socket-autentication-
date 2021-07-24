const { response } = require('express');
const { Producto } = require('../models');


const obtenerProductos = async(req, res = response ) => {
    // la mmisma logica de obtener categorias

    const { limite = 5, desde = 0 } = req.query; // => q url 
    const query = { estado: true };

    const [ total, productos ] = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
            .populate('usuario', 'nombre')  // id + nombre
            .populate('categoria', 'nombre') // id + nombre
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.json({
        total,
        productos
    }); 
 
    
}

const obtenerProducto = async(req, res = response ) => {

    const { id } = req.params;
    const producto = await Producto.findById( id )
                            .populate('usuario', 'nombre')
                            .populate('categoria', 'nombre');

    res.json( producto );

}

const crearProducto = async(req, res = response ) => {

    const { estado, usuario, ...body } = req.body; // el estdo , usuario no lo puede cambiar el user autenticado

   /*Asegurar el producto no existe en caso no quiero tener mismo producto dos veces , pero lo mas probable cuando se trata de ecommerce en un systema donde va a vender varios vendedores no importa nombre
     del producto , pueda que 100 vendedor venden  iphone . 
    *
    */
    /* const query = body.nombre.toUpperCase()
    const productoDB = await Producto.findOne({ nombre: query }); 
    if ( productoDB ) {
        return res.status(400).json({
            msg: `El producto ${ productoDB.nombre }, ya existe`
        });
    } */ 
    /* esta parte la voy a aquitar no me parece logco tener un capo unic de un producto , luego al borralo sera false , y luego esta borardo y otro user no puede crera mismo nombre que es relmente 
    no existe esta es la razon . */




    // TODO : validar si viene campo disponible , si viene tiene que ser boolean , sino respuesta 400 . porque el campo esta configurado a recibir boolean si viene otro valor se cae el systema 

    // Generar la data a guardar
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id // id del user creador captado desde desde jwt
    }

    const producto = new Producto( data );

    // Guardar DB
    await producto.save();

    res.status(201).json(producto);
 

}

const actualizarProducto = async( req, res = response ) => {

    const { id } = req.params; // id producto  url/:id
    const { estado, usuario, ...data } = req.body; //no puedo permitir actualizar usuario , esatado  manualmente 

     

    if( data.nombre ) {
        data.nombre  = data.nombre.toUpperCase();
    } // los demas campos como precio etc no me importa capitalizarlos , y otros cambos se asigna de manera programatica como user relacion al producto 

    data.usuario = req.usuario._id; // user autenticado , usuario se actualza de manera programatica

    const producto = await Producto.findByIdAndUpdate(id, data, { new: true }); // { new: true } : devuelveme documento actualizado 

    res.json( producto );

}

const borrarProducto = async(req, res = response ) => {

    const { id } = req.params; // url/:id
    const productoBorrado = await Producto.findByIdAndUpdate( id, { estado: false }, {new: true });

    res.json({ 
     productoBorrado,
     msg : "producto fue borrado con exito , na va a parecer en la lista de los productos" 
    
    });
}




module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    borrarProducto
}