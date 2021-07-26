// toda la logica de google sigin : 

// si tenemos 2 form : esta seleccion tomaria el primero , en este caso tenemos solo uno 
const miFormulario = document.querySelector('form');

// como voy a estar desplegando y en mismo tiempo trabajando en loacal . voy a tarbajar con ternario captar en que url me encuetro
    // console.log(window.location.hostname.includes('localhost'))
    var url = ( window.location.hostname.includes('localhost') )
                    ? 'http://localhost:8089/api/auth/'
                    : 'https://marocmaroc.herokuapp.com/api/auth/'; 




   // autenticacion manual atraves del form 
   miFormulario.addEventListener('submit', ev => {
      ev.preventDefault(); 
      const formData = {}; 
  
     for( let el of miFormulario.elements ) { // en teoria seria 3 elementos , button tambien : elementos que tenga ese form , en este caso cogo elementos que tengan attribute name 
          if ( el.name.length > 0 ) 
              formData[el.name] = el.value // relleno de un Objeto 
     }
     console.log(formData);
     //console.log( url+'login' );

     // peticion fetch
     fetch( url + 'login', { // postman ver el end-point
        method: 'POST',
        body: JSON.stringify( formData ),
        headers: { 'Content-Type': 'application/json' }
     })
     .then( resp => resp.json() )
     .then( ( { msg ,token , usuario } ) => { // si se autentica con exito , backend , me genera un json web token 
      // console.log(token);
      // console.log(usuario);
      // console.log(msg);
       
        if( msg ){
            return console.error( msg );
        } 
  
        localStorage.setItem('token', token);  // graba , cae encima del anterior : misma variable mismo nombre ; cae encima
        window.location = 'chat.html'; 
    })
    .catch( err => {
        console.log(err)
    })  
    
   });


     /* autenticacion de goole */
    function onSignIn( googleUser ) {

       /* lo comentado es lo que me manda API de google , por integracion , end to end  */
       // var profile = googleUser.getBasicProfile();
       /*  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present. */


        var id_token = googleUser.getAuthResponse().id_token;

        // meter el id_token que es string en un objeto literal . la data tiene que estar en el formato que yo esperaba .
        const data = { id_token };
       // console.log('aquiiiiiii',id_token ) 

        // peticion al back-end - disparo fech , no hay que importar nada porque viene en los navigadores modernos .
        fetch( url + 'google' , {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' }, // estoy esperando en RestServer que la data viene en formato Json , asi en los header de la peticion post ...
           body: JSON.stringify( data ) // el body en una application/json tiene que ir serializado como un json 
        })
        .then( resp => resp.json() ) // porque la respuesta tambien tengo que serializarla .
        .then( ({ token }) => {
           console.log('<informacion viene de nuestro server>', token );
           localStorage.setItem('token',token); // token va ser recuperado en la pagina html donde se va a conectar con server socket , 
           //window.location = 'chat.html';

        }) // totalmento puedo enacadenar , asi el returno de primer then esta recibido en data .(objeto de user cliente autenticado con exito)
        .catch( console.log );


    }   

    function signOut() { // desconectar
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        console.log('User signed out.');
      }); 
    }


