let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let filesSchema = new Schema({
    id: { type: String },
    static_name: { type: String },
    dinamic_name: { type: String },
    owner_id: { type: String },
    owner_name: { type: String },
    from_course_id: { type: String },
    from_course_name: { type: String },
    path: { type: String },
    state: { type: String }
}, { versionKey: false });

let File_added = mongoose.model('files', filesSchema);

module.exports = File_added;