let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let coursesSchema = new Schema({
    id: { type: String },
    name_course: { type: String },
    code_course: { type: String },
    created_by_name: { type: String },
    created_by_id: { type: String },
    description: { type: String },
    assigned: {type: String},
    type: { type: String },
    id_tutor: { type: String },
    name_tutor: { type: String },
    email_tutor: { type: String },
    exponent: { type: String },
    num_students: { type: String },
}, { versionKey: false });

let Course = mongoose.model('Courses', coursesSchema);

module.exports = Course;