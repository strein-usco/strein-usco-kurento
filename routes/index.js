/** Express router providing user related routes
 * @module routes/index
 * @requires Controller
 */

/**
 * express module
 * @const
 */
let express = require('express');
let router = express.Router();
/**
 * @memberof module:Controller
 */
let Controller = require ('./../controles/pages_and_session');
let jwt = require('jwt-simple');
let moment = require('moment');
let configu = require('../config/configs');


/******************** PAGINAS DEL INTRO ************************/

/**  imprime la pagina de inicio (indes.html) */
router.get('/', Controller.getStart);

/** metodo post para loguear el usuario */
router.post('/log_in', Controller.Log_in);

/** confirma si se ha iniciado sesion e imprime para iniciar sesion (sin sesion) o pagina tipo estudiante o tutor si se ha iniciado sesion anteriormente */
router.get('/logueo', Controller.logueo);

/**  hace nula la sesion iniciada enel cliente (cerrar sesion) */
router.get('/logout', Controller.log_out);


/************ DIRECCIONES PARA CUENTAS TIPO TUTOR *************/

/**  página principal del tutor*/
router.get('/tutor-account',Controller.getTutorAcount);

/** imprime la lista de estudiantes para enviar un correo */
router.post('/getStudents', Controller.getStudents);

/**  página antesala a la transmisión */
router.get('/tutor-account/info-curso/:id', Controller.getCourseInfo);

/**  página para transmisión-sala */
router.get('/tutor-account/empezar-curso/:id', Controller.getStartCourseTutor); 

/**  carga acrhivos */
router.get('/tutor-account/cargar-archivo/:id', Controller.getUploadFile);

/**  página de la cuenta tutor, para cambiar contraseña */
router.get('/tutor-account/dataTutor', Controller.getAccount);

/** envia informacion del usuario para el chat */
router.post('/data-user', Controller.dataUser);


/************ DIRECCIONES PARA CUENTAS TIPO ESTUDIANTE ********/

/**  página principal del estudiante */
router.get('/student-account', Controller.getStudentAcount)

/**  página antesala a la transmisión */
router.get('/student-account/info-curso/:id', Controller.getStudentAcountInfo);

/**  página para transmisión-sala */
router.get('/student-account/empezar-curso/:id', Controller.joinCourseStudent);

/**  página de la cuenta estudiante, para cambiar contraseña */
router.get('/student-account/dataStudent', Controller.getAccount);


/************ DIRECCIONES PARA CUENTAS TIPO ADMIN ********/

/**  página principal administrador */
router.get('/admin-account', Controller.getAdminAcount);

/**  página principal administrador-usuarios */
router.get('/admin-account/usuario-accounts', Controller.getAdmin_UsuarioAcount);

/**  página para registrar usuarios */
router.get('/admin-account/register', Controller.getAdmin_register);

/**  página para crear cursos */
router.get('/admin-account/course-accounts/:id', Controller.getAdmin_CourseAcount);
router.get('/admin-account/course-accounts', Controller.getAdmin_CourseAcount);

/** página cambiar contraseña del administrador */
router.get('/admin-account/data-admin', Controller.getData_admin);

module.exports = router;
