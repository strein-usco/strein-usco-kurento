let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let correosSchema = new Schema({
    id: { type: String },
    id_course: { type: String },
    name_course: { type: String },
    subject: { type: String },
    created_by_name: { type: String },
    created_by_id: { type: String },
    textarea1: { type: String },
    replay_to_by_name:{ type: String },
    replay_to_by_id:{ type: String },
    seen: { type: String },
    fullDate:{ type: String },
    fullClock: { type: String }
}, { versionKey: false });

let Correo = mongoose.model('Correos', correosSchema);

module.exports = Correo;
