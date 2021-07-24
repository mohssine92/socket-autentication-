const bcryptjs = require('bcryptjs');

const { response , request } = require('express');

// Imporatacion de models
const Usuario = require('../models/usuario')



// Controladores de end-points del recurso /usuarios .

const UsersGet = async (req = request, res = response ) => {
  //recibir params opcionales es decir los queries ?..&..&.. 
  // http://localhost:8080/api/users?q=232&s=11323234&apiKey=679788&name=mohssine
  // http://localhost:8080/api/users?desde=5&limit=2
  
  // const {q , apiKey , name = 'No-name', page=1 , limit} = req.query;

  // los queries son argumentos de los Segmento url .-
  const { limit= 100, desde } = req.query;
  // condicion en la consulta , filtro , true = existe , estado = false user fue borrado . 
  const query = {estado: true};



  // promise all ejecuta promesas independientes en mismo hilo de tiempo , ganar tiempo en resolver
  // sera util cuando una promesa no es depende de la respuesta de la promesa anterior
  // returna coleccion de resultados de las promesas 
  const [ totalUserStored, usuarios ] = await Promise.all([
    Usuario.countDocuments(query),
    Usuario.find(query)
        .skip( Number(desde) )
        .limit( Number(limit) )
  ]);
  /* const usuarios = await Usuario.find(query)  
                                .skip(Number(desde)) 
                                .limit(Number(limit));
 */
  // calcular total de objeto devueltos 
  //  const userStored = await Usuario.find();                             
  // const totalUserStored = userStored.length;              
  // alternativas : Retormar numero total de registros en una colleccion
  // const totalUserStored = await Usuario.countDocuments(query); 



  // la respuesta al req sera en formato Json 
   res.json({
     totalUserStored,
     usuarios
                   
   }) // ECM6 // objeto de respuesta 
  
  
 
   
}


const UsersPost = async (req = request, res = response ) => {  
  // aqui hacemos lo que hace unico mi controller , en este caso la creacion de user
  
   
   // Extraer Body
   // la informacion que manda req Objeto ya esta serializada por un middelware a un objeto json literal
   // extrago solo lo que quiro, protego ciertos cambos
   const { nombre , correo , password, rol } = req.body;


   // cualquier llave:valor llega atraves de jsonObject si no esta definida en el modelo mongose lo ingnora por mi al momento de insersacion db .
    const usuario = new Usuario({ nombre , correo , password, rol });


    //Encryptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt );// usuario es un Objeto de instancia usuario , asi por referencia podemos manipular valor de los sus llaves y su props .
 
     // Guardar objeto  usuario instancia rellenado tal cual queremos en db
     await usuario.save();

     // descomentar esta linea en caso quiero especificar las props que quiero devolver en respuesta de exito de registro 
     // const { _id  } = usuario;
     // otra alternativa  Resscribir metodo de monngose asi quito campos que no quiero devolver globalmente 
    
     
     res.status(400).json({
      // _id // ECM6
      usuario
    })
    
}

const UsersPut = async (req, res = response ) => {
  
  // recibir params url
  const id = req.params.id

 // recibir body params
  const { _id , password, google, correo , ...resto } = req.body;

 
  // TODO validar contr DB 
  if( password ) {
     //Encryptar la contraseña
     const salt = bcryptjs.genSaltSync();
     resto.password = bcryptjs.hashSync( password, salt );
     // resto es objeto literal le agrego propiedad password
  }
 
  // actualizar registro por id , return fotografia del object actualizado ,
  // para no actualizar algun campo , lo extraemos del objeto final resto .
  const usuario = await Usuario.findByIdAndUpdate( id , resto )


   res.json(usuario)
  //const pass = resto.password
   /*  res.status(201).json({
     //  content-type + status response  
      msg: 'put API - controller',
      id,
      usuario,
     pass,
      
       
    }) */
}
 
  

const UsersPatch = async (req, res = response ) => { 
 
  const { id } = req.params;

 

   // OPCION : 1
   // Fisicamente lo borramos , no es recomendable , luego se nesicita los objetos para hacer analizis para graficas del negocio
   // const usuario = await Usuario.findByIdAndDelete( id );
   
   // OPCION : 2 , objeto su estado false no sera recuperado en la coleccion de objetos existentes , asi se considera borrado , esta metodologia la podemos usar en desactivar cuentas 
   // mientras el modulo que se encarga de activar y desactivar cuentas va jugando con esta props booleana .
   const usuario = await Usuario.findByIdAndUpdate( id, { estado: false } );

 
   res.json({ usuario });
   
}


const UsersDelete = (req, res = response ) => {
   res.json({
     msg: 'patch API - controller'
   })
}


module.exports ={
  UsersGet,
  UsersPost,
  UsersPut,
  UsersPatch,
  UsersDelete
}