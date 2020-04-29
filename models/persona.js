let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let personaSchema = new Schema({
    id: { type: String },
    nombres: { type: String },
    cedula: { type: Number},
    apellidos: { type: String },
    edad: { type: Number, min: 0 },
    correo: { type: String },
    contra: { type: String },
    tipo: {type: String},
    estado: {type: String},
    socketid : {type: String}
}, { versionKey: false });

let Persona = mongoose.model('Personas', personaSchema);

module.exports = Persona;