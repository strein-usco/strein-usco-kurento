let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let messageSchema = new Schema({
    id: { type: String },
    id_course: { type: String },
    id_class: { type: String },
    id_user:  { type: String },
    tutor:  { type: String },
    colorMessage: { type: String },
    userFullNameMsg: { type: String },
    userchatMessage: { type: String },
    dateMessage: { type: String },
    created_at: {
    	type: Date,
    	default: Date.now
    }
}, { versionKey: false });

let Message = mongoose.model('Message', messageSchema);

module.exports = Message;
