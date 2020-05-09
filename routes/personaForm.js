/** Express router providing user related routes
 * @module routes/personaForm
 * @requires Controller6
 */

/**
 * express module
 * @const
 */
let express = require('express');
let router = express.Router();
let passport = require('passport');
/**
 * @memberof module:Controller6
 */
let Controller6 = require('./../controles/crud_person')

/*********************    REGISTRO DE USUARIOS  ***************************/

/** (FUNC. ADMIN) Almacena al usuario en la base de datos */
router.post('/persona/operar', Controller6.register);

/** (FUNC. ADMIN) Editar info del usuario en la base de datos */
router.post('/persona/editar', Controller6.editUser); 

/** (FUNC. ADMIN) Editar correo del adminstrador en la base de datos */
router.post('/persona/editmail', Controller6.editmail);

/** (FUNC. USUARIOS) Cambiar contraseña del usuario en la base de datos */
router.post('/persona/contra', Controller6.changeContra);

/** (FUNC. ADMIN)Elimina a un usuario de la base de datos */
router.post('/persona/delete_user', Controller6.delete_user);

/** (FUNC. ADMIN) Imprime informacion del usuario y cursos */
router.post('/persona/info', Controller6.InfoUser);


//** seleccion de estudiante como expositor */
//* router.post('/expo_student', Controller6.setExpo)

module.exports = router;
