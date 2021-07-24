const path = require('path');
const { v4: uuidv4 } = require('uuid');

const subirArchivo = ( files,  extensionesValidas = ['png','jpg','jpeg','gif'] , carpeta = '' ) => {
  //extensionesValidas : son extenciones por defecto para una imagen , si sera un pdf o ne se que , se cambia la coleccion que se pasa por arg , asi tengo la funcion mas flecxible .
  // carpeta para indicarle que carpeta en especifico , iniciar como string vacio para no lanza undefined o algo raro

    // usualmente en estos tipo de casos cuando necesito que algo salga bieen o mal : implemento promesas , si necesito estar constantamente escuchar algo implementamos extenciones rectivas
     return new Promise( (resolve, reject) => {
  
         // Obtener extension del archivo a subir 
         const { archivo } = files;  console.log('nombre de archivo recibido',archivo.name );
         const nombreCortado = archivo.name.split('.');
         const extension = nombreCortado[ nombreCortado.length - 1 ];  
        
 
        // validar extenciones validas 
         if( !extensionesValidas.includes( extension )){ 
            return reject( `the extension ${ extension } is not valid - valid extensions is : ${ extensionesValidas }`);
         } // reject se implementa cuando no salo lo que se esperaba , se recibe en un catch al llamar esta promesa
 
 
        /*  ahora, a la hora de mover debemos ponerle un nombre , tambien colocarlo en la carpeta correcta : porque luego subo imagene perfil user , imagenes productos , pdf de facturas , tener carpetas ordenadas.
         tener en cuanta varios archivos llegan en request con el mismo nombre y yo no voy a mantener el mismo , vamos a generar a estos archivos identifacador unico : hacemos uso del paquete uuid   */
         
         // asi de sensillo podemos renombrar archivo y moverlo a la ubicacion final donde deseamos 
         const nombreTemp = uuidv4() + '.' + extension;  console.log('nombre de archivo cambiado', nombreTemp );
         
         // construir el path donde se aloje el archivo en nuestro servidor de express
         const uploadPath = path.join( __dirname, '../uploads/', carpeta , nombreTemp ); // si carpeta no recibe nada : string vacio : join suficiente inteliegente para no concatenar nada en el path
         console.log(uploadPath)
         
         // mover el archivo al path construida
         archivo.mv( uploadPath , (err) => {
            if (err) {
                reject(err);
            }

            resolve( nombreTemp ); // al user le emito solo con el nombre del archivo , no le va a servir para nada el path : porque esta en servidor servidor privado , no esta en repositorio public ...

         });
   
    }); 

  

}

const verificarExtension = ( files,  extensionesValidas = ['png','jpg','jpeg','gif'] ) => {

     return new Promise( (resolve, reject) => {

          // Obtener extension del archivo a subir 
          const { archivo } = files;  console.log('nombre de archivo recibido',archivo.name );
          const nombreCortado = archivo.name.split('.');
          const extension = nombreCortado[ nombreCortado.length - 1 ];  
         

         // validar extenciones validas 
          if( !extensionesValidas.includes( extension )){ 
             return reject( `the extension ${ extension } is not valid - valid extensions is : ${ extensionesValidas }`);
          } // reject se implementa cuando no salo lo que se esperaba , se recibe en un catch al llamar esta promesa

         
         return resolve( true ); 

       
    
     }); 
  
    
  
}



module.exports = {
    subirArchivo,
    verificarExtension
}