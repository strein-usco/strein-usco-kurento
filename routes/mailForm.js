/** Express router providing user related routes
 * @module routes/mailForm
 * @requires Controller3
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
	 * @memberof module:Controller3
	 */
	Controller3 = require('./../controles/crud_mail'),
    app = express();
    

/********************  *********************/
/** (FUNC. PARA PROFESORES) Guarda mensajes en la base de datos */
router.post('/tutor_email', Controller3.tutor_email);

/** (FUNC. PARA ESTUDIANTES) Guarda mensajes en la base de datos */
router.post('/emailStudent', Controller3.emailStudent);

/** Función para ver un mensaje especifico */
router.post('/getSpecificMail', Controller3.getSpecificMail);

/** Funcion para eliminar un mensaje en la base de datos */
router.post('/deleteMessage', Controller3.deleteMessage);

module.exports = router;