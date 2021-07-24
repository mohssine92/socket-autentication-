const { response } = require("express")


const validarArchivoSubir = (req, res = response, next ) => { // lo que hace solo verificar si en request viaja un file de cualquier tipo

    // Object.keys(req.files).length === 0 : es para sabes cuantos objetos hay dentro del objeto calculado

 
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.archivo ) {

       // en este caso voy a estar subiendo archivo por archivo y cada archivo viene del front-end voy a estar esperandolo en una propiedad se llama 'archivo'
       // const { archivo } = req.files;  console.log(archivo)


        return res.status(400).json({
            msg: 'No files to upload - archivo .'
        });
    }
    console.log(req.files.archivo)
    next(); // => al siguiente instruccion 
     
}


module.exports = {
    validarArchivoSubir
}
