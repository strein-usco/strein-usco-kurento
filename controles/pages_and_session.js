/** 
 * Modulo que corresponde a todo tipo de funcionalidades para el manejo de archivos desde el servidor.
 * @module Controller
 * @see module:routes/index
 * @requires module:routes/index
 */

let express = require('express');
let path = require('path');
let session = require('express-session');
let router = express.Router();
let jwt = require('jwt-simple');
let moment = require('moment');
let configs = require('../config/configs');

let session_room = require('./../models/sessionRoom'),
    VideoClasses = require('./../models/videoclass'),
    MessageChat = require('./../models/messageChat'),
    mongoose = require('./../config/conexion'),
    Persona = require('./../models/persona'),
    Course = require('./../models/courses'),
    Correos = require('./../models/correos'),
    Joins = require('./../models/joined'),
    File = require('./../models/files');
var crypto = require("crypto");
let fs = require('fs');

//********************************************//
//**** FUNCIONES PARA PAGINAS DEL INTRO   ****//
//********************************************//

/** 
 * FUNCIÓN PARA CUALQUIER USUARIO -
 * Envia el html correspondiente a la página principal del sistema
 * @class getStart
 * @param {Object} req - Solicitud con parametros (body)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.render {(string|Object)} Despliega la vista index.html
*/
exports.getStart = function(req, res) {
    res.render('index.html', { title: 'ejs' });
}

// Funcion para iniciar sesion
/** 
 * FUNCIÓN PARA CUALQUIER USUARIO -
 * Envia el html correspondiente a la página para logueo en el sistema
 * @class Log_in
 * @param req {Object} Solicitud con parametros (body)
 * @param req.body {Object} - Solicitud enviada por el usuario para iniciar sesion
 * @param req.body.email {string} Correo del usuario
 * @param req.body.password {string} Contraseña enviada para inciar sesion
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send {(string | Object)} Dos tipo de valores, "Cambio exitoso" o  un objeto tipo error
*/
exports.Log_in = function(req, res) {
    var err, err2, person;
    Persona.findOne({ correo: req.body.email }, (err, person) => {
    //verifica si exte algun usuario con ese correo
        if (person) {
            //verifica si el usuario tiene un estado activo para poder ingresar
            if (person.estado == "active") {
                var password = person.contra;
                var cedula = JSON.stringify(person.cedula)
                var passCrypto = encrypt(req.body.password, cedula);

                if (passCrypto == password) {
                    req.session.authenticated = true;
                    req.session.user = person;

                    return res.status(200).send({token: createToken(person)});
                } else {
                    res.status(200).send({ err: err });
                }
            } else {
                err = "inactive";
                res.status(200).send({ err: err });
            }

        }else{
            res.status(406).send(false)
        }
    });
}

//Func. para encriptar contraseña
function encrypt(password, cedula) {
    hash = crypto.createHmac('sha256', password).update(cedula).digest('hex');
    return hash;
}

//fecha creación de token, exp: fecha cuando expira el token usb: el tipo de cuenta (tutor, estudiante o admin)
function createToken (user) {
    let payload={
        jti:user._id,
        name:user.nombres,
        sub:user.tipo,
        iat: moment().unix(),
        exp: moment().add(14,'days').unix()
    }
    return jwt.encode(payload, configs.secret_token)
}

//func. para mantener sesion y continuar como tutor o estudiante
/** 
 * FUNCIÓN PARA CUALQUIER USUARIO -
 * Redirecciona el usuario a su correspondiente pagina dependiendo del tipo de cuenta, si el usuario no ha iniciado sesión aún,
 * será direccionado a la pagina de logueo (login.html)
 * @class logueo
 * @param req {Object} Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Nueva ruta
*/
exports.logueo = function(req, res) {
    if (!req.session.user) {
        res.render('login');
    } else if (req.session.user.tipo == "tutor") {
        res.redirect('/tutor-account');
    } else if (req.session.user.tipo == "estudiante") {
        res.redirect('/student-account');
    } else if (req.session.user.tipo == "admin"){
        res.redirect('/admin-account');
    }
}

// func. para cerrar sesion
/** 
 * FUNCIÓN PARA CUALQUIER USUARIO -
 * Cierra la sesión del usuario quien hace la petición, para luego ser direccionado a la pagina principal del sistema.
 * @class log_out
 * @param req {Object} Solicitud con parametros (body)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Nueva ruta
*/
exports.log_out = function(req, res) {
    delete req.session.authenticated;
    req.session.user = null;
    res.redirect('/');
}

//********************************************//
//**** FUNCIONES PARA CUENTA TIPO TUTOR  ****//
//********************************************//

/** 
 * FUNCIÓN PARA TUTOR -
 * Página principal del tutor, se depliega la vista page-tutor.html
 * @class getTutorAcount
 * @param {Object} req - Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.nombres {string} Nombres del usuario quien envia la solicitud.
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /admin-account (es una cuenta tipo administrador)
 * @param res.render {(string|Object)} Renderiza la page-tutor.html (string) y envia un Objeto con datos.
*/
exports.getTutorAcount = function(req, res) {
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "tutor") {
        Course.find({id_tutor: req.session.user._id }, (err, courses) => {
            Joins.find({_id: req.session.user._id }, (err, joins) => { 
                Correos.find({replay_to_by_id: req.session.user._id, seen: { $ne : "original" } }, (err, mailsRecived) => {
                    Correos.find({created_by_id: req.session.user._id, seen : "original"}, (err, mailsSent) => {
                        dates_classes = Class_today()
                        VideoClasses.find({id_tutor: req.session.user._id, schedule : "true", date: { $in: dates_classes} }, (err, classes_today) => {
                            if (err) throw err;
                            res.render('page-tutor', {joins:joins, mailsRecived:mailsRecived, mailsSent:mailsSent, courses: courses, name:req.session.user.nombres, classes_today: classes_today, date_today: dates_classes});
                        });
                    });
                });  
            });  
        });
    } else if (req.session.user.tipo == "estudiante") {
        res.redirect('/student-account');
    } else if (req.session.user.tipo == "admin") {
        res.redirect('/admin-account');
    }
}

function Class_today(){
    var dates_classes;
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var d = new Date().toLocaleString("en-US",{timeZone: "America/Bogota"});
    d = new Date(d)
    var date = d.getDate();
    var month = d.getMonth();
    var year = d.getFullYear();
    if(Number(date) < 10 ){
        date = "0" + date;
    }
    // Date Tomorrow
    var currentDate2 = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var day2 = currentDate2.getDate()
    if(Number(day2) < 10 ){
        day2 = "0" + day2;
    }
    var month2 = currentDate2.getMonth()
    var year2 = currentDate2.getFullYear()
    // One day after tomorrow
    var currentDate3 = new Date(new Date().getTime() + 48 * 60 * 60 * 1000);
    var day3 = currentDate3.getDate()
        if(Number(day3) < 10 ){
        day3 = "0" + day3;
    }
    var month3 = currentDate3.getMonth()
    var year3 = currentDate3.getFullYear()
    dates_classes = [months[month] + " " + date + ", " + year, months[month2] + " " + day2 + ", " + year2, months[month3] + " " + day3  + ", " + year3]
    return dates_classes;
}

/** 
 * FUNCIÓN PARA TUTOR -
 * Envia un objeto que agrupa un string conformado por texto en html, el cual adjunta una tabla con cada uno de los estudiantes correspondietes al id_course (id del curso).
 * @class getStudents
 * @param req {Object} Solicitud con parametros (body y session)
 * @param req.body {Object} - Solicitud enviada con los valores para buscar id_course en la base de datos
 * @param req.body.id_course {Object} - Id del curso en solicitud
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send {(Object|string)} Dos tipo de valores: contentHTML, tabla en html, con cada uno de los estudiantes pertenecientes al curso en solicitud, y "false" si el curso en solicitud no existe en la base de datos.
*/
exports.getStudents = (req, res) => {
    var id_course =  req.body.id_course;
    Course.findOne({_id: id_course, id_tutor: req.session.user._id},(err, course)=>{
        if (course){
        Joins.find({ id_course: id_course}, (err, students) => {
                if(students){
                    var contentHTML = '<select id="select2" multiple><option value="" disabled selected>Para:</option>';
                    for (var i=0; i<students.length; i++){
                        contentHTML = contentHTML + '<option value="' + students[i].id_student + '/' + students[i].name_student + '">' + students[i].name_student + '</option>';
                    }
                    contentHTML = contentHTML + '</select>';
                }
                res.status(200).send(contentHTML);
        });
        }else{res.status(406).send(false)}
    });
}

/** 
 * FUNCIÓN PARA TUTOR -
 * Página antesala a la transmisión, se depliega la vista pre-page-course.html
 * @class getCourseInfo
 * @param {Object} req - Solicitud con parametros (session y params)
 * @param req.params {Object} Contiene propiedades asignadas asginada a la ruta nombrada
 * @param req.params.id {string} Propiedad de la ruta nombrada
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /admin-account (es una cuenta tipo administrador)
 * @param res.render {(string|Object)} Renderiza la vista pre-page-course.html (string) y envia un Objeto con datos.
*/
exports.getCourseInfo = function(req, res) {
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "tutor") {
        id_course = req.params.id.split("#!");
        Course.find({id_tutor: req.session.user._id},(err, courses)=>{
            Course.findOne({ _id: id_course}, (err, course) => {
                if (course.id_tutor == req.session.user._id) {
                    Joins.find({ id_course: course._id}, (err, joins) => {
                        VideoClasses.find({id_course: course._id}, (err, classes)=>{
                            File.find({ from_course_id: course._id}, (err, files) => {
                                //req.session.user.id_course = req.params.id;
                                res.render('pre-page-course', {courses:courses, course: course, joins: joins, classes: classes, files: files, root: path.join(__dirname, '../views') });
                            });
                        });
                   });
                } else {
                    res.redirect('/tutor-account');
                }
            });
        });
    } else if (req.session.user.tipo == "estudiante") {
        (req.session.user.id_join)?res.redirect('/student-account/info-curso/'+req.session.user.id_join):res.redirect('/student-account');
    } else {
        res.redirect('/logueo');
    }
}

/** 
 * FUNCIÓN PARA TUTOR -
 * Página para la transmisión, se depliega la vista canvas-designer-tutor.html
 * @class getStartCourseTutor
 * @param req {Object}  Solicitud con parametros (session y params)
 * @param req.params {Object} Contiene propiedades asignadas asginada a la ruta nombrada
 * @param req.params.id {string} Propiedad de la ruta nombrada
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param req.session.user.id_course {string} Id del curso a solicitar
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /admin-account (es una cuenta tipo administrador)
 * @param res.render {(string|Object)} Renderiza la vista canvas-designer-tutor.html (string) y envia un Objeto con datos.
*/
exports.getStartCourseTutor = function(req, res) {
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "tutor") {
        //var id_course = req.params.id.split("-")[0];
        var id_videoclass = req.params.id;
        var shareScreen;
        VideoClasses.findOne({_id: id_videoclass, id_tutor: req.session.user._id}, (err, video)=>{
            if(video){
                if(video.schedule == "true"){
                    var id_course = video.id_course;
                    (video.typeOfStream === "share-screen") ? shareScreen = true : shareScreen = false;
                    Course.findOne({ _id: id_course, id_tutor: req.session.user._id }, (err, course) => {
                        if (course) {
                            File.find({ from_course_id: id_course }, 'dinamic_name', (err, nameFiles) => {
                                Joins.find({ id_course: id_course}, (err, accepted) => {
                                    MessageChat.find({ id_class: id_videoclass}, (err, messagesChat) => {
                                        req.session.user.id_course = id_course;
                                        VideoClasses.findByIdAndUpdate(id_videoclass, { $set: { num: Number(video.num)+1} }, { new: true }, (err, model) => {
                                            if (err) throw err;
                                        });
                                        name_video = video._id + '-' + video.num;
                                        //name_video = video._id;
                                        //res.render('page-course', { id_tutor:req.session.user._id, nameFiles: nameFiles, course: course._id,name:course.name_course, students: accepted, id_class: video._id, shareScreen: shareScreen, name_video: name_video});
                                        res.render('canvas-designer-tutor', { id_tutor:req.session.user._id, nameFiles: nameFiles, course: course._id,name:course.name_course, students: accepted, id_class: video._id, shareScreen: shareScreen, name_video: name_video, messagesChat: messagesChat});
                                        //res.render('Scalable-Broadcast');
                                        //res.render('video-broadcasting');
                                    });
                                });
                            });
                        } else { res.redirect('/tutor-account');}
                    });
                }else{ res.redirect('/tutor-account/info-curso/'+video.id_course);}
            }else{ res.redirect('/tutor-account');}
        });
    } else if (req.session.user.tipo == "estudiante") {
        res.redirect('/student-account');

    } else {
        res.redirect('/logueo');
    }
}

//pagina para subir archivos al servidor
/** 
 * FUNCIÓN PARA TUTOR -
 * Página para cargar archivos en el servidor. Nota: solo se permiten archivos con extensión .ppt, .pptx, .jpeg, .png y .pdf. Despliega la vista upload-file.html
 * @class getUploadFile
 * @param req {Object}  Solicitud con parametros (session y params)
 * @param req.params {Object} Contiene propiedades asignadas asginada a la ruta nombrada
 * @param req.params.id {string} Propiedad de la ruta nombrada
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /admin-account (es una cuenta tipo administrador)
 * @param res.render {(string|Object)} Renderiza la vista upload-file.html (string) y envia un Objeto con datos.
*/
exports.getUploadFile = function(req, res) {
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "tutor") {
        Course.findOne({ _id: req.params.id }, (err, course) => {
            res.render('upload-file.html', { course: course, root: path.join(__dirname, '../views') });
        });
    } else if (req.session.user.tipo == "estudiante") {
        Joins.findOne({ id_course: req.params.id, id_student: req.session.user._id, exponent: "positive" }, (err, join) => {
            if(join){
                var course = {
                    _id: join.id_course,
                    name_course: join.name_course
                }
                res.render('upload-file.html', { course: course, root: path.join(__dirname, '../views') });
            }else{
                res.redirect('/student-account');
            }
        });
    } else {
        res.redirect('/logueo');
    }
}

/** 
 * FUNCIÓN PARA CUALQUIER usuario -
 * Página para cambiar datos del usuario. Despliega la vista data_student.html (estudiante) y data_tutor.html (tutor)
 * @class getAccount
 * @param req {Object}  Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /admin-account (es una cuenta tipo administrador)
 * @param res.render {(string|Object)} Renderiza la vista data_student-file.html|data_student.html (string) y envia un Objeto con datos.
*/
exports.getAccount = function(req, res) {
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "tutor") {
        Course.find({id_tutor: req.session.user._id},(err, courses)=>{
            Persona.findOne({ _id: req.session.user._id }, function(err, per) {
                res.render('data_tutor', { per: per,courses:courses });
            });
        });

    } else if (req.session.user.tipo == "estudiante") {
        Joins.find({id_student: req.session.user._id}, (err, courses) =>{
            Persona.findOne({ _id: req.session.user._id }, function(err, per) {
                res.render('data_student', { per: per, courses:courses});
            });
        });
    } else {
        res.redirect('/admin-account');
    }
}

//envia informacion del usuario para el chat
/** 
 * FUNCIÓN PARA CUALQUIER usuario -
 * Envia informacion del usuario tipo tutor para almacenar en los parametros de conexion rtcmulticonnection
 * @class dataUser
 * @param req {Object}  Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param req.session.user.correo {string} Correo del usuario (estudiante, tutor, admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {Object} Datos de session del usuario quien en via la solicitud
*/
exports.dataUser = (req, res) => {
    var data = {
        correo: req.session.user.correo,
        nombres: req.session.user.nombres,
        my_id: req.session.user._id
    }
    res.status(200).send(data)
}

//*********************************************//
//**** FUNC PARA CUENTAS TIPO ESTUDIANTES  ****//
//*********************************************//

/** 
 * FUNCIÓN PARA ESTUDIANTE -
 * Página principal del estudiante, se depliega la vista page-student.html
 * @class getStudentAcount
 * @param {Object} req - Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesión
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.nombres {string} Nombres del usuario quien envia la solicitud.
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /tutor-account (es una cuenta tipo estudiante), /admin-account (es una cuenta tipo administrador)
 * @param res.render {(string|Object)} Renderiza la page-student.html (string) y envia un Objeto con datos.
*/
exports.getStudentAcount = function(req, res) {
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "estudiante") {
        Joins.find({ id_student: req.session.user._id }, (err, joined) => {
            Joins.find({ id_student: req.session.user._id }, 'id_course', (err, id_courses) => {
                Correos.find({replay_to_by_id: req.session.user._id, seen: { $ne : "original" } }, (err, mailsRecived) => {
                    Correos.find({created_by_id: req.session.user._id, seen : "original"}, (err, mailsSent) => {
                        VideoClasses.find({id_course: { $in: get_id_courses(id_courses)} , schedule : "true", date: { $in: Class_today()} },(err, classes_today) => {   
                            dates_classes = Class_today();
                            res.render('page-student', { joined: joined, mailsRecived: mailsRecived, mailsSent: mailsSent, name:req.session.user.nombres, classes_today: classes_today, date_today: dates_classes});
                        });
                    });
                });
            });
        });
    } else {
        res.redirect('/tutor-account');
    }
}

function get_id_courses(id_courses){
    courses = []
    for (var r = 0; r < id_courses.length; r++) {
        courses.push(id_courses[r].id_course)
    }
    return courses
}

// página antesala a la transmisión
/** 
 * FUNCIÓN PARA ESTUDIANTE -
 * Página antesala a la transmisión, se depliega la vista pre-course-student.html
 * @class getStudentAcountInfo
 * @param {Object} req - Solicitud con parametros (session y params)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param req.params {Object} Contiene propiedades asignadas asginada a la ruta nombrada
 * @param req.params.id {string} Propiedad de la ruta nombrada
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /tutor-account (es una cuenta tipo estudiante), /admin-account (es una cuenta tipo administrador)
 * @param res.render {(string|Object)} Renderiza la vista pre-course-student.html (string) y envia un Objeto con datos.
*/
exports.getStudentAcountInfo = function(req, res) {
    var course = false;
    var nameFiles;
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "estudiante") {
        Joins.findOne({ _id: req.params.id, id_student: req.session.user._id}, (err, course) => {
        	if (course){
	            Joins.find({id_student: req.session.user._id}, (err, courses) =>{
	                File.find({ from_course_id: course.id_course, state: "public" }, (err, nameFiles) => {
	                    VideoClasses.find({id_course:  course.id_course, private: "false"}, (err, videos)=>{
	                        req.session.user.id_join = req.params.id;
	                        //if(course.exponent == "positive"){
	                        //    res.render('pre-course-student2', { idcourse: course.id_course, professorName: course.created_by_name, nameFiles: nameFiles, name:course.name_course, videos: videos, courses: courses, id_user: req.session.user._id});
	                        //}else{
	                            res.render('pre-course-student', { idcourse: course.id_course, professorName: course.created_by_name, nameFiles: nameFiles, name:course.name_course, videos: videos, courses: courses, id_user: req.session.user._id});
	                        //}
	                    });
	                });
	            });
	        }else{res.redirect('/tutor-account');}
        });
    } else {
        res.redirect('/tutor-account');
    }
}

// página para transmisión-sala
/** 
 * FUNCIÓN PARA ESTUDIANTE -
 * Página para la transmisión, se depliega la vista canvas-designer-student.html
 * @class joinCourseStudent
 * @param req {Object}  Solicitud con parametros (session y params)
 * @param req.params {Object} Contiene propiedades asignadas asginada a la ruta nombrada
 * @param req.params.id {string} Propiedad de la ruta nombrada
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario quien envia la solicitud
 * @param req.session.user.tipo {string} Tipo de usuario (estudiante, tutor, admin)
 * @param req.session.user.id_join {string} Id del curso presente
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /tutor-account (es una cuenta tipo estudiante), /admin-account (es una cuenta tipo administrador)
 * @param res.render {(string|Object)} Renderiza la vista canvas-designer-student.html (string) y envia un Objeto con datos.
*/
exports.joinCourseStudent = function(req, res) {
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "estudiante") {
        var id_course = req.params.id.split("&&")[0]; 
        var id_class = req.params.id.split("&&")[1]; 
        Course.findOne({_id: id_course }, (err, course) => { 
            Joins.find({id_student: req.session.user._id}, (err, courses) =>{
                VideoClasses.findById(id_class, (err, video)=>{
                    if(course){
                        Joins.findOne({id_course: id_course, id_student: req.session.user._id}, (err, join)=>{
                            MessageChat.find({ id_class: id_class}, (err, messagesChat) => {
                                Joins.find({ id_course: id_course}, 'name_student',(err, students) => {
                                    //if(join){
                                    //    req.session.user.id_join = join._id;
                                    //    File.find({ owner_id: req.session.user._id, from_course_id: id_course}, 'dinamic_name', (err, nameFiles) => {
                                    //        res.render('course-student-exponent', {courses:courses, course:course,video:video, nameFiles: nameFiles, messagesChat: messagesChat, students: students});            
                                    //    });
                                    //}else{
                                        res.render('canvas-designer-student', {myColor: join.color, myName:  req.session.user.nombres, courses:courses, course:course,video:video, messagesChat: messagesChat, students: students});            
                                    //}
                                });
                            });     
                        });
                    }
                    else{
                      res.redirect('/student-account');  
                    }
                }); 
            });   
        });
        
    } else {
        res.redirect('/tutor-account');
    }
}

//*********************************************//
//*** FUNC PARA CUENTAS TIPO ADMINISTRADOR ****//
//*********************************************//

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Página principal del administrador, se depliega la vista page-admin-user.html y se listan todos los usuarios almacenados en la base de datos
 * @class getAdminAcount
 * @param {Object} req - Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /tutor-account (es una cuenta tipo tutor)
 * @param res.render {(string|Object)} Renderiza la page-admin-user.html (string) y envia un Objeto con datos.
*/
exports.getAdminAcount = (req, res )=>{
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "admin") {
        Persona.find({tipo: 'admin'}, (err, admin) => {
            Persona.find({tipo: 'estudiante'}, (err, student) => {
                Persona.find({tipo: 'tutor'}, (err, tutor) => {
                    Course.find({},(err, course) => {
                        res.render('page-admin-user', { tutor:tutor, student: student, course: course, admin:req.session.user.nombres});
                    });
                });
            });
        });
    } else if (req.session.user.tipo == "estudiante") {
        res.redirect('/student-account');
    }else if (req.session.user.tipo == "tutor") {
        res.redirect('/tutor-account');
    }
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Página principal del administrador, se depliega la vista page-admin-user.html y se listan todos los usuarios almacenados en la base de datos
 * @class getAdmin_UsuarioAcount
 * @param {Object} req - Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /tutor-account (es una cuenta tipo tutor)
 * @param res.render {(string|Object)} Renderiza la page-admin-user.html (string) y envia un Objeto con datos.
*/
exports.getAdmin_UsuarioAcount = (req, res) =>{
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "admin") {
        Persona.find({tipo: 'tutor'}, (err, tutor) => {
            Course.find({},(err, course) => {
                res.render('page-admin-user', { type: "TUTOR", user: tutor, course: course,admin:req.session.user.nombres});
            });
        });
    } else if (req.session.user.tipo == "estudiante") {
        res.redirect('/student-account');
    }else if (req.session.user.tipo == "tutor") {
        res.redirect('/tutor-account');
    }
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Página para registrar nuevos usuarios, se depliega la vista page-admin-register.html
 * @class getAdmin_register
 * @param req {Object} Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.nombres {string} Nombre del usuario quien envia la solicutd
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /tutor-account (es una cuenta tipo tutor)
 * @param res.render {(string|Object)} Renderiza la page-admin-user.html (string) y envia un Objeto con datos.
*/
exports.getAdmin_register = (req, res) =>{
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "admin") {
        Persona.find({tipo: 'estudiante'}, (err, tutor) => {
            Course.find({},(err, course) => {
                res.render('page-admin-register', { type: "ESTUDIANTE", user: tutor, course: course,admin:req.session.user.nombres});
            });
        });
    } else if (req.session.user.tipo == "estudiante") {
        res.redirect('/student-account');
    }else if (req.session.user.tipo == "tutor") {
        res.redirect('/tutor-account');
    }
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Página para crear nuevos cursos, se depliega la vista page-admin-course.html
 * @class getAdmin_CourseAcount
 * @param req {Object} Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.nombres {string} Nombre del usuario quien envia la solicutd
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /tutor-account (es una cuenta tipo tutor)
 * @param res.render {(string|Object)} Renderiza la page-admin-course.html (string) y envia un Objeto con datos.
*/
exports.getAdmin_CourseAcount = (req, res) =>{
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "admin") {
        Persona.find({tipo: 'tutor'}, (err, tutor) => {
            Persona.find({tipo: 'estudiante'}, (err, student) => {
                Course.find({},(err, course) => {
                    Course.find({assigned: false},(err, course2) => {
                        Course.find({assigned: true},(err, course3) => {
                            res.render('page-admin-course', { tutor: tutor, course: course, course2: course2, course3: course3, student: student, admin:req.session.user.nombres});
                        });
                    });
                });
            });
        });
    } else if (req.session.user.tipo == "estudiante") {
        res.redirect('/student-account');
    }else if (req.session.user.tipo == "tutor") {
        res.redirect('/tutor-account');
    }
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Página para modificar datos como contraseña o correo del administrador, se depliega la vista data_admin.html
 * @class getAdmin_CourseAcount
 * @param req {Object} Solicitud con parametros (session)
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {Object} Id de la cuenta el cual solita las modificaciones
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {string} Redirecciona al link /logueo (no hay iniciado sesion), /student-account (es una cuenta tipo estudiante), /tutor-account (es una cuenta tipo tutor)
 * @param res.render {(string|Object)} Renderiza la data_admin.html (string) y envia un Objeto con datos.
*/
exports.getData_admin = (req, res)=>{
    if (!req.session.user) {
        res.redirect('/logueo');
    } else if (req.session.user.tipo == "admin") {
            Persona.findOne({ _id: req.session.user._id }, function(err, per) {
                res.render('data_admin', { per: per});
            });
    } else if (req.session.user.tipo == "estudiante") {
        res.redirect('/student-account');
    }else if (req.session.user.tipo == "tutor") {
        res.redirect('/tutor-account');
    }
}

            