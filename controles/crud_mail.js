/** 
 * Módulo que corresponde a las funcionalidades para el manejo de correos en el servidor,
 * de igual modo, se trabajarán con funciones básicas en base de datos (CRUD).
 * @module Controller3
 * @see module:routes/mailForm
 * @requires module:routes/mailForm
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

/** 
 * FUNCIÓN PARA PROFESORES -
 * Guarda mensajes en la base de datos
 * @class tutor_email
 * @param req {Object} Solicitud con parametros (body y session)
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {Object} Id del curso
 * @param req.body.subject {strin} Asunto del correo
 * @param req.body.textarea1 {string} Mensaje del correo
 * @param req.body.eachStudent_by_name {Object} Objeto con los id y los nombres del los estudiantes
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario que envia la solicitud
 * @param req.session.user.nombres {string} Nombre del usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {Object} Respuesta con archivos tipo pdf pertenecientes al curso
*/
exports.tutor_email= (req, res) =>{
	var NewString=[], NewString2=[],splitValue, replay_to_by_name, replay_to_by_id, i, name_course; 
	
	Course.findById(req.body.id_course,(err, course) =>{
		if(course) {
			name_course = course.name_course;
			replay_to_by_name = JSON.parse(req.body.eachStudent_by_name);
			for (i = 0;i < replay_to_by_name.length; i++) {
				splitValue = replay_to_by_name[i].student.split("/");
				NewString.push(splitValue[0]); //replay_to_by_id
				NewString2.push(splitValue[1]); //replay_to_by_name

				saveInfoMail(req.body.subject,req.body.id_course,name_course,req.session.user.nombres,req.session.user._id,req.body.textarea1, splitValue[1], splitValue[0], "negative");
			}
		replay_to_by_name = NewString2;
		replay_to_by_id = NewString;
		
		saveInfoMail2(req.body.subject,req.body.id_course,name_course,req.session.user.nombres, req.session.user._id,req.body.textarea1, replay_to_by_name, replay_to_by_id, "original");
		res.status(200).send("exito");
		}
	});
}

/** 
 * FUNCIÓN PARA ESTUDIANTES -
 * Guarda mensajes en la base de datos
 * @class emailStudent
 * @param {Object} req - Solicitud con parametros (body y session)
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {Object} Id del curso
 * @param req.body.subject {strin} Asunto del correo
 * @param req.body.textarea1 {string} Mensaje del correo
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario que envia la solicitud
 * @param req.session.user.nombres {string} Nombre del usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (406 - Not Acceptable), devuleve este estado si el curso no existe en la base de datos
 * @param res.send  {} Si el curso no existe en la base de datos envia un "false" y redirecciona si es lo contrario 
*/
exports.emailStudent = function(req,res){
	Course.findById(req.body.id_course, (err, course)=>{
		if(course){
			saveInfoMail(req.body.subject,req.body.id_course,course.name_course,req.session.user.nombres, req.session.user._id,req.body.textarea1,course.name_tutor, course.id_tutor, "original");
			saveInfoMail(req.body.subject,req.body.id_course,course.name_course,req.session.user.nombres, req.session.user._id,req.body.textarea1,course.name_tutor, course.id_tutor, "negative");	
			res.redirect("/student-account");
		}else{
			res.status(406).send(false);
		}
	});
}

/** 
 * Función para visualización de un mensaje en específico
 * @class getSpecificMail
 * @param {Object} req - Solicitud con parametros (body)
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_message {Object} Id del correo 
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send {(string|Object)} Si el curso no existe en la base de datos envia un "false" y envia la informacion de correo si es lo contrario
*/
exports.getSpecificMail = (req, res) =>{
	var contentHTML, result, newMail = "";
	Correos.findById(req.body.id_message, (err, correo)=>{
		if(correo){
			contentHTML = '<div class="row"> <div class="col s12 m12"> <div class="card"> <div class="card-image"> <img src="/images/sample-1.jpeg"> <span class="card-title"><p> ' + getFullDate() + ' </p></span> <button id="reply' + correo._id + '" class="btn-floating halfway-fab waves-effect waves-light yellowusco" onclick="replyMessage(this.id)"><i class="material-icons left">create</i></button> </div> <div class="card-content greenuscob"> <b> ASUNTO: "' + correo.subject + '"</b><br> <b>enviado por: ' + correo.created_by_name + ' </b> <div style="overflow:auto;height: 160px;"><p>'+ correo.textarea1 +'</p></div><button id="msg' + correo._id + '" class="btn-floating waves-effect waves-light redusco delete" onclick="delete_message(this.id)"><i class="material-icons left">delete</i></button> </div> </div> </div> </div>';
		    if(correo.seen == "negative"){
        		newMail = "1";
        	}
	        if(correo.seen == "negative"){
	        	newMail = "1";
	        }
	        result = {
				contentHTML:contentHTML,
				newMail: newMail
			}
			res.status(200).send(result);
			Correos.findByIdAndUpdate(req.body.id_message, {$set:{seen:"positive"}},{new:true},(error,model) => {
				if (err) throw err;
			});
   		}else{res.status(406).send(false);}
	});
}

/** 
 * Función para eliminar un mensaje en la base de datos
 * @class deleteMessage
 * @param {Object} req - Solicitud con parametros (body)
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_message {Object} Id del correo 
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send {string} Aviso: "mensaje eliminado"
*/
exports.deleteMessage = (req, res) => {
    Correos.deleteOne({ _id: req.body.id_message }, function(err) {
        if (err) return handleError(err);
    });
    res.status(200).send("mensaje eliminado");
}

function getFullDate (){
	var months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
	var d = new Date();
	var date = d.getDate();
	var month = months[d.getMonth()];
	var year = d.getFullYear();
	if(Number(date) < 10 ){
		date = "0" + date;
	}

 	var fullDate = date + "/" + month + "/" + year;
	return fullDate;
}

function getFullTime(){
	var d = new Date();
	var horas = d.getHours();
	var minutos = d.getMinutes();
	var segundos = d.getSeconds();
	if(Number(segundos) < 10 ){
		segundos = "0" + segundos;
	}
	if(Number(minutos) < 10 ){
		minutos = "0" + minutos;
	}
	if(Number(horas) < 10 ){
		horas = "0" + horas;
	}
	var fullClock = horas + ":" + minutos + ":" + segundos;
	return fullClock;
}

/*function originalDate (fullDate, fullClock){
	var date, hora, minuto;
	var d = new Date();
	var hours = d.getHours(); //numero de hora actual
	var minutes = d.getMinutes();//número de minuto actual
	if(fullDate == getFullDate()){
		hora = Number(hours) - Number(fullClock.slice(0,2));
		if(hora > 5){
			date = fullClock;
		}else if(hora > 1){
			date = "Hace " + hora + " horas";
		}else if(hora == 1){
			date = "Hace 1 hora";
		}else{
			minuto = Number(minutes) - Number(fullClock.slice(3,5));
			date = "Hace " + minuto + " min";
		}
	}else{
		date = fullDate;
	}
	return date;
}*/

function saveInfoMail(subject, id_course, name_course, myname, myID, textarea1, replay_to_by_name, replay_to_by_id, kindOfSeen){
	let mail = new Correos({
		subject: subject,
		id_course: id_course,
		name_course: name_course,
		created_by_name: myname,
		created_by_id: myID,
		textarea1: textarea1,
		replay_to_by_name: replay_to_by_name,
		replay_to_by_id: replay_to_by_id,
		seen: kindOfSeen,
		fullDate: getFullDate(),
		fullClock: getFullTime()

	});
	mail.save();
}

function saveInfoMail2(subject, id_course, name_course, myname, myID, textarea1, replay_to_by_name, replay_to_by_id, kindOfSeen){
	let mail = new Correos({
		subject: subject,
		id_course: id_course,
		name_course: name_course,
		created_by_name: myname,
		created_by_id: myID,
		textarea1: textarea1,
		replay_to_by_name: replay_to_by_name[0],
		replay_to_by_id: replay_to_by_id[0],
		seen: kindOfSeen,
		fullDate: getFullDate(),
		fullClock: getFullTime()

	});
	mail.save();
}

