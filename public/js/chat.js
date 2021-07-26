const url = ( window.location.hostname.includes('localhost') )
            ? 'http://localhost:8089/api/auth/'
            : 'https://restserver-curso-fher.herokuapp.com/api/auth/';
            
            
// todavia no existen etc ..  
let usuario = null; // info del user autenticado 
let socket  = null; // informacion del socket


// Referencias HTML
const txtUid     = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir   = document.querySelector('#btnSalir');



// Validar el token del localstorage : alli donde se almacena al mimento de logearse 
const validarJWT = async() => {

    const token = localStorage.getItem('token') || '';

    if ( token.length <= 10 ) {

        /* la redericcion seran depende del frmwork , en angular seriA podemos crear un gard o si en React creamos un componente especializado .. 
         * !!segun cuando se haga refresh y el token esta mal , se corta aqui y no se reejecuta io() : la conexion al servidor : asi el servidorSocket 
         * el servidor por default al hacer refresh se desconecta al socket y se vuelva a conectar - y como es el caso se corta aqui no vuelva a conectar
         * lo que hace dispara esucha por parte del socket server !!
        */
       // window.location = 'index.html';
        throw new Error('No hay token en el servidor'); 
    }

    /* esta peticion puede dispara un err , cuando un token no existe etc , podemos implementar el caso ...sacando el user de esta pantalla 
     * tambien por el tema del err como son promesas podemos implementar try y catch para hacer redirection al index si sale algo mal 
    */
    const resp = await fetch( url, { // get por default 
        headers: { 'x-token': token }
    }); // ene caso de borrar token , en este punto se para ele proceso por validacion por parte del back
    //console.log(resp)

    const { usuario: userDB, token: tokenDB } = await resp.json(); 
    localStorage.setItem('token', tokenDB );  // asi damos nueva vida al token 
    console.log('JWT veriffivado , renovado , seteado en storage'); console.log('onjeto user y su JWT',userDB, tokenDB );
    usuario = userDB; // ya sabemos quien es el user el que esta logueado en la app 
    document.title = usuario.nombre; // title de html 

    

    /* despues de  la validacion  y renovacion de JWT , llega el momento de connectar al server de Sockets , puesto que ya tengo el Objeto User que se va a intentar a connectar
     * DE TODA FORMA so dio algun err por validacion no llegara a dispara esa funcion .
    */
    await conectarSocket();

 
    
}


 /* como hacemos validacion JWT contra nuestros sockets Tambien 
  * llamar a la funcio io() : estoy diciendo al cliente que se conecte al serverSockets pero no se que user es !!
  * 
*/
const conectarSocket = async() => {
    
    /* conectar cliente socket a serverSockets
     * mando el JWT : que es suficiente para mi backend para obtener informacion de la db del user  
     * ya sabemos la informacion que dispara io() , va caller en mi arg socket en el controlador del serverSockets .  
     */
    socket = io({ // puede ir a la documentacion de socket io para ver que informacion puedo mandar y expandir conocimiento  
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });


    /* de aqui a adelante despues del io() : conexxion  ,  puedo crear los eevntos cuando ese socket se dipare
     * que Eventos voy a necesitar ? : 
     * socket.on() => escuhar , socket.emit => emitir al servidor ,
    */

    socket.on('connect', () =>{ // en este evento puedo mandarle mensaje al usuario que se connecto 
        console.log('Sockets online')
    });

    
    /* para no confundir - si borro token del socket y actualizo navigador  */
    socket.on('disconnect', () =>{ // ecuchar cuando el servidor cae : se desconecta se dispara este event
        console.log('Sockets offline')
    });



    //socket.on('recibir-mensajes',/*  dibujarMensajes */ (payload) =>{
    //     console.log(payload)
    //  }); 
    socket.on('recibir-mensajes', dibujarMensajes );




    socket.on('usuarios-activos', dibujarUsuarios ); // necesito estar eschuchando los user activos cada vez que se activo alguno de ellos , 

     // estar escuchando si alguien me quiere mandar mensaje privado 
    socket.on('mensaje-privado', ( payload ) => {
        console.log('Privado:', payload )
    });


} 

/* Recurdan siempre esto siempre depende del framwork que estamos usando en front-end 
 * usuarios = [] => payload : es lo que emite serverSocket hacia el event donde definimos este metodo
*/
const dibujarUsuarios = ( usuarios = [] ) => {

    let usersHtml = '';
    usuarios.forEach( ({ nombre, uid }) => {

        usersHtml += `
            <li>
                <p>
                    <h5 class="text-success"> ${ nombre } </h5>
                    <span class="fs-6 text-muted">${ uid }</span>
                </p>
            </li>
        `; // hacer un template string multi-linea
    });

    ulUsuarios.innerHTML = usersHtml;

}

const dibujarMensajes = ( mensajes = []) => {

    let mensajesHTML = '';
    mensajes.forEach( ({ nombre, mensaje }) => {

        mensajesHTML += `
            <li>
                <p>
                    <span class="text-primary">${ nombre }: </span>
                    <span>${ mensaje }</span>
                </p>
            </li>
        `;
    });

    ulMensajes.innerHTML = mensajesHTML;

}


txtMensaje.addEventListener('keyup', ({ keyCode }) => {
    
    const mensaje = txtMensaje.value; // valor input
    const uid     = txtUid.value;
    //console.log(uid , '=>' , mensaje);

    if( keyCode !== 13 ){ return; } // es code de tecla enter

    if( mensaje.length === 0 ){ return; }

    socket.emit('enviar-mensaje', { mensaje, uid } ); // emission personalizada al serverSocket

    txtMensaje.value = ''; 
   //  txtUid.value = '';

})


const main = async() => {
    // Validar JWT
    await validarJWT();
}

main();








 
/* btnSalir.addEventListener('click', ()=> {

    localStorage.removeItem('token');

    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then( () => {
        console.log('User signed out.');
        window.location = 'index.html';
    });
}); */






/* (()=>{
    gapi.load('auth2', () => {
        gapi.auth2.init();
        main();
    });
})();
 */






