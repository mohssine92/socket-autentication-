const fs   = require('fs');  // recuerda las imporatacion propias de node siempre al inicio solo para ordenar trabajo
const path = require('path');


const { response , request } = require('express'); // asi tengo el tipado es totalmente opcional
const { subirArchivo ,  verificarExtension } = require('../helpers');  // index

//194 fh 
var cloudinary = require('cloudinary').v2 // => objeto de cloudinary
// configurar nuestra cuenta paraque cloudinary o sdk sepa que ususario esta usando - listo ya tengo mi backend autenticado con cloudinary  service 
cloudinary.config( process.env.CLOUDINARY_URL ); 


const { Usuario,
        Producto } = require('../models');



/* lo que hace este servicio nada mas subir archivo en el servidor de node nada mas */        
const cargarArchivo = async(req = request , res = response) => {
   
     
    try {
       // console.log(req.files)
       
        
        // opcion 1 : no le paso nada como 2 arg si quiero occupar img 
        // const nombre = await subirArchivo( req.files ); 
        const nombre = await subirArchivo( req.files , undefined , 'img' ); 

         // opcion 2 : madra extenciones permitidos
         //const nombre = await subirArchivo( req.files , ['txt','md'] ); 

         // Opcion 3 : especidicar extensiones , y 3 arg especificar carpeta
         // const nombre = await subirArchivo( req.files , ['txt','md', 'sql'], 'text' );  
         // const nombre = await subirArchivo( req.files, undefined, 'imgs' );

         res.json({ nombre });  
        
      
    } catch (msgErr) {
        res.status(400).json({ msgErr });
    } // catch - msgErr : para recibir emission de msgErr

}



/* 
 * este servicio me permite subir imagen al filesystem : almacenamiento en servidor node y actualizar la referencia al archivo en db tanto guarda por la primera vez en su coleccion correspondiente - era por fines elustritivos : porque heroku va borrando patshs de imagenes
*/
const actualizarImagen = async(req, res = response ) => {

    try {
    
     const { id, coleccion } = req.params;   // /:collecion/:id
        //console.log(req.files.archivo)
        
        // Verificar la existencia del id en la coleccion , la logica si el id no existe pues no haya nada que actualizar -couper 
    
        let modelo;  // la declaro porque voy a establecer su valor de forma condicional
    
        switch ( coleccion ) {
    
            case 'usuarios': // coleccion permitida
                modelo = await Usuario.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `Does not exist User whit this id : ${ id } in this collection `
                    });
                }
            
            break;
    
            case 'productos':  // coleccion permitida
                modelo = await Producto.findById(id);
                if ( !modelo ) {
                    return res.status(400).json({
                        msg: `Does not exist Product whit this id : ${ id } in this collection`
                    });
                }
            
            break;
        
            default:
                return res.status(500).json({ msg: 'I forgot to validate this'}); // 500 es error mio
        } 
    
        // ahora se que tanto modelo usuarios como productos tienen una prop que es img 
        // y tambien si la prop img tiene valor es el momento correcto de borrar dicho valor desde file system antes de hacer nueva subida + actualizacion en db .  
    
     
        // Limpiar imágenes previas basura - Borrar el archivo del servidor 
         if ( modelo.img ) {
            // Hay que borrar la imagen del servidor porque en db se actualiza , asi la anteriror no tiene porque sigua en servidor de node 
            const pathImagen = path.join( __dirname, '../uploads', coleccion, modelo.img );
            if ( fs.existsSync( pathImagen ) ) { // pregunto si existe , regresa un true : yaque puede que haya sido eleminado
                 fs.unlinkSync( pathImagen ); // en caso de existir a borra - paraque enseguida sera nueva subida segun proceso de este servicio
            }
        }  // una nota : mientras menos archivos tenemos en la carpeta , mas rapido su lectura va ser ,
  

         const nombre = await subirArchivo( req.files, undefined, coleccion ); // 3 arg es nombre de la carpeta desde uploads - la idea crear carpeta de archivos depende de la coleccion - si trato de pdf : creo otro endpoint y yasta
         modelo.img = nombre; // nombre es depende del return de subirArvhivo , segun hemos implementado : va ser nuevo nombre de la imagen , para proyectos grandes podemos crear carpetas con colecciones concatenamos fetchas del mes y año 
      
        /* Guardar en DB
           como modelo sigue siendo instancia de algun modelo recien instanciado acabamos con save .: */
           await modelo.save();
      
      
          res.json( modelo );
   
    } catch (msgErr) {
         res.status(400).json({ msgErr });
    } // catch - msgErr : para recibir emission de reject()
}

/* 
 * de aqui mas delante usamos este servicio que va subiendo los archivo en servicio externos Cloudynary
*/
const actualizarImagenCloudinary = async(req, res = response ) => {

   try{
      
      const { id, coleccion } = req.params;

      let modelo;

      switch ( coleccion ) {
          case 'usuarios':
              modelo = await Usuario.findById(id);
              if ( !modelo ) {
                  return res.status(400).json({
                      msg: `No existe un usuario con el id ${ id }`
                  });
              }
          
          break;
  
          case 'productos':
              modelo = await Producto.findById(id);
              if ( !modelo ) {
                  return res.status(400).json({
                      msg: `No existe un producto con el id ${ id }`
                  });
              }
          
          break;
      
          default:
              return res.status(500).json({ msg: 'Se me olvidó validar esto'});
      }


       // Verificacion de extensiones 
       const valid = await verificarExtension(req.files);
       console.log(valid);

  
      // Limpiar imágenes previas
      if ( modelo.img ) {  // tener en cuenta que modelo es una instancia un modeloMonggose de mi back-end iniciada . 
          const nombreArr = modelo.img.split('/');
          const nombre    = nombreArr[ nombreArr.length - 1 ]; // nicesito ultimo posicion
          const [ public_id ] = nombre.split('.');  // array -> desestructuracion de array -> doy nombre qu quiero 
          cloudinary.uploader.destroy( public_id );  console.log('a borrar',public_id ); //  public_id => es lo que necesito para eleminar archivo desde el servicio cloudinary 
      }   
 
       /* en la prop extraeda es una path donde se encuentra mi archvo almacenado temporalmente -asi paso de almacenarlo temporalmente de mi servidor de node 
        *  asi paso el path temporal al servico de cloudynary
       */
       const { tempFilePath } = req.files.archivo;  console.log(req.files.archivo)
       const { secure_url } = await cloudinary.uploader.upload( tempFilePath ); // hay muchas cosas que puede subir : pasa a upload()
       modelo.img = secure_url; // asignacion de prop en el objeto del modelo 
   
       await modelo.save(); // guardar en db que es otro servico externo de mongo atlass 


       res.json( modelo );

  } catch (msgErr) {
     res.status(400).json({ msgErr });
  }   // catch - msgErr : para recibir emission de reject()

}



const mostrarImagenCloudinary = async(req, res = response ) => {

    // utl params /:coleccion/:id etc ... 
    const { id, coleccion } = req.params;
 

    // Validacion del id del objeto en la coleccion
    let modelo;

    switch ( coleccion ) {
        case 'usuarios':    // puede creceer depende de las colecciones deseamos permitir

            modelo = await Usuario.findById(id);
            if ( !modelo ) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${ id }`
                }); 
            }
        
        break;

        case 'productos':
            modelo = await Producto.findById(id);
            if ( !modelo ) {
                return res.status(400).json({
                    msg: `No existe un producto con el id ${ id }`
                });
            }
        
        break;
    
        default:
            return res.status(500).json({ msg: 'Se me olvidó validar esto'}); // este en caso : tengo permitida una coleccion y no se encuentra en el case
    }


    // veridicar si existe 
    if ( modelo.img ) {  //tener en cuenta que modelo es una instancia de un modelo de mongoose - img con valor == true
       console.log(modelo) 
       const {_id:id , img } = modelo;
       return res.json({
         id ,
         img})
      
    }
 
    // en caso de que el  id objeto existe en la coleccion , pero el objeto  no tiene definida la prop img 192
    // res.json({msg: 'falta placeholder'})
    const pathImagen = path.join( __dirname, '../assets/no-image.jpg'); 
    res.sendFile( pathImagen );
    
}
// TODO : crear otro servicio elemina img desde cloudynari y actualiza la prop del modelo por img por default depende de la coleccion de que se trata si coleccion user se remplaza con img user por default , si producto se remplaza con img product por default . 

// TODO : añadir un helpers para los servicos de claudinary para verificar tipo de archivo es decir extencion , esta validacion la tenemos en los otros servicio de subir el archivo en mismo servidor de node .



/* este servicio carga la imagen en el fron-end - obviamente la imagen en este caso esta subida en este mismo servidor back-end lo que no nos va a valer en heroku 
   porque heroko elemina las carpetas de archivos - por ellos vamos a usar servicio externo en back-end */
const mostrarImagen = async(req, res = response ) => {

    // utl params /:coleccion/:id etc ... 
    const { id, coleccion } = req.params;
 

    // Validacion del id del objeto en la coleccion
    let modelo;

    switch ( coleccion ) {
        case 'usuarios':    // puede creceer depende de las colecciones deseamos permitir

            modelo = await Usuario.findById(id);
            if ( !modelo ) {
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${ id }`
                }); 
            }
        
        break;

        case 'productos':
            modelo = await Producto.findById(id);
            if ( !modelo ) {
                return res.status(400).json({
                    msg: `No existe un producto con el id ${ id }`
                });
            }
        
        break;
    
        default:
            return res.status(500).json({ msg: 'Se me olvidó validar esto'}); // este en caso : tengo permitida una coleccion y no se encuentra en el case
    }


    
    if ( modelo.img ) {  //tener en cuenta que modelo es una instancia de un modelo de mongoose - img con valor == true
       
        const pathImagen = path.join( __dirname, '../uploads', coleccion, modelo.img ); // construir el path despeus de completar las validaciones necesarias 
        console.log(pathImagen)
        if ( fs.existsSync( pathImagen ) ) {
            return res.sendFile( pathImagen ) // !!!! va returnar un path para la carga de file desde cualquier framwork : lo genial de esto estamos occultando extension , ubicacion en el servidor de node  etc ..
        }

    }
 
    // en caso de que el  id objeto existe en la coleccion , pero el objeto  no tiene definida la prop img 192
    // res.json({msg: 'falta placeholder'})
    const pathImagen = path.join( __dirname, '../assets/no-image.jpg'); 
    res.sendFile( pathImagen );
    
}



module.exports = {
    cargarArchivo,
    actualizarImagen,
    mostrarImagen,
    actualizarImagenCloudinary,
    mostrarImagenCloudinary
}
/* segun hemos visto hasta ahora las funciones controlers se exportan para el uso en el archivo de routes relacionado  */