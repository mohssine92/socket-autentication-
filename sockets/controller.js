const { Socket } = require("socket.io")
const { comprobarJWT } = require('../helpers');
const { ChatMensajes } = require('../models');

// Recordar este archivo se ejecutara solo una vez cuando el servidor se levanta 
const chatMensajes = new ChatMensajes();



/* como no estamos trabajando en Ts : no tenemos apoyo , asi usamos : socket = new Socket() : pero no se debe ser en produccion solo en desarollo
 * asi recordar quitarlo , en desarollo me ayuda , pero en otros 
 * io : 2arg => es la referencia a todo el serviderSocket
 * Tener en cuenta esta funcion es controlador de socketServer : se ejecuta al levantar servidor por primera vez y cuando un cliente socket se conecta al servidorSocket : es decir cuando se llega a dispararse io() funcion por parte del cliente */
const socketController = async( socket = new Socket() , io ) => { 
  //console.log('cliente conectado', socket.id ) para aprobar la conexion correcta con el  cliente
  /* aqui recibimos token cuando un cliente se connecta  - */
  // const token = socket.handshake.headers['x-token']; // ver vota de 230 , computacion de objeto
  // console.log(token);


  /* validacion token , si exista : traer objeto del user que acaba de connectar a nuestro serverSockets */
    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    if ( !usuario ) {
      // de esta manera desconecto este cliente socket a mi serverSocket : porque no me tare Objeto de usarrio por razones de JWT invalido , asi desconectar , no quiero saber nada del cliente etc etc ...
      return socket.disconnect();
    }


   /* console.log('se conecto ', usuario.nombre );
    * en este punto un cliente socket esta conectado este es el punto perfecto para emitir a las sockets conectados al serverSockets que estoy conectado : 
    * por el caso de emitir solo a mis lisata de amigos y no toda la red globar debo manejar un modelo para clientes amigos , clientes lista de espera , 
    * sera la misma logica para grupos , como hace facebook twiter etc ...
   */
   console.log('se conecto ', usuario.nombre );

   // Agregar el usuario conectado : empujar en este caso 
   chatMensajes.conectarUsuario( usuario );

   // la referencia al servidor de socket : es decir sera una emission global a todos clientes conectados a la red : disparo del evento siempre cuando se conecta algun socket ..
   io.emit('usuarios-activos',  chatMensajes.usuariosArr );
 

   // tambien cuando se conneta nuevo socket le mando imendiatamente los ultimos 10 mensajes de los demas sockets : solo a esa persona ser
   socket.emit('recibir-mensajes', chatMensajes.ultimos10 );

   /* para mandar mensaje privado a alguien : socket.id : es del target desatino : este id muy volatil se cambia rapido al refreshdel navigador 
    *  lo que hace no me vale , id del socket no sirve para mandar mensaje privado a alguien cliente , usamos otra alternativa   
    *  usamos uid del user autenticado , conectado con exito .
   */
    
    // Conectarlo a una sala especial : el cual nombre de esa sala sera el nombre del id del usuario a quien va mandar mensaje
    // incluso podemos mandar una collecion para que se conectada a todas las salas que ustedes quieran .
    // en este caso voy a connectarlo a una sala se llama usuario.id
    // todos socket que se conectan tendra id de user : lo cual de manera sincrona al connectrase tendran una tercera sala , mas las salas golbal por defecto etc ..
    // recuerda que todos mis usuarios estan identificados por uid en esta sala privada gracias a ese codigo 
     socket.join( usuario.id ); // global, socket.id, usuario.id < === 3 salas de chat 
   
   /* Limpiar la memoria  cuando alguien se desconeta : + otro caso refresh del nav dispara este evento : si el socket pasara la validacion JWT valido vuelve a 
     a conectar con el  serverSocket en breve , sino no llega a disparar conexion . io() al serverSocket por el entorno del cliente 
    * nota como refresh desconecta y vuelva a conectar el posicion del array se cambia el ultimo en refresh  se borra se vuelva a embujarse en el array como ultimo socket en conectarse
     */
   socket.on('disconnect', () => {
     console.log('**************************desconnected*****************')
     chatMensajes.desconectarUsuario( usuario.id ); // borrar usuario de la memoria
     io.emit('usuarios-activos', chatMensajes.usuariosArr ); // vuelvo a emitir la memoria de los activos actualizadas - el mismo ser socket no tendra posiblidad de jecutar ese controller .: por validacion JWT en parte del cliente 
   })


   /* serverSocket esta escuchando : custom evento from cient 
    * servidor recibe enviar mensaje : quiero madar a todo el mundo a una persona queda a nuestro discreccion 
   */
   socket.on('enviar-mensaje', ({ uid, mensaje }) => {
        
     if ( uid ) {
         // si recibo eso segnifica que va ser mensaje privado : Mensaje privado . 
         socket.to( uid ).emit( 'mensaje-privado', { de: usuario.nombre, mensaje });
     } else {
      chatMensajes.enviarMensaje(usuario.id, usuario.nombre, mensaje );
      io.emit('recibir-mensajes', chatMensajes.ultimos10 ); // io es ek serverSocket mismo
     }
  
   })







}


module.exports = {
  socketController
}