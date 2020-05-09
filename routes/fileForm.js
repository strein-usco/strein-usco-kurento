/** Express router providing user related routes
 * @module routes/fileForm
 * @requires Controller5
 */

/**
 * express module
 * @const
 */
let express = require('express'),
	router = express.Router(),
	session = require('express-session'),
	mongoose = require('./../config/conexion'),
	Persona = require('./../models/persona'),
	Course = require('./../models/courses'),
	File = require('./../models/files'),
	/**
	 * @memberof module:Controller5 
	 */
	Controller5 = require('./../controles/crud_file'),
    app = express();
    

/** Trae el archivo del cliente para almacenarlo en la carpeta UploadedFiles y en la base de datos*/
router.post('/save_file', Controller5.save_file);

/** Elimina el o los archivos del servidor e información de la base de datos */
router.post('/delete_file', Controller5.delete_file);

/** (FUNC. PARA PROFESOR) permite enviar los archivos (pre-page-course.html) */
router.post('/getFileTutor', Controller5.getFileTutor);

/** (FUNC. PARA PROFESOR) permite enviar los archivos para la transmision en tiempo real (page-course.html) */
router.post('/getAllfiles', Controller5.getAllfiles);

/** (FUNC. PARA ESTUDIANTE) permite descargar los archivos */
router.post('/get_files', Controller5.get_files);

/** (FUNC. PARA ESTUDIANTE) se permite descargar info en base64 del archivo para ser descargado*/
router.post('/getPDF', Controller5.getPDF);

//(FUNC. PARA ESTUDIANTE EXPOSITOR) permite que el estudiante pueda compartir archivos
//router.post('/requestUploadFile', Controller5.requestUploadFile);

module.exports = router;