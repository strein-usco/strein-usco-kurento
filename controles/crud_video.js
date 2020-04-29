
/**
 * Módulo que corresponde a las funcionalidades para el manejo de información en base a la clases grabadas (videos con extension .wemb) en el servidor,
 * de igual modo, se trabajaran con funciones básicas en base de datos (CRUD).
 *
 * Para el desarrollo de este módulo, se han tomado secciones de otros scripts que fueron publicados 
 * en la red para la divulgación, los cuales son provenientes de la siguiente página:
 * https://medium.com/@daspinola/video-stream-with-node-js-and-html5-320b3191a6b6
 *
 * @see {@ https://medium.com/@daspinola/video-stream-with-node-js-and-html5-320b3191a6b6}  => Script para permitir que los usuarios
 * reproduzcan videos almacenados en el servidor.
 *
 * @module Controller4
 * @see module:routes/videoForm
 * @requires module:routes/videoForm
 */
let express = require('express');
let path = require('path');
let session = require('express-session');
var FormData = require('form-data');
var http = require('http');
var rimraf = require('rimraf');
let router = express.Router();
var fs = require('fs');

let VideoClasses = require('./../models/videoclass'),
mongoose = require('./../config/conexion'),
Persona = require('./../models/persona'),
Correos = require('./../models/correos'),
Course = require('./../models/courses'),
Joined = require('./../models/joined'),
File = require('./../models/files');


/** 
 * FUNCIÓN PARA PROFESORES -
 * Almacena en la base de datos los parametros para una videoclase.
 * @class pushClassName
 * @param req {Object} Solicitud con parametros (body)
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.class_name {Object} Nombre de la videoclase
 * @param req.body.id_course {strin} Id del curso perteneciente a la videoclase
 * @param req.body.date {string} Fecha de la videoclase (MM DD,YYYY)
 * @param req.body.time {string} Hora de la videoclase (HH:MM AM/PM)
 * @param req.body.typeOfStream {string} Tipo de video clase, no-share-screen para el uso de un tablero, chat y videocams; 
 * y para share-screen se brinda tablero, chat, videocams y se comparte pantalla (solo tutor)
 * @param req.body.id_class {string} Id de la videoclase (opcion solo para editar los parametros de una video clase previamente creada)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {string} Para un proceos exitoso
 * @param res.redirect {string} Redirecciona /tutor-account, si se el parametro req.body.id_course está vacio
*/
exports.pushClassName = (req, res) => {
    if(req.body.id_course){
        if(req.body.id_class == ""){
            Course.findById(req.body.id_course, (err, course)=>{
                let cla = new VideoClasses({
                    class_name: req.body.class_name,
                    name_course: course.name_course,
                    id_course: req.body.id_course,
                    id_tutor: course.id_tutor,
                    date: req.body.date,
                    time: req.body.time,
                    private : "false",
                    schedule: true,
                    num:0,
                    typeOfStream: req.body.typeOfStream
                }); 
                cla.save(); 
                res.status(200).send(true);
            });
        }else{
            VideoClasses.findByIdAndUpdate(req.body.id_class, { $set: req.body }, { new: true }, (err, model) => {
                if (err) throw err;
                res.status(200).send(true);
            });
        }
    }else{res.redirect('/tutor-account/');}

}

/** 
 * FUNCIÓN PARA PROFESOR Y ESTUDIANTE -
 * Almacena en un objeto el diseño de una tabla en html, el cual almacena todos los cursos pertenecientes al usuario quien hace la solicitud.
 * @class getDisplayClasses
 * @param req {Object} Solicitud con parametros (body y session)
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {strin} Id del curso perteneciente a la videoclase
 * @param req.session {Object} Almacena o accede a los datos de sesion
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user.tipo {string} Tipo de cuenta (tutor, estudiante o admin)
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send  {Object} Objeto con cadena de texto en html
*/
exports.getDisplayClasses = (req, res) =>{
    var contetnSchedule1, contetnSchedule2;
    if (req.session.user.tipo == "tutor") {
        VideoClasses.find({id_course: req.body.id_course}, (err, videos) => {
            if(videos){
            var contentHTML = ' <div class="card"> <div id="solicitudes" class="redusco-text"><i class="material-icons redusco-text" style="padding-right: 20px; margin-top: 1%;margin-left: 2%">add_alert</i>Clases</div><div style="overflow: auto;height: 450px;width: 100%" class="dataTables_wrapper"><br><a id="create_class" class="waves-effect waves-light btn redusco yellowusco-text right-align">CREAR CLASE</a><div style="overflow: auto;height: 450px;width: 100%"> <table> <thead> <tr> <th>Fecha</th> <th>Clase</th> <th>Reproducir</th> <th>Eliminar</th> </tr></thead>';
            for (var i=videos.length-1; i>=0; i--){
                contetnSchedule1 = '<td style="padding-left: 25px" id="' + videos[i]._id + '"><a>EN CALENDARIO</a></td>';
                contetnSchedule2 = '<td style="padding-left: 25px" id="' + videos[i]._id + '" onclick="play_video(this.id)"><a href="#bottom"><i class="material-icons redusco-text">slideshow</i></a></td>';
                contentHTML = contentHTML + ' <tr id="tr_del_' + videos[i]._id + '"> <td>' + videos[i].date +' ' + videos[i].time + '</td><td>' + videos[i].class_name + '</td>';
                (videos[i].schedule === "true")? contentHTML = contentHTML + contetnSchedule1: contentHTML = contentHTML + contetnSchedule2;
                contentHTML = contentHTML + '<td><a type="button" id="del_'+ videos[i]._id +'" name="' + videos[i].class_name + '" onclick="deleteClass(this.id)" ><i class="small material-icons redusco-text">delete</i></a></td></tr> ';
            }
            contentHTML = contentHTML + '</table></div>';
            var result = {
                contentHTML: contentHTML
            }
            res.status(200).send(result);
            }else{res.status(406).send(false);}
        });
    } else if (req.session.user.tipo == "estudiante") {
        VideoClasses.find({id_course: req.body.id_course}, (err, videos) => {
            if(videos){
            var contentHTML = ' <div class="card"> <div id="solicitudes" class="redusco-text"><i class="material-icons redusco-text" style="padding-right: 20px; margin-top: 1%;margin-left: 2%">add_alert</i>Clases</div><div style="overflow: auto;height: 450px;width: 100%" class="dataTables_wrapper"><br><div style="overflow: auto;height: 450px;width: 100%"> <table> <thead> <tr> <th>Fecha</th> <th>Clase</th> <th>Reproducir</th></tr></thead>';
            for (var i=videos.length-1; i>=0; i--){
                contetnSchedule1 = '<td style="padding-left: 25px" id="' + videos[i]._id + '"><a>EN CALENDARIO</a></td>';
                contetnSchedule2 = '<td style="padding-left: 25px" class="playvideo" id="' + videos[i]._id + '"><a href="#bottom"><i class="material-icons redusco-text">slideshow</i></a></td>';
                contentHTML = contentHTML + ' <tr id="tr_del_' + videos[i]._id + '"> <td>' + videos[i].date +' ' + videos[i].time + '</td><td>' + videos[i].class_name + '</td>';
                (videos[i].schedule === "true")? contentHTML = contentHTML + contetnSchedule1: contentHTML = contentHTML + contetnSchedule2;
            }
            contentHTML = contentHTML + '</tr></table></div>';
            var result = {
                contentHTML: contentHTML
            }
            res.status(200).send(result);
            }else{res.status(406).send(false);}
        });
    }

}

/** 
 * FUNCIÓN PARA PROFESOR -
 * Elimina video en el servidor y su correspondiete información en la base de datos.
 * @class del_info_video
 * @param req {Object} Solicitud con parametros (body)
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.idvideo {strin} Id de la videoclase
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send  {string} Envio de la cadena de texto "exito"
*/
exports.del_info_video = (req,res) => {
    VideoClasses.findById(req.body.idvideo, (err, video)=>{
        if(video){
            //var videoNum = 0;
            //var path = _basedir + '/UploadedFiles/' + video.id_tutor + "/" + video.id_course + "/" + video.id_class + ".webm";
            //var path = __basedir + '/UploadedFiles/' + video.id_course + "/" + video._id + "-0.webm";
            for (var videoNum = 0; videoNum <= video.num; videoNum++) {
                path = __basedir + '/UploadedFiles/' + video.id_course + "/" + video._id + "-" + videoNum + ".webm";
                if (fs.existsSync(path)) {
                    fs.unlink(path, (err) => {
                        if (err) throw err;
                    });
                }
            }

            VideoClasses.deleteOne({ _id: req.body.idvideo }, function(err) {
                if (err) return handleError(err);
            });
            res.status(200).send("exito")
        }
    });
}

/** 
 * FUNCIÓN PARA PROFESOR -
 * Se modifica el parametro "schedule" de la videoclase en solicitud, pasa de tener un valor "true" a "falso", esto con el fin de especificar que la clase ha concluido, 
 * permitiendo así, la visualización de la clase en video.
 * @class tutor_left_class
 * @param req {Object} Solicitud con parametros (body)
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_videoclass {strin} Id de la videoclase en solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 Not Acceptable)
 * @param res.send  {string} Envio de la cadena de texto "true"
*/
exports.tutor_left_class = (req, res)=>{
    VideoClasses.findByIdAndUpdate(req.body.id_videoclass, { $set: { schedule: "false" } }, { new: true }, (err, video) => {
        if (err) throw err;
        res.status(200).send(true);
    });
}

/** 
 * FUNCIÓN PARA PROFESOR -
 * Almacenamiento de la clase envivo por tramos.
 * @class pushVideo
 * @param req {Object} Solicitud con parametros (body y files)
 * @param req.files {Object} Datos tipo blob con la informacion del video
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {strin} Id del curso al cual pertenece la videoclase
 * @param req.body.name_video {strin} INombre de la videoclase, este corresponde al mismo id de la clase mas el simbolo "+" seguido a la cantidad de veces que la pagina se ha recargado
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {string} Envio de la cadena de texto "true"
*/
exports.pushVideo = (req, res)=>{
        fileExtension = '.webm'
        path = __basedir + '/UploadedFiles/' + req.body.id_course + '/' + req.body.name_video + fileExtension;
        course_path = __basedir + '/UploadedFiles/' + req.body.id_course;
       // data = req.files.data.data  
       data1 =  req.body.data;  
       var  data = new Buffer(data1, 'base64');        
        //const { data } = req.body;
        if (!fs.existsSync(course_path)) {
            fs.mkdirSync(course_path);
        }
        if (data instanceof Buffer) {
            if (!fs.existsSync(path)) {
                buffView = new Uint8Array(data);
                fs.writeFileSync(path, buffView);
            } else {
                buffView = new Uint8Array(data);
                fs.appendFileSync(path, buffView);
            }
        }
        res.status(200).send(true);

        /*fileExtension = '.webm'
        path = __basedir + '/UploadedFiles/' + req.body.id_course + '/' + req.body.name_video + fileExtension;
        course_path = __basedir + '/UploadedFiles/' + req.body.id_course;
        data = req.files.data.data 
        if (!fs.existsSync(course_path)) {
            fs.mkdirSync(course_path);
        }
        if (data instanceof Buffer) {
            if (!fs.existsSync(path)) {
                buffView = new Uint8Array(data);
                fs.writeFileSync(path, buffView);
            } else {
                buffView = new Uint8Array(data);
                fs.appendFileSync(path, buffView);
            }
        }
        res.status(200).send(true);*/

        /*try {
            fileExtension = '.webm'
            path = __basedir + '/UploadedFiles/' + req.body.id_course + '/' + req.body.name_video + fileExtension;
            course_path = __basedir + '/UploadedFiles/' + req.body.id_course;
           // data = req.files.data.data  
           data =  req.body.data;          
            //const { data } = req.body;
            if (!fs.existsSync(course_path)) {
                fs.mkdirSync(course_path);
            }
            //const dataBuffer = new Buffer(data, 'base64');
            const dataBuffer = new Buffer.from(data, "base64"); //guarda la información en base 64
            const fileStream = fs.createWriteStream(path, {flags: 'a'});
            fileStream.write(dataBuffer);
            //console.log(dataBuffer);
            return res.json({gotit: true});
        } catch (error) {
            console.log(error);
            return res.json({gotit: false});
        }*/




}

/** 
 * FUNCIÓN PARA PROFESOR -
 * Envia el numero de videos almacenados en una misma clase.
 * @class num_videos
 * @param req {Object} Solicitud con parametros (body y files).
 * @param req.files {Object} Datos tipo blob con la informacion del video-
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload).
 * @param req.body.id_video {strin} Id de la videoclase en solicitud.
 * @param res {Object} La respuesta en un objeto tipo JSON.
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 - Not Acceptable).
 * @param res.send  {string} Envio del numero de video o "false" si el parametro req.body.id_video no corresponde a ningun id en la base de datos.
*/
exports.num_videos = (req, res)=>{
    VideoClasses.findById(req.body.id_video, (err, video) => {
        if (err) throw err;
        if(video){
            res.status(200).send(video.num);
        }else{res.status(406).send(false);}
    });
}

// (FUNC. PARA USUARIOS)funcion para cargar un video
/** 
 * FUNCIÓN PARA PROFESOR -
 * Envia la videoclase desde el servidor al cliente.
 * @class video
 * @param req {Object} Solicitud con parametros (body y files).
 * @param req.files {Object} Datos tipo blob con la informacion del video-
 * @param req.params {Object} Contiene propiedades asignadas asginada a la ruta nombrada
 * @param req.params.id {string} Propiedad de la ruta nombrada
 * @param res {Object} La respuesta en un objeto tipo JSON.
 * @param res.status  {number} Estado de la respuesta (200 - OK o 406 - Not Acceptable).
 * @param res.send  {string} 
*/
exports.video = function(req, res) {
    id_video = req.params.id.split('&&').shift(); ///id del video en la base de datos
    num_video = req.params.id.split('&&').pop(); ///numero del video
    name_video = id_video + '-' + num_video + '.webm';
    VideoClasses.findOne({_id:id_video}, (err, video) =>{
        if(video){
            var path = __basedir + '/UploadedFiles/' + video.id_course +'/' + name_video;            
            if (fs.existsSync(path)) {
                const stat = fs.statSync(path)
                const fileSize = stat.size
                const range = req.headers.range

                if (range) {
                    const parts = range.replace(/bytes=/, "").split("-")
                    const start = parseInt(parts[0], 10)
                    const end = parts[1] ?
                        parseInt(parts[1], 10) :
                        fileSize - 1
                        if (end <= 0) {
                            return res.status(406).send(false);
                        }
                    const chunksize = (end - start) + 1
                    const file = fs.createReadStream(path, { start, end })
                    const head = {
                        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': chunksize,
                        'Content-Type': 'video/mp4',
                    }

                    res.writeHead(206, head)
                    file.pipe(res)
                } else {
                    const head = {                    

                        'Content-Length': fileSize,
                        'Content-Type': 'video/mp4',
                    }
                    res.writeHead(200, head)
                    fs.createReadStream(path).pipe(res)
                }
            }else{res.status(406).send(false);}
        }
    });
}




