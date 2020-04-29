let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let session_roomSchema = new Schema({
    id: { type: String },
    ID_session: { type: String },
    ID_user: { type: String },
    name: { type: String },
    type: { type: String },
    nameRoom: { type: String },
    session_room: { type: String },
    id_videoclass: { type: String },
    exponent: { type: String }
}, { versionKey: false });

let session_room_added = mongoose.model('session_rooms', session_roomSchema);

module.exports = session_room_added;