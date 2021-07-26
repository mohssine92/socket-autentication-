/* aqui voy a manejar mensajes y tambien quien son estan connectados . cer nota para tema de chat avanzado 
 * NB :  recordar JWT se comparta por todas instancias de in navigados , para tener mas users debes tener diferentes navigadores
*/

class Mensaje {
    constructor( uid, nombre, mensaje ) {
        this.uid     = uid;
        this.nombre  = nombre;
        this.mensaje = mensaje;
    }
} // sera como una classe privada , porque se usa solo en esta class : por eso no le hemos Exportado :  



// TODO : class mis amigos : con coleccion de lista de espera y coleecion de amigos y coleccion de perzonas a agragar 
/* metodos para empujar e lista de amigo al acceptar , metodo de cancelacion de solicitud 
 * estar escuchande evento que otra perzona conectada al serverSocket es decir tiene cuenta asociada el serverSocket : a la red me aggrego a la lista de perzonas a a agregar : debo disparar metodo para agregarlo a amigos 
 * y se el agrego debo returno un valor sinronamente en el ejeucion el scope del evento debo notificar al aperzona quien me agrego y instanciar modelo que lleva la logica de lista de amigos y manipularla 
 * asi ya tengo una coleccion que puedo usar como validacion es decir solo los clientes socket : solo perzonas que forman parte de esta coleccion quien puede parecer para mi si estan activos o no .
 * bueno se puede manipular esta logica por varias formas incluso creado objeto de solicitud y objeto de contactos : como hcimos con chatmensajes class , mensajes class
*/


class ChatMensajes {

    constructor() {
        this.mensajes = [];
        this.usuarios = {}; // usuarios connectados , { uid :  {} , etc ... } 
    }

    get ultimos10() {
        this.mensajes = this.mensajes.splice(0,10); // asi : tengo que insertar siempre al inicio de la coleccion  usando unshift
        return this.mensajes;
    }

    get usuariosArr() {
        return Object.values( this.usuarios ); // [ {}, {}, {}] : esta instruccion toma un objetosColeccion de objetos y lo convierta en coleccionArr de objetos : para facil de usar 
    }

    enviarMensaje( uid, nombre, mensaje ) { //  (arg :  informacion de la persona quien manda mensaje) , !! puedo grabar fecha de invio o lo que sea : instanciando objrto de fecha js + anadir por en el obejto mensaje  ... 
        this.mensajes.unshift(
            new Mensaje(uid, nombre, mensaje) // mensaje sera un objeto de tipo mensaje : asi creo intancia de mensaje y le mando informacion  y etc ...
        );
    }


    /* usuario va ser objeto de nuestro modelo usuario
     * this.usuarios es un objeto asi : [llave] = valor ==> { idmongoDb : {props user} , etc .. }
     * tambien se puede grabar en una coleccion de mongose persistente , en ves de coleccion de memoria de js : la que cuando se cae el servidor y se levante se va hacer nuesva instancia y se borra todo 
     * hemos visto bastante como como lamazenar en db y recuperar 
    */
    conectarUsuario( usuario ) {
        this.usuarios[usuario.id] = usuario ;
    }

    desconectarUsuario( id ) {
        delete this.usuarios[id]; // como tengo que computarlo lo pongo asi [] ;
    } 

    // TODO : un metodo que me returna la coleccion de users activos en caso de que se hayan sido almazenados en db , en esta implementacion solo estan en un espacio de memoria .
      
}

module.exports = ChatMensajes;