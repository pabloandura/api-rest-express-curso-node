// modulo depuracion
const inicioDebug = require('debug')('app:inicio');
// modulo de depuracion database 
const dbDebug = require('debug')('app:db')
//frame work express
const express = require('express');
// config
const config = require('config');
// requerimos funcion externa
const logger = require('./logger');
// requerimos morgan para registros http request
const morgan = require('morgan');
// traemos a joi
const Joi = require('joi');
// instanticamos este elemento
const app = express();

app.use(express.json()); // body

// obtengamos informacion de la url
app.use(express.urlencoded({
    extended:true
}));

// usamos el middleware .static de express para manejar recursos estaticos
// hacemos referencia a una carpeta public
app.use(express.static('public'));

// configuracion de entornos
console.log('Aplicacion : ' + config.get('nombre'));
console.log('BD Server: '+ config.get('configDB.host'));

//uso de middleware de terceros
if(app.get('env')==='development'){
    app.use(morgan('tiny'));
    inicioDebug('Morgan esta habilitado.');
}

// Trabajos con la base de dato
dbDebug('Conectando con la bd...');

// hacems uso de la funcion logger que se ejecuta en otro archivo
// app.use(logger);

// aprendemos de las funciones middleware
// app.use(function(req,res,next){
//     console.log('Autenticando....');
//     next();
// });


// crearemos un id 
const usuarios = [
    {id:1,nombre:'Grover'},
    {id:2,nombre:'Pablo'},
    {id:3,nombre:'Ana'}
]


//indicamos a nuestra aplicacion los metedos a implementar
// peticion
app.get('/',(req,res) => 
{
    /* 
    request y response son objetos, con propiedades y metodos*/
    res.send('Hola mundo desde Express');
}); 

app.get('/api/usuarios',(req,res) => {
    res.send(usuarios);
});

// con el : podemos delimitar parametros
app.get('/api/usuarios/:id',(req,res)=>{
    // encontramos un usario por el id
    let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    // si no lo encontramos tiramos un estado 404
    if(!usuario) res.status(404).send('El usuario no fue encontrado');
    res.send(usuario);
});

app.post('/api/usuarios',(req,res) => {
    const schema = Joi.object({
        nombre: Joi.string().alphanum().min(3).required()
    });
    const {error , value} = schema.validate({
        nombre: req.body.nombre
    });
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }

});

app.put('/api/usuarios/:id', (req,res) => {
    // encontramos un usario por el id
    let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    // si no lo encontramos tiramos un estado 404
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    // validacion
    const schema = Joi.object({
        nombre: Joi.string().alphanum().min(3).required()
    });
    const {error , value} = schema.validate({
        nombre: req.body.nombre
    });
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
    
    usuario.nombre = value.nombre;
    res.send(usuario);

});

app.delete('/api/usuarios/:id',(req,res) => {
    // encontramos un usario por el id
    let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    // si no lo encontramos tiramos un estado 404
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    res.send(usuarios);
});

// en que puerto se escucha eventos
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log('Escuchando en el puerto '+port+' ...');
})

// esta aplicacion se plancha y debemos reiniciar manualmente para que vea cambios