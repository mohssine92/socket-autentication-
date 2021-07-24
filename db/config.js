const mongoose = require('mongoose');


const dbConnection = async () => {

   try {

    await mongoose.connect( process.env.MONGODB_CNN, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });

    console.log('base de datos online')


   }catch(err) {
       console.log(err);
       throw new Err('Error a la hora de iniciar la base de datos');
   }

 
}


module.exports ={
    dbConnection
}