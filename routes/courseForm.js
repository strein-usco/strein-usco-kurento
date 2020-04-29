/** Express router providing user related routes
 * @module routes/courseForm
 * @requires Controller2
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
	 * @memberof module:Controller2
	 */
	Controller2 = require('./../controles/crud_course');

var SocketIOFileUpload = require("socketio-file-upload");

let app = express().use(SocketIOFileUpload.router);


/******************** FUNCIONES DE CURSOS *********************/

/** (FUNC. ADMIN) Crea un nuevo curso y lo almacena en la base de datos */
router.post('/new_course', Controller2.new_course);

/** (FUNC. ADMIN) actualiza la información del curso */
router.post('/update_course', Controller2.update_course);

/** (FUNC. ADMIN) Se solicita información de un curso para ser editada */
router.post('/get_course_info', Controller2.get_course_info);

/** (FUNC. ADMIN) Guarda la información del curso editado */
router.post('/save_changes', Controller2.saveChanges);

/** (FUNC. ADMIN) Se solicita información de las uniones de un curso */
router.post('/get_joins_info', Controller2.get_joins_info);

/** (FUNC. ADMIN) Se desvincula un usuario de un curso (page-admin-user.js) */
router.post('/unlink_user', Controller2.unlink_user);

/** (FUNC. ADMIN) Elimina curso de la base de datos */
router.post('/delete_course', Controller2.delete_course);

/** (FUNC. ADMIN) Guarda en la base de datos un doc donde relaciona el curos y el estudiante */
router.post('/create_join', Controller2.create_join);

/**  (FUNC. ADMIN) Desvincula a un estudiante de un curso (page-admin-course.js) */
router.post('/delete_join', Controller2.delete_join);

// (FUNC. PARA PROFESOR) envia el id del expositor */
// router.post('/getExpo', Controller2.getExpo);

module.exports = router;