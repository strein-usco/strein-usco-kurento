/** Express router providing user related routes
 * @module routes/videoForm
 * @requires Controller4
 */

/**
 * express module
 * @const
 */
let express = require('express');
let router = express.Router();
let session = require('express-session');
let mongoose = require('./../config/conexion');
let Persona = require('./../models/persona');
let Course = require('./../models/courses');
let File = require('./../models/files');
var SocketIOFileUpload = require("socketio-file-upload");
let app = express()
    .use(SocketIOFileUpload.router);
/**
 * @memberof module:Controller4
 */
let Controller4 = require('./../controles/crud_video');


/** (FUNC. PARA PROFESORES) guarda en la BD el nombre de la clase */
router.post('/pushClassName', Controller4.pushClassName);

/** (FUNC. PARA PROFESORES) imprime todas las clases creadas */
router.post('/getDisplayClasses', Controller4.getDisplayClasses);

/** (FUNC. PARA PROFESORES) Elimina informacion de video y clase en la base de datos */
router.post('/del_info_video', Controller4.del_info_video);

/** (FUNC. PARA PROFESORES) se cambia el valor de schedule por false (clase finalizada y lista para ser vista) */
router.post('/tutor_left_class', Controller4.tutor_left_class);

/** (FUNC. PARA PROFESORES) guarda en en el servidor parte de la clase (video) */
router.post('/pushVideo', Controller4.pushVideo);

/**  FUNC. PARA USUARIOS) envia el numero de videos grabados en una clase */
router.post('/num_videos', Controller4.num_videos);

/**  FUNC. PARA PROFESORES) Elimina un video específico de una clase. */
router.post('/delete_video_num', Controller4.delete_video_num);

/**  (FUNC. PARA USUARIOS) para reproducir videos */
router.get('/video/:id', Controller4.video);

module.exports = router;