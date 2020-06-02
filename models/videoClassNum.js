let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let videoClassNumSchema = new Schema({
    id: { type: String },
    video_id: { type: String },
    video_num: { type: String },
    course_id: { type: String },
    dateMessage: { type: String }
}, { versionKey: false });

let VideoClassNum = mongoose.model('VideoClassesNum', videoClassNumSchema);

module.exports = VideoClassNum;