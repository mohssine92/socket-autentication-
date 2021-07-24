const { response } = require('express');
const { ObjectId } = require('mongoose').Types;

const { Usuario, Categoria, Producto } = require('../models');

const coleccionesPermitidas = [
    'usuarios',
    'categorias',
    'productos',
    'roles'
]; // aqui viene todas las colecciones al que voy a permitir hacer busquedas , asi en request  si viene nombre de coleccion que no esta definida respondo con error . 



// porque recibo res y lo defino como  response , paraque desde esta funcion tambien puede mandar la respuesta 
const buscarUsuarios = async( termino = '', res = response ) => {

    /* En termino : puedo recibir nombre de user , pues la respuestas pueden variar si hay varios users con mismo nombre , pero en caso los del frontend necesitan objeto de un user especifico debo manejar otra posible
                    busqueda por id  */


    // manejar busqueda por idmongo validd
    const esMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( esMongoID ) {
        const usuario = await Usuario.findById(termino);
        return res.json({
            results: ( usuario ) ? [ usuario ] : []  // cuando el id de mongo es valido pero no encuentra registros por default return null , yo no quiero null , por eso uso ternario en caso de.. me returno [] vacio

        }); //en este caso solo en mi respuesta sera un objeto , pero quiero que mis respuesta todas funcionan igual : paraque el desarollador del frontend saber instantaneament como trabajar con mis busquedas por eso lo meti en []
    }


    /* Occupamos Expresion Regular : evitar la busquedas sensible por mayuscula y miniscula , y traer todos objeto % Termino % aprox
     * este expresion regular viene e js por ello no hay que importar nada 
     * i : segundo arg decirle que sea insensible a las mayusculas y minisculas 
    */ 
    const regex = new RegExp( termino, 'i' );

    // busqueda por nombre - fijare en req de busqueda recibo @test: suele estar en el campo de correo , pues aqui debemos usar (or-and) en nuestras busquedas incluir todos cambos que voy a necesitar en mis busquedas
    const usuarios = await Usuario.find({
        $or: [{ nombre: regex }, { correo: regex }],  // Tambien se puede hacer asi : [{ nombre: regex, { estado: true } }, { correo: regex, { estado: true } }]
        $and: [{ estado: true }]  // alternativa de repeticion { nombre: regex, { estado: true } } es decir tiene que cumplir con el estado en ambas busquedas

        /* $nor : es negacion , $where .. propios de mongo para filtrar busquedas , minimizar busquedas y maximizar busquedas*/
    });

    // si quiero countar cuantas respuestas hay incluimos :
    const usuariosTotal = await Usuario.count({
        $or: [{ nombre: regex }, { correo: regex }], 
        $and: [{ estado: true }] 
    });



    res.json({
        Total: usuariosTotal,
        results: usuarios
    });

}

const buscarCategorias = async( termino = '', res = response ) => {
    /* en esta funcion la busqueda sera por id de la categoria o por nombre de la cartegoria cumpliendo con el estado true */

    // busqueda de una categoria por id
    const esMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( esMongoID ) {
        const categoria = await Categoria.findById(termino);
        return res.json({
            results: ( categoria ) ? [ categoria ] : []
        });
    }
    
    // expresion regular
    const regex = new RegExp( termino, 'i' );

    const categorias = await Categoria.find({ nombre: regex, estado: true }); // puedo agregar populate para obtener data del user creador de la categoria
    const Total = await Categoria.count({ nombre: regex, estado: true });

    res.json({
        Total,      
        results: categorias
    });

}

const buscarProductos = async( termino = '', res = response ) => {

    const esMongoID = ObjectId.isValid( termino ); // TRUE 

    if ( esMongoID ) {
        const producto = await Producto.findById(termino)
                            .populate('categoria','nombre')
                            .populate('usuario','nombre');
        return res.json({
            results: ( producto ) ? [ producto ] : []
        });
    }
    
    // ecpresionm regular
    const regex = new RegExp( termino, 'i' );

    // si quiero incluir mas prop en la busqueda ver la funcion buscarUsuarios alli tenemos ejemplo . uso de or , buscar por precios , por matricula de coche cuando se trata de coches como productos son muchos las props para filtrar
    const productos = await Producto.find({ nombre: regex, estado: true })
                            .populate('categoria','nombre')
                            .populate('usuario','nombre');

    //console.log(productos.length)                        

    const Total = await Producto.count({ nombre: regex, estado: true })
             
                               

    res.json({
        Total,
        results: productos
    });

   
}

// TODO : crear otro endpoint de busqueda que sirva para buscar productos de cierta categoria por su id  ver la nota video 176 


// Controlador de busquedas : es decir en los segmentos de url recibimos busquedas en campos en la coleccion fuente de Mongodb en este caso 
const buscar = ( req, res = response ) => {
 
    // desestructuracion de objeto request : extraer los argumentos que vienen en la ruta .
    const { coleccion, termino  } = req.params;
   
    // validacion 
    if ( !coleccionesPermitidas.includes( coleccion ) ) {
        return res.status(400).json({

            err: `The ${ coleccion } is not allowed as a collection `,
            msg: `The allowed collections are:  ${ coleccionesPermitidas }`
        })
    }


    switch ( coleccion ) {  // implementar possibles colecciones
       
        case 'usuarios':
           buscarUsuarios(termino, res);
        break;
        case 'categorias':
            buscarCategorias(termino, res);
        break;
        case 'productos':
            buscarProductos(termino, res);
        break;

        default:
            // en este caso como es el caso de role , estoy pemitiendo la coleccion pero no he implementado la opcion , asi el desarollador frontend tiene que contactarme para hacer la implementacion del mismo .
            res.status(500).json({  // recuerda status 500 es problema del servidor , es problema del que esta haciendo backend 
                msg: ' forgot to do this search - please advise backend developer '
            })

    } 

    

}



module.exports = {
    buscar
}  