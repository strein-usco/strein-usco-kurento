let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let videoclassSchema = new Schema({
    id: { type: String },
    class_name: { type: String },
    name_course: { type: String },
    id_course: { type: String },
    id_class: { type: String },
    id_tutor: { type: String },
    date: { type: String },
    time: { type: String },
    path:{ type: String },
    num:{ type: String },
    private: { type: String },
    schedule: { type: String },
    typeOfStream: { type: String }
}, { versionKey: false });

let VideoClass = mongoose.model('VideoClasses', videoclassSchema);

module.exports = VideoClass;