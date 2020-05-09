/** 
 * Modulo que corresponde a todo tipo de funcionalidades para el manejo de archivos desde el servidor.
 * @module Controller5
 * @see module:routes/fileForm
 * @requires module:routes/fileForm
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
    PDFImage = require("pdf-image").PDFImage,
    PDF2Pic = require("pdf2pic");
var toPdf = require("office-to-pdf");

/** 
 * Trae el archivo del cliente para almacenarlo en la carpeta UploadedFiles y en la base de datos 
 * @class save_file
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario que envia la solicitud
 * @param req.session.user.nombres {string} Nombre del usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {string} Respuesta tipo ya sea "exito" para una ejecucion correcta
*/
exports.save_file = function(req, res) {
    var postData = '';
    //get the post information in fragments
    req.setEncoding('utf8');
    req.addListener('data', function(postDataChunk) {
        postData += postDataChunk;
    });
    //get the total post information
    req.addListener('end', function() {
        postData;
        file = JSON.parse(postData);
        var id_tutor, userName; 

        Joined.findOne({id_student: req.session.user._id, exponent: 'positive', id_course: file.id_course}, (err, join)=>{
            if(join){
                id_tutor = join.created_by_id;
                userName = req.session.user.nombres;
            }else{
                id_tutor = req.session.user._id;
                userName = 'profesor';
            }
        
        var fileRootName = file.name.split('.').shift(),
            fileExtension = file.name.split('.').pop(),
            state = file.state,
            id_course = file.id_course,
            name_course = file.from_course_name,
            static_name = dinamic_name = file.name,
            file_content = file.contents.split(',').pop(),
            path_pv_root = __basedir + '/UploadedFiles/' + id_course,
            path_pv = path_pv_root + "/" + dinamic_name,
            path2 = path_pv_root + "/" + fileRootName + ".txt",
            path, fileID = 2;

        var fileBuffer = new Buffer.from(file_content, "base64"); //guarda la información en base 64

        if (!fs.existsSync(path_pv_root)) {
            fs.mkdirSync(path_pv_root);
        }

        Course.findByIdAndUpdate(id_course, { $set: { path: path_pv_root } }, { new: true }, (err, model) => {
            if (err) throw err;
        });

        if (fileExtension == 'ppt' || fileExtension == 'pptx') { //convertir de power point a pdf
            static_name = dinamic_name = file.name.split('.').shift() + ".pdf";
            path_pv = path_pv_root + "/" + static_name;
            path_ppt = path_pv_root + "/" + file.name.split('.').shift() + "." + fileExtension;
            toPdf(fileBuffer).then(
                (pdfBuffer) => { 
                    path = path_pv;
                    while (fs.existsSync(path)) {
                        dinamic_name = fileRootName + '(' + fileID + ').pdf';
                        var dinamic_name2 = fileRootName + '(' + fileID + ').txt';
                        path2 = path_pv_root + "/" + dinamic_name2;
                        path = path_pv_root + "/" + dinamic_name;
                        fileID += 1;
                    }
                    save_file(static_name, dinamic_name, req.session.user._id, userName, id_course, name_course, path_pv_root, state);  //save name file in BD
                    //save name file in pdf in server
                    fs.writeFileSync(path, pdfBuffer);
                    fs.writeFileSync(path2, file_content);
                    var pdfImage = new PDFImage(path);
                    pdfImage.convertFile().then(function(imagePath) {
                        res.status(200).send("exito");
                    }, function(err) {
                        console.log("error: " + err);
                    });
                }, (err) => {
                    console.log(err)
                });
        } else {
            path = path_pv;
            while (fs.existsSync(path)) { //si existe el mismo nombre de archivo le agrega un + 1
                dinamic_name = fileRootName + '(' + fileID + ').' + fileExtension;
                var dinamic_name2 = fileRootName + '(' + fileID + ').txt';
                path2 = path_pv_root + "/" + dinamic_name2;
                path = path_pv_root + "/" + dinamic_name;
                fileID += 1; 
            }
            //save name file in BD
            fs.writeFileSync(path, fileBuffer);
            fs.writeFileSync(path2, file_content);
            save_file(static_name, dinamic_name, req.session.user._id, userName, id_course, name_course, path_pv_root, state);
        }
        //convertir pdf en imagen
        if (fileExtension == 'pdf') {
            /*var pdfImage = new PDFImage(path);
            pdfImage.convertFile().then(function(imagePath) {
                res.status(200).send("exito");
            }, function(err) {
                console.log("error: " + err);
            });*/

            const pdf2pic = new PDF2Pic({
              density: 100,           // output pixels per inch
              savename: fileRootName,   // output file name
              savedir: path_pv_root,    // output file location
              format: "png",          // output file format
              size: "1200x1200"         // output size in pixels
            });
             
            pdf2pic.convertBulk(path, -1).then((resolve) => {
              console.log("image converter successfully!");
              res.status(200).send("exito");
            });
        } else if(fileExtension == 'ppt' || fileExtension == 'pptx'){
        }else{res.status(200).send("exito");}
        });
    });
}

 /// funcion para almacenar info en la base de datos
function save_file(static_name, dinamic_name, userID, userName, id_course, name_course, path, state, file_content) {
    let fil = new File({
        static_name: static_name,
        dinamic_name: dinamic_name, //para cambiar cuando hayan archvios existentes con este nombre
        owner_id: userID,
        owner_name: userName,
        from_course_id: id_course,
        from_course_name: name_course,
        path: path,
        state: state,
        file_content: file_content
    });
    fil.save();
}

/** 
 * Elimina el o los archivos del servidor e información de la base de datos
 * @class delete_file
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.name_file {Object} Nombre del archivo a eliminar
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario que envia la solicitud
 * @param req.session.user.tipo {string} Tipo de usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {string} Respuesta tipo ya sea "exito" para una ejecucion correcta
*/
exports.delete_file = function(req, res) {
    File.findOne({ dinamic_name: req.body.name_file }, (err, file) => {
        if(file){
            if(file.owner_id == req.session.user._id || req.session.user.tipo == 'tutor'){              
                var dir_folder = __basedir + '/UploadedFiles/' + file.from_course_id + '/';
                File.deleteMany({ dinamic_name: req.body.name_file }, function(err) {
                    var fileRootName = file.dinamic_name.split('.').shift(),
                        fileExtension = file.dinamic_name.split('.').pop(),
                        path = dir_folder + file.dinamic_name,
                        path2 = dir_folder + fileRootName + '.txt',
                        //fileID = 0;
                        fileID = 1;

                    if (fileExtension == "pdf") {
                        //var dinamic_name = fileRootName + '-' + fileID + '.png',
                        var dinamic_name = fileRootName + '_' + fileID + '.png',
                            path3 = dir_folder + dinamic_name;
                        while (fs.existsSync(path3)) {
                            fs.unlink(path3, (err) => {
                                if (err) throw err;
                            });
                            fileID += 1;
                            //static_name = fileRootName + '-' + fileID + '.png';
                            static_name = fileRootName + '_' + fileID + '.png';
                            path3 = dir_folder + static_name;
                        }
                    }
                    //elimina el archivo original
                    if(fs.existsSync(path)){
                        fs.unlink(path, (err) => {
                            if (err) throw err;
                        });
                    }

                    //elimina el archivo txt del original
                    if(fs.existsSync(path2)){
                        fs.unlink(path2, (err) => {
                            if (err) throw err;
                        });
                    }

                    res.send("exitoso");
                });
            }
        }
    })
}

/** 
 * (FUNC. PARA PROFESOR) Funcion para mandar info en base 64 de imagenes para las caras de los archivos en el html pre-page-course
 * @class getFileTutor
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {Object} Id del curso
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {string} Respuesta tipo ya sea "exito" para una ejecucion correcta
*/
exports.getFileTutor = (req, res) => {
    var dir_folder = __basedir + '/UploadedFiles/' + req.body.id_course + '/';
    var path, nameFile, ext_root;
    var all_files = [];
    File.find({from_course_id: req.body.id_course }, (err, files) => {
        if (files) {
            var len = Object.keys(files).length;
            for (i = 0; i < len; i++) {
                ext_root = "." + files[i].dinamic_name.split('.').pop();
                if (ext_root == '.pdf') {
                    //nameFile = files[i].dinamic_name.split(ext_root, 1) + "-0.png"
                    nameFile = files[i].dinamic_name.split(ext_root, 1) + "_1.png"
                    path = dir_folder + nameFile;
                    var exist = fs.existsSync(path)
                    if (exist) {
                        buff = fs.readFileSync(path);
                        file_content = buff.toString('base64');
                    } else {
                        /*var root_path = dir_folder + files[i].dinamic_name;
                        var pdfImage = new PDFImage(root_path);
                        pdfImage.convertFile().then(function(imagePath) {

                        });*/
                        const pdf2pic = new PDF2Pic({
                          density: 100,           // output pixels per inch
                          savename: files[i].dinamic_name,   // output file name
                          savedir: dir_folder,    // output file location
                          format: "png",          // output file format
                          size: "1200x1200"         // output size in pixels
                        });
                         
                        pdf2pic.convertBulk(path, -1).then((resolve) => {
                          console.log("image converter successfully!");
                          res.status(200).send("exito");
                        });
                        //buff = fs.readFileSync(path);
                        file_content = '';
                    }
                    if (file_content == false) { file_content = "0" }
                    all_files.push(file_content);
                } else {
                    path = dir_folder + files[i].dinamic_name.split('.').shift() + ".txt";
                    if (fs.existsSync(path)) {
                        all_files.push(fs.readFileSync(path, "utf8").toString());
                    }else{
                        all_files.push("");
                    }
                }
            }
            res.status(200).send({ all_files: all_files });
        }
    });
}

/** 
 * (FUNC. PARA PROFESOR) permite enviar los archivos para la transmision en tiempo real (page-course.html)
 * @class getAllfiles
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {Object} Id del curso
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {string} Respuesta tipo ya sea "exito" para una ejecucion correcta
*/
exports.getAllfiles = function(req, res) {
    var dir_folder = __basedir + '/UploadedFiles/' + req.body.id_course + '/';
    var txt_file, path, file_content1, file_content, buff, nameFile, ext_root;
    var Allfiles = [];
    var amount = [];
    var facefiles = [];
    File.find({ from_course_id: req.body.id_course }, function(err, file) {
        if (file) {
            var len = Object.keys(file).length;
            for (i = 0; i < len; i++) {
                var num = 1;
                ext_root = "." + file[i].dinamic_name.split('.').pop();
                if (ext_root == ".pdf") {
                    //nameFile = file[i].dinamic_name.split(ext_root, 1) + "-0.png";
                    nameFile = file[i].dinamic_name.split(ext_root, 1) + "_1.png";
                    path = dir_folder+ nameFile;
                    if (fs.existsSync(path)) {
                        buff = fs.readFileSync(path);
                        file_content1 = buff.toString('base64');
                        while (fs.existsSync(path)) {
                            buff = fs.readFileSync(path); //lee la información de cada pagina-imagen 
                            file_content = buff.toString('base64'); // convierte la información en base 64
                            Allfiles.push(file_content);//Almacena la info base64 en un array
                            num++;
                            //nameFile = file[i].dinamic_name.split(ext_root, 1) + "-" + num + ".png";
                            nameFile = file[i].dinamic_name.split(ext_root, 1) + "_" + num + ".png";
                            path = dir_folder+ nameFile;
                        }
                    }else{
                        Allfiles.push("");
                    }
                } else {
                    path = dir_folder + file[i].dinamic_name;
                    if (fs.existsSync(path)) {
                        buff = fs.readFileSync(path);
                        file_content1 = buff.toString('base64');
                        Allfiles.push(file_content1);
                        num++;
                    }else{
                        Allfiles.push("");
                    }
                }
                amount.push(num-1);//guarda los valores de la cantidad de paginas por archivo
                facefiles.push(file_content1); //almacena la imagen de la priemra pagina
            }
            //facefiles => primera pagina de cada archivo (imagen base64)
            //Allfiles  => almacena cada una de las imagenes de todos los archivos
            //amount    => array con valores correspondintes a la cantidad de paginas por archivo
            res.send({ facefiles: facefiles, Allfiles: Allfiles, amount: amount,id_tutor: req.session.user._id });
        }

    });
}

/** 
 * (FUNC. PARA ESTUDIANTE) permite descargar los archivos del servidor al cliente
 * @class get_files
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {Object} Id del curso
 * @param req.session.user {Object} Información de session del usuario que envia la solicitud
 * @param req.session.user._id {string} Id del usuario que envia la solicitud
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {string} Respuesta, conjunto de archivos en base 64 pertenecientes al curso
*/
exports.get_files = (req, res) => {
    var txt_file, path, file_content, buff, nameFile;
    Joined.find({ id_course: req.body.id_course, id_student: req.session.user._id }, function(err, join) {
        if (join) {
            File.find({ from_course_id: req.body.id_course, state: "public" }, function(err, file) {
                Course.findById(req.body.id_course,(err, course)=>{               
                    if (file) {
                        var dir_folder = __basedir + '/UploadedFiles/' + req.body.id_course + '/';
                        var len = Object.keys(file).length;
                        var all_files = [];
                        for (i = 0; i < len; i++) {
                            if (file[i].dinamic_name.split('.').pop() == "pdf") {
                                nameFile = "." + file[i].dinamic_name.split('.').pop();
                                nameFile = file[i].dinamic_name.split(nameFile, 1) + "_1.png";
                                path = dir_folder + nameFile;
                                if (fs.existsSync(path)) {
                                    buff = fs.readFileSync(path);
                                    file_content = buff.toString('base64');
                                }else{file_content = "";}  
                            } else {
                                path = dir_folder + file[i].dinamic_name.split('.').shift() + ".txt";
                                if (fs.existsSync(path)) {
                                    file_content = fs.readFileSync(path, "utf8").toString();
                                }else{ file_content=""}
                            }
                            all_files.push(file_content);
                        }
                        res.send({ all_files: all_files });
                    }
                });
            })
        }
    });
}

/** 
 * (FUNC. PARA ESTUDIANTE) se permite descargar info en base64 del archivo para ser descargado
 * @class getPDF
 * @param {Object} req - La solicitud
 * @param req.body {Object} Conjunto de datos transmitidos (The JSON payload)
 * @param req.body.id_course {Object} Id del curso
 * @param req.body.name_file {Object} Id del curso
 * @param res {Object} La respuesta en un objeto tipo JSON
 * @param res.status  {number} Estado de la respuesta (200 - OK)
 * @param res.send  {Object} Respuesta con archivos tipo pdf pertenecientes al curso
*/
exports.getPDF = (req, res) => {
    var txt_file, path, num, numPDF;
    var all_filesPDF = [];
        Course.findOne({ _id: req.body.id_course }, (err, course) => {
            console.log('course');
            File.findOne({ static_name: req.body.name_file }, function(err, file) {
                console.log(file);
                var dir_folder = __basedir + '/UploadedFiles/' + req.body.id_course + '/';
                path = dir_folder + req.body.name_file.split('.').shift() + ".txt";
                if (fs.existsSync(path)) {
                    all_filesPDF = fs.readFileSync(path, "utf8").toString();
                    return res.send({ all_filesPDF: all_filesPDF });
                }
                return res.status(406).send(false);
            });
        });
    //});
}

// (FUNC. PARA ESTUDIANTE EXPOSITOR) Confirma si el estudiante está habilitado para subir archivos
/*exports.requestUploadFile = (req, res)=>{
    Joined.findOne({id_course: req.body.id_course, id_student: req.session.user._id}, (err, join)=>{
        if(join){
            Course.findOne({_id: req.body.id_course, exponent: join._id}, function(err, course) {
                (course)?res.status(200).send(true): res.status(406).send(false);
            });
        }
    });
}*/