/**
 *  Módulo que corresponde a las funcionalidades para el manejo de archivos en el servidor,
 *  de igual modo, se trabajarán con funciones básicas en base de datos (CRUD).
 *
 *  Para el desarrollo de este módulo, se han tomado secciones de otros scripts que fueron publicados 
 *  en la red para la divulgación, los cuales son provenientes de la siguiente página:
 *  https://nodemailer.com/about/
 *  @see {@link https://nodemailer.com/about/}  => Paquete para envio de correos desde el servidor.
 *
 * @module Controller6
 * @see module:routes/personaForm
 * @requires module:routes/personaForm
 */
let express = require('express');
let router = express.Router();
let mongoose = require('./../config/conexion');
let Persona = require('./../models/persona'),
    Correos = require('./../models/correos'),
    Course = require('./../models/courses'),
    Joined = require('./../models/joined'),
    File = require('./../models/files');
let crypto = require('crypto');
let nodemailer = require('nodemailer');

/*********************    REGISTRO DE USUARIOS  ***************************/

//Func. para encriptar contraseña
function encrypt(password, cedula) {
    hash = crypto.createHmac('sha256', password).update(cedula).digest('hex');
    return hash;
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Almacena un nuevo usario en la base de datos
 * @class register
 * @param {Object} req - Solicitud con parametros (body)
 * @param req.body {Object} - Solicitud enviada por el usuario tipo Administrador con los valores del formulario para crear un nuevo usuario
 * @param req.body.nombres {string} Nombres del usaurio para el curso asignado en el formulario
 * @param req.body.cedula {number} Cédula del usuario
 * @param req.body.edad {number} Edad del usuario
 * @param req.body.correo {string} Correo del usuario
 * @param req.body.password {string} Contraseña de la cuenta
 * @param req.body._id {string} Id del usuario previamente creado
 * @param req.body.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param req.body.estado {string} Estado de la cuenta (active -activa o false -inactiva)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /admin-account
*/
exports.register = function(req, res) {
    var answer;
    var cedula = req.body.cedula;
    var password = req.body.password;
    var passCrypto = encrypt(password, cedula);
    var email = req.body.correo;
    var conf_email = email.substring(email.lastIndexOf("@") + 1, email.lenght);

    Persona.findOne({ correo: req.body.correo }, (err, person) => {
        if (person) {
            console.log("correo existente en la BD");
            answer = "exist";
            res.status(200).send({ answer: answer });
        } else if (conf_email != "usco.edu.co") {
            console.log("El correo no es Institucional");
            answer = "no_inst";
            res.status(200).send({ answer: answer });
        } else if (req.body._id === "" || !req.body._id) {
            let per = new Persona({
                nombres: req.body.nombres,
                cedula: req.body.cedula,
                apellidos: req.body.apellidos,
                edad: req.body.edad,
                correo: req.body.correo,
                contra: passCrypto,
                tipo: req.body.tipo,
                estado: req.body.estado
            });
            /*per.save();*/
            per.save(function(err, perSaved) {
                var id = perSaved._id.toString();
                sendMail(id, req.body.correo,password);
            });
            //res.status(200).send(true);    
            res.redirect('/admin-account');

        } else {
            Persona.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true }, (err, model) => {
                if (err) throw err;
                res.redirect('/admin-account');
            });
        }
    });
}

function sendMail(id, email, password) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'strein.usco@gmail.com', // generated ethereal user
                pass: 'npmzltan' // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '" 📋 STREIN - USCO 💡" <strein.usco@gmail.com>', // sender address
            to: email, // list of receivers
            subject: 'Usuario STREIN ✔', // Subject line
            text: 'Hello world?', // plain text body
            html: '<br><h3>ESTIMADO USUARIO</h3><h3>Por medio de la presente se le informa sus datos de ingreso, los cuales son:</h3>Usuario: <label>'+ email +'</label><br>Contraseña: <label>'+ password +'</label><br><h4>Una vez ingrese, se sugiere realizar el cambio de la constraseña por una de fácil recordación para usted.<br>Gracias por su atención.<br><b>SISTEMA DE TELECONFERENCIA - STREIN.</b><br><a target="_blank">https://strein-usco.herokuapp.com</a></h4>',
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        });
    });
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Edita información del usuario en la base de datos
 * @class editUser
 * @param {Object} req - Solicitud con parametros (body)
 * @param req.body {Object} - Solicitud enviada por el usuario tipo Administrador con los valores del formulario para crear un nuevo usuario
 * @param req.body._id {string} Id del usuario previamente creado
 * @param req.body.nombres {string} Nombres del usaurio para el curso asignado en el formulario
 * @param req.body.cedula {number} Cédula del usuario
 * @param req.body.edad {number} Edad del usuario
 * @param req.body.correo {string} Correo del usuario
 * @param req.body.password {string} Contraseña de la cuenta
 * @param req.body.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param req.body.estado {string} Estado de la cuenta (active -activa o false -inactiva)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.nombres {string} Nombres del usuario quien envia la solicitud.
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /admin-account
*/
exports.editUser = function(req, res) {
    if(req.session.user._id == req.body._id){
        req.session.user.nombres = req.body.nombres;
    }
    if(req.body._id == ""){
        (req.session.user.tipo == "admin")?res.redirect('/admin-account/tutor-accounts'):res.redirect('/tutor-account/dataTutor');
    }else{
    Persona.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true }, (err, model) => {            
        if (err) throw err;
        if(req.body.tipo=="tutor"){
            Course.updateMany({id_tutor:req.body._id},{$set: {name_tutor: req.body.nombres, email_tutor: req.body.correo}}, { new: true }, (err, model) => {
                if (err) throw err;
            });            
            Joined.updateMany({id_tutor: req.body._id},{$set: {name_tutor: req.body.nombres}}, { new: true }, (err, model) => {
                if (err) throw err;
            });
            File.updateMany({owner_id: req.body._id},{$set: {name_tutor: req.body.nombres}},(err)=>{
                if (err) throw err;
            });
            //(req.session.user.tipo == "admin")?res.redirect('/admin-account/tutor-accounts'):res.redirect('/tutor-account/dataTutor');
            res.redirect('/admin-account')
        }else if(req.body.tipo=="estudiante"){
            Joined.updateMany({id_student:req.body._id},{$set: {name_student:req.body.nombres, email_student:req.body.correo }}, { new: true }, (err, model) => {
                if (err) throw err;
            });
            File.updateMany({owner_id: req.body._id},{$set: {name_student: req.body.nombres}},(err)=>{
                if (err) throw err;
            });
            //(req.session.user.tipo == "admin")?res.redirect('/admin-account/student-accounts'):res.redirect('/student-account/dataStudent');
            res.redirect('/admin-account')
        }
    });
    }
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Edita el correo del adminstrador en la base de datos
 * @class editmail
 * @param {Object} req - Solicitud con parametros (body)
 * @param req.body {Object} - Solicitud enviada por el usuario tipo Administrador con los valores del formulario para crear un nuevo usuario
 * @param req.body._id {string} Id del usuario previamente creado
 * @param req.body.correo1 {string} Correo del usuario
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.correo {string} Correo del usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send {(string | Object)} Dos tipo de valores, "Cambio exitoso" o  un objeto para un error
*/
exports.editmail = function(req, res) {

    if (req.session.user.tipo == 'admin') {
        Persona.findByIdAndUpdate(req.session.user._id, { $set: { correo: req.body.correo1 } }, { new: true }, (err, model) => {
            if (err) throw err;
        });
        req.session.user.correo = req.body.correo1;
        res.status(200).send("Cambio exitoso");
    } else {
        res.status(406).send({ err: "err" });
    }
}

/** 
 * FUNCIÓN PARA CUALQUIER USUARIO -
 * Cambiar contraseña del usario en la base de datos
 * @class changeContra
 * @param {Object} req - Solicitud con parametros (body)
 * @param req.body {Object} - Solicitud enviada por el usuario tipo Administrador con los valores del formulario para crear un nuevo usuario
 * @param req.body.contra {string} Contraseña nueva
 * @param req.body.contra_act {string} Contraseña actual
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.correo {string} Correo del usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send {(string | Object)} Dos tipo de valores, "Cambio exitoso" o  un objeto tipo error
*/
exports.changeContra = function(req, res) {
    var new_contr = req.body.contra;
    var act_contra = req.body.contra_act;
    var session_contra = req.session.user.contra;
    var cedula = JSON.stringify(req.session.user.cedula);
    var passCrypto1 = encrypt(act_contra, cedula);
    var passCrypto2 = encrypt(new_contr, cedula);

    if (session_contra == passCrypto1) {
        Persona.findByIdAndUpdate(req.session.user._id, { $set: { contra: passCrypto2 } }, { new: true }, (err, model) => {
            if (err) throw err;
        });
        req.session.user.contra = passCrypto2;
        res.status(200).send("Cambio exitoso");
    } else {
        res.status(200).send({ err: "err" });
    }
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Eliminar a un usuario de la base de datos
 * @class delete_user
 * @param {Object} req - Solicitud con parametros (body)
 * @param req.body {Object} - Solicitud enviada por el usuario tipo Administrador con los valores del formulario para crear un nuevo usuario
 * @param req.body.id_user {string} Id del usuario a eliminar
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send {string} Dos tipo de valores "true" o "false", le primero si el cambio fue exitoso y el segundo si el id del usuario no existe
*/
exports.delete_user = function(req, res){
    Persona.findById(req.body.id_user,(err, person)=>{
        if(person){
            if(person.tipo == "tutor"){
                Course.updateMany({id_tutor: req.body.id_user}, { $set: {id_tutor:"",name_tutor:"",email_tutor:""} }, { new: true }, (err, model) => {
                    if (err) throw err;
                });
                Joined.updateMany({id_tutor: req.body.id_user}, { $set: {id_tutor:"",name_tutor:""} }, { new: true }, (err, model) => {
                    if (err) throw err;
                });
                Persona.deleteOne({ _id: req.body.id_user }, function(err) {
                    if (err) throw err;
                });
                File.deleteMany({ owner_id: req.body.id_user }, function(err) {
                    if (err) throw err;
                });
                res.status(200).send(true);
            }else if (person.tipo == "estudiante"){
                Joined.deleteMany({ id_student: req.body.id_user }, function(err) {
                    if (err) throw err;
                });
                Persona.deleteOne({ _id: req.body.id_user }, function(err) {
                    if (err) throw err;
                });
                File.deleteMany({ owner_id: req.body.id_user }, function(err) {
                    if (err) throw err;
                });
                res.status(200).send(true);
            }else if(person.tipo == "admin"){
                res.status(406).send("solo se pueden borrar los administradores con el software de Robot3T");
            }
        }else{res.status(406).send(false);}
    });
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Imprime informacion del usuario y cursos
 * @class InfoUser
 * @param {Object} req - Solicitud con parametros (body)
 * @param req.body {Object} - Solicitud enviada por el usuario tipo Administrador con los valores del formulario para crear un nuevo usuario
 * @param req.body.id_user {string} Id del usuario
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send {(Object |string)} Dos tipo de valores: objeto person con la informacion del usuario que le pertenece id_user o "false", si el id del usuario no existe
*/
exports.InfoUser = (req, res)=>{
    Persona.findById(req.body.id_user, function(err, person) {
        if(person){
            if(person.tipo == 'tutor'){
                Course.find({id_tutor: req.body.id_user},(err, courses)=>{
                    if(courses){
                        htmlText =  '<table class="table striped"><thead><tr><th>Nombre</th><th>Editar</th><th>Eliminar</th></tr></thead>'; 
                        for(var i=0; i<courses.length; i++){
                            htmlText = htmlText + '<tr id="tr5_' + courses[i]._id + '"><td id="name5' + courses[i]._id + '">' + courses[i].name_course + '</td><td><a href="/admin-account/course-accounts/' + courses[i]._id + '++' + courses[i].name_course + '++' + courses[i].type + '"><i class="material-icons redusco-text">create</i></a></td><td><a id="del1' + courses[i]._id + '" onclick="delete_course(this.id)"><i class="material-icons redusco-text">delete_forever</i></a></td></tr></tr>';
                        }  
                        htmlText = htmlText + '</table>';
                    }
                    res.status(200).send({person: person, courses: courses, htmlText: htmlText});
                });
            }else if(person.tipo == 'estudiante'){
                Joined.find({id_student: req.body.id_user},(err, courses)=>{
                    if(courses){
                        htmlText =  '<table class="table striped"><thead><tr><th>Nombre</th><th>Editar</th><th>Eliminar</th></tr></thead>'; 
                        for(var i=0; i<courses.length; i++){
                            htmlText = htmlText + '<tr id="tr5_' + courses[i].id_course + '"><td id="name5' + courses[i].id_course + '">' + courses[i].name_course + '</td><td><a href="/admin-account/course-accounts/' + courses[i].id_course + '++' + courses[i].name_course + '++' + courses[i].type + '"><i class="material-icons redusco-text">create</i></a></td><td><a id="del1' + courses[i].id_course + '" onclick="delete_course(this.id)"><i class="material-icons redusco-text">delete_forever</i></a></td></tr></tr>';
                        }
                        htmlText = htmlText + '</table>';      
                    }
                    res.status(200).send({person: person, courses: courses, htmlText: htmlText});
                });
            }
        }else{res.status(406).send(false);}
    });
}
//seleccion de estudiante como expositor
/*exports.setExpo = (req, res) =>{
    Course.findOne({_id: req.body.id_cou, id_tutor:req.session.user._id}, function(err, course) {
        var resp;
        if(course){
            if( course.exponent == 'negative' ){
                Joined.findByIdAndUpdate(req.body.id_join,{$set: {exponent:'positive'}}, { new: true }, (err, model) => {
                    Course.findByIdAndUpdate(req.body.id_cou,{$set: {exponent: req.body.id_join}}, { new: true }, (err, model) => {
                        if (err) throw err;
                        res.status(200).send(resp);
                    });
                });
            }else if(course.exponent != req.body.id_join ){
                Joined.findByIdAndUpdate(course.exponent ,{$set: {exponent:'negative'}}, { new: true }, (err, model) => {
                    Joined.findByIdAndUpdate(req.body.id_join,{$set: {exponent:'positive'}}, { new: true }, (err, model) => {
                        Course.findByIdAndUpdate(req.body.id_cou,{$set: {exponent: req.body.id_join}}, { new: true }, (err, model) => {
                            if (err) throw err;
                            res.status(200).send(resp);
                        });
                    });
                });
            }else{
                Joined.findByIdAndUpdate(req.body.id_join,{$set: {exponent:'negative'}}, { new: true }, (err, model) => {
                    Course.findByIdAndUpdate(req.body.id_cou,{$set: {exponent: 'negative'}}, { new: true }, (err, model) => {
                        if (err) throw err;
                        res.status(200).send(resp);
                    });
                });            }
            res.status(200).send(resp);
        }
    });
}*/



