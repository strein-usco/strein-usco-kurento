/**
 *  Se tomaron scripts de la seccion Basic Usage de las
 *  siguientes librerias de npm.
 *
 *  pdf-image  =>   https://www.npmjs.com/package/pdf-image (conversor de pdf a imagenes)
 *  office-to-pdf  =>   https://www.npmjs.com/package/office-to-pdf (conversor de archivos office a pdf)
 *  
 *  La funcion de video corresponde al codigo de la pagina:
 *  https://medium.com/@daspinola/video-stream-with-node-js-and-html5-320b3191a6b6
 */

 /** 
 * Modulo que corresponde a todo tipo de funcionalidades para el manejo de archivos desde el servidor.
 * @module Controller2
 * @see module:routes/courseForm
 * @requires module:routes/courseForm
 */


let express = require('express');
let path = require('path');
let session = require('express-session');
var FormData = require('form-data');
var http = require('http');
var rimraf = require('rimraf');
let router = express.Router();

let VideoClasses = require('./../models/videoclass'),
    mongoose = require('./../config/conexion'),
    Persona = require('./../models/persona'),
    Correos = require('./../models/correos'),
    Course = require('./../models/courses'),
    Joined = require('./../models/joined'),
    File = require('./../models/files');

var fs = require('fs'),
    PDFImage = require("pdf-image").PDFImage;
var toPdf = require("office-to-pdf");


//**********************************//
//**** FUNCIONES PARA CURSOS   ****//
//********************************//

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * Crea un nuevo curso y lo almacena en la base de datos
 * @class new_course
 * @param {Object} req - Solicitud tanto con los parametros (body), como también la información del usuario (session)
 * @param req.body {Object} - Solicitud enviada por el usuario  tipo Administrador con cada valores del formulario para crear un nuevo curso
 * @param req.body._id {string}
 * @param req.body.code_course {number} Código para el curso asignado en el formulario
 * @param req.body.name_course {string} Nombre del curso asignado en el formulario
 * @param req.body.description {string} Descripción del curso asignado en el formulario
 * @param req.body.type {string} Tipo curso asignado en el formulario
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario que envia la solicitud
 * @param req.session.user.nombres {string} Nombre del usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.redirect {} Redirecciona al link /admin-account/course-accounts
*/
exports.new_course = function(req, res) {
    if (req.body._id === "") {
        let cou = new Course({
            code_course: req.body.code_course,
            name_course: req.body.name_course,
            created_by_name: req.session.user.nombres,
            created_by_id: req.session.user._id,
            description: req.body.description,
            assigned:  false,
            type: req.body.type,
            num_students: "0",
            exponent: "negative",
        });
        cou.save(); //guarda la información en la base de datos mongoDB
        var path = __basedir + '/UploadedFiles/' + req.body._id;
        if (!fs.existsSync(path)) { //verifica si la carpeta existe y si no la crea
            fs.mkdirSync(path);
        }
    } else {
        Course.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true }, (err, model) => {
            if (err) throw err;
        });
    }
    res.redirect('/admin-account/course-accounts'); /////// Cambiar para que se direccione al link del curso exacto que fue creado (pre-page-course)
}

/** 
 * FUNCIÓN PARA ADMINISTRADOR -
 * actualiza la información del curso
 * @class update_course
 * @param {Object} req - La solicitud
* @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id {string} Id correspondiente al curso 
 * @param req.body.name_course {string} Nombre del curso
 * @param req.body.code_course {number} Código del curso
 * @param req.body.type {string} Tipo de curso
 * @param req.body.id_tutor {string} Id del tutor
 * @param req.body.students {Object} Conjunto de ids de los estudiantes
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param {number} res.status - Estado de la respuesta (200 - OK)
 * @param {Object} res.send - Envia valor true
*/
exports.update_course = function(req, res) {
    var students = JSON.parse(req.body.students);
    var name_course = req.body.name_course,
        id_tutor = req.body.id_tutor,
        type = req.body.type,
        name_tutor, email_tutor;
    Persona.findById(id_tutor,(err, tutor)=>{ //busca la información del profesor que se ha asigando y la actualiza si no queda en blanco
        if(tutor){
            name_tutor = tutor.nombres;
            email_tutor = tutor.correo;
            assigned= true;
        }else{
            assigned= false;
        }
        var data = {
            code_course: req.body.code_course,
            name_course: req.body.name_course,
            id_tutor: req.body.id_tutor,
            name_tutor: name_tutor,
            email_tutor: email_tutor,
            num_students: students.length,
            type: req.body.type,
            assigned: assigned
        }
        Course.findByIdAndUpdate(req.body.id, { $set: data }, { new: true }, (err, model) => {
                if (err) throw err;
        });
        Joined.updateMany({id_course: req.body.id}, { $set: {type: req.body.type, id_tutor:id_tutor,name_tutor:name_tutor,email_tutor:email_tutor, code_course: req.body.code_course, name_course: req.body.name_course} }, { new: true }, (err, model) => {
            if (err) throw err;
        });
        VideoClasses.updateMany({id_course: req.body.id}, { $set: {name_course:req.body.name_course} }, { new: true }, (err, model) => {
            if (err) throw err;
        });        
  
        res.status(200).send(true);
    });  
}

/** 
 * FUNCIÓN PARA ADMINTRADOR -
 * Se solicita información de un curso para ser editado
 * @class get_course_info
 * @param req {Object} La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {string} Id del curso
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send {Object} Se envia JSON con la información del curso en la base de datos

*/
exports.get_course_info = (req, res)=>{
    var id_course =  req.body.id_course;
    Course.findById(id_course,(err, course)=>{
        if(course){
            res.status(200).send(course);
        }else{
            res.status(406).send(false);
        }
    });
}

/** 
 * FUNCIÓN PARA ADMINTRADOR -
 * Guarda la información del curso editado 
 * @class saveChanges
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body._id {Object} Id del curso 
 * @param req.body.name_course {string} Nuevo nombre del curso 
 * @param req.body.description {strin} Nueva descripción del curso
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.nombres{string} Nombre del que edita el curso (ADMIN)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param {string} res.send - La respuesta
*/
exports.saveChanges = function(req, res) {
    Course.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true }, (err, model) => {
        if (err) throw err;
        Joined.updateMany({id_course: req.body._id},{$set: {"name_course":req.body.name_course,"description":req.body.description,"created_by_name":req.session.user.nombres}}, { new: true }, (err, model) => {
        if (err) throw err;
        res.status(200).send("exito");
        });    
    });
}

/** 
 * FUNCIÓN PARA ADMINTRADOR -
 * Se solicita información de las uniones (usuarios) de un curso para ser editado
 * @class get_joins_info
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {string} Id del curso
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param {Object} res.send - Objeto compueto por un string que adjuta informacion tipo string para construir dos tablas, 
 * Una tabla con la información del profesor asociado y
 * otra tabla con la información de los estudiantes matriculados a dicho curso 
*/
exports.get_joins_info = (req, res) =>{
    var textHtml1,textHtml2, course = false;
    Course.findById(req.body.id_course, 'id_tutor name_tutor email_tutor',(err, course)=>{
        //imprime tabla con el profesor asociado
        if(course.id_tutor){
            textHtml1 = '<table id="myTable4" class="table table4 striped responsive-table"> <thead> <tr> <th value="none"> TODOS </th> <th>NOMBRE</th> <th data-breakpoints="xs">CORREO</th> </tr></thead><tr value="' + course.id_tutor + '" id="tr_5"> <td> <p style="margin-top: 0px !important; margin-bottom: 0px !important"> <label> <input type="checkbox" class="check5" id="check5' + course.id_tutor + '" onclick="select_one_tutor2(this.id)"  checked="true"/> <span></span> </label> </p></td> <td id="name5' + course.id_tutor + '">' + course.name_tutor + '</td><td id="mail5' +  course.id_tutor + '">' +  course.email_tutor + '</td></tr></table>';
        }else{
            textHtml1 = '<table id="myTable4" class="table table4 striped responsive-table"> <thead> <tr> <th value="none"> TODOS </th> <th>NOMBRE</th> <th data-breakpoints="xs">CORREO</th> </tr></thead><tr id="empty_tutor"><td>No hay tutor asignados</td></tr></table>';
        }
        //imprime los estudiantes asociados
        Joined.find({id_course: req.body.id_course},'id_student name_student email_student',(err, joins)=>{
            if(joins){
                //imprime la tabla de los estudiantes asociados (matriculados al curso)
                textHtml2 = '<table id="myTable4_2" class="table table4 striped responsive-table"> <thead> <tr> <th id="select-all" value="none"> TODOS </th> <th>NOMBRE</th> <th data-breakpoints="xs">CORREO</th> <th> id_join</th></tr></thead> ';
                for(var i=0; i<joins.length; i++) {
                    textHtml2 = textHtml2 + '<tr id="tr_6' + joins[i].id_student + '" class="tr_6"> <th> <p style="margin-top: 0px !important; margin-bottom: 0px !important"> <label> <input type="checkbox" class="check_6' + joins[i].id_student + '" id="check6' + joins[i].id_student + '" onclick="select_one_student2(this.id)" checked="true"/> <span></span> </label> </p></th> <td>' + joins[i].name_student + '</td><td>' + joins[i].email_student + '</td><td>' + joins[i]._id + '</td></tr>';
                }
                result = {
                    textHtml1: textHtml1,
                    textHtml2: textHtml2,
                    course : course,
                    joins: joins
                }
                res.status(200).send(result);
            }else{
                textHtml2 = '<table class="table table4 striped responsive-table"> <thead> <tr> <th id="select-all" value="none"> TODOS </th> <th>NOMBRE</th> <th data-breakpoints="xs">CORREO</th> <th> id_join</th></tr></thead><tr id="empty_tutor"><td> No hay estudiantes asignados </td></tr> ';
            }
        });
    });
}

/** 
 * FUNCIÓN PARA ADMINTRADOR -
 * Se desvincula un usuario de un curso (page-admin-user.js)
 * @class unlink_user
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_user {string} Id del usuario a eliminar
 * @param req.body.id_course {string} Id del curso al cual pertenece el usuario a eliminar
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send  {string} Respuesta tipo ya sea "exito" para una ejecucion correcta o false , si hay req.body.id_user no coincide con ningun usuario en la base de datos
*/
exports.unlink_user = (req, res)=>{
    Persona.findById(req.body.id_user,(err, person)=>{
        if(person){
            if(person.tipo == "tutor"){ //borra información del tutor en el curso
                Course.findByIdAndUpdate(req.body.id_course, { $set: {id_tutor:"", name_tutor:""}}, { new: true }, (err, model) => {
                    if (err) throw err;
                });
                Joined.updateMany({id_course: req.body.id_course,},{$set: {id_tutor:"", name_tutor:""}}, { new: true }, (err, model) => {
                    if (err) throw err;
                });
                res.status(200).send("exito");
            }else{
                Joined.deleteOne({id_course: req.body.id_course, id_student: req.body.id_user}, (err) => { //elimina la union (estudiantes) de la base de datos
                    if (err) throw err;
                    res.status(200).send("exito");
                });
                Course.findById(req.body.id_course,(err, course)=>{//busca la cantidad de estudiantes y guarda el nuevo valor
                    if(course){
                        var num_students = Number(course.num_students)-1;
                        Course.findByIdAndUpdate(req.body.id_course, { $set: {num_students:num_students}}, { new: true }, (err, model) => {
                            if (err) throw err;
                        });
                    }
                });
            }
        }else{res.status(406).send(false);}
    });
}

/** 
 * FUNCIÓN PARA ADMINTRADOR -
 * Elimina el curso de la base de datos
 * @class delete_course
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {string} Id del curso
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario que envia la solicitud
 * @param req.session.user.tipo {string} tipo de usuario (admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send  {string} Respuesta tipo ya sea "exito" para una ejecucion correcta o false , si hay req.body.id_user no coincide con ningun usuario en la base de datos
*/
exports.delete_course = function(req, res) {
    Course.findOne({ _id: req.body.id_course}, function(err, course) {
        if(course){
            if(course.created_by_id == req.session.user._id || req.session.user.tipo == "admin"){
                var path = __basedir + '/UploadedFiles/' + course._id;
                rimraf(path, (err) => {
                    if (err) throw err;
                });
                //Se borra el curso de la base de datos
                Course.deleteOne({ _id: req.body.id_course }, function(err) {
                    if (err) return handleError(err);
                    //se borra las uniones con estudiantes a este curso en la base de datos
                    Joined.deleteMany({ id_course: req.body.id_course }, function(err) {
                        if (err) return handleError(err);
                        //Se borran los archivos de la base de datos
                        File.deleteMany({ from_course_id: req.body.id_course }, function(err) {
                            if (err) return handleError(err);
                                res.status(200).send("exito");
                        });
                    });
                });
            }else{res.status(406).send(false);}
        }else{res.status(406).send(false);}
    });
}

//****************************************************//
//**** FUNCION PARA RELACIONAR CURSO Y ESTUDIANTE ****//
//***************************************************//

/** 
 * FUNCIÓN PARA ADMINTRADOR -
 * Guarda en la base de datos un doc donde relaciona el curso y el estudiante
 * @class create_join
 * @param req {Object} La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {string} Id del curso
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send  {string} Respuesta tipo ya sea "true" para una ejecucion correcta o "false" , si req.body.id_course no coincide con ningun curso en la base de datos
*/
exports.create_join = function(req, res) {
    Course.findById(req.body.id_course, (err, course)=>{
        if(course){
            num = Number(course.num_students) +1;
            Course.findByIdAndUpdate(course._id, { $set: {num_students:num} }, { new: true }, (err, model) => {
                if (err) throw err;
            }); 
            Persona.findById(req.body.id_student,(err, estudent)=>{
                Joined.findOne({id_course: req.body.id_course, id_student: req.body.id_student}, (err, join)=>{
                    if(estudent && !join){
                        let join = new Joined({
                            code_course: course.code_course,
                            name_course: course.name_course,
                            id_course: course._id,
                            name_student: estudent.nombres,
                            id_student: estudent._id,
                            email_student: estudent.correo,
                            status: "active",
                            type: course.type,
                            id_tutor: course.id_tutor,
                            name_tutor: course.name_tutor,
                            exponent: "negative",
                            color: selectColorRGB()
                        });
                        join.save();
                        res.status(200).send(true);
                    }
                });
            });
        }else{res.status(406).send(false);}
    }); 
}

function selectColorRGB(){
    list_color= ['#ffcdd2', '#ef9a9a', "#e57373", '#ef5350', '#f44336', '#e53935', '#f48fb1', '#ec407a', '#ce93d8', '#ba68c8', '#9c27b0', '#2196f3', '#1976d2', '#0d47a1', '#2962ff', '#4db6ac', '#009688', '#00695c', '#004d40', '#006064', '#01579b', '#0288d1', '#0097a7', '#00796b', '#03a9f4', '#00bcd4', '#009688', '#4db6ac', '#4dd0e1', '#0091ea', '#1b5e20', '#43a047', '#81c784', '#aed581', '#8bc34a', '#689f38', '#dce775', '#cddc39', '#afb42b', '#827717', '#69f0ae', '#00e676', '#00c853', '#b2ff59', '#76ff03', '#64dd17', '#aeea00', '#c6ff00', '#eeff41', '#fbc02d', '#f9a825', '#f57f17', '#ffff00', '#ffea00', '#d84315' , '#6d4c41', '#5d4037', '#212121', '#424242', '#616161', '#607d8b', '#455a64'  ]
    random_num = (Math.random()*61)+1;
    color = list_color[random_num | 0];
    return color;
}

/** 
 * FUNCIÓN PARA ADMINTRADOR -
 * Desvincula a un estudiante de un curso (page-admin-course.js)
 * @class delete_join
 * @param req {Object} La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {string} Id del curso
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send  {string} Respuesta tipo ya sea "true" para una ejecucion correcta o "false" , si req.body.id_course no coincide con ningun curso en la base de datos
*/
exports.delete_join = (req, res) => {
    Course.findById(req.body.id_course,(err, course)=>{
        if(course){
            num = Number(course.num_students) -1;
            Course.findByIdAndUpdate(req.body.id_course, { $set: {num_students:num} }, { new: true }, (err, model) => {
                if (err) throw err;
            });              
        }
        Joined.deleteOne({ id_course: req.body.id_course, id_student: req.body.id_student }, function(err) {
            if (err) return handleError(err);
            res.status(200).send(true);
        }); 
    });
   
}

//(FUNC. PARA PROFESOR) envia el id del expositor 
/*exports.getExpo = (req, res) =>{
    Course.findOne({_id: req.body.id_course},(err,course)=>{
        if(course){
            var exponentID = course.exponent;
            res.status(200).send(exponentID);
        }
    });
}*/

