let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let joinsSchema = new Schema({
    id: { type: String },
    id_course: { type: String },
    name_course: { type: String },
    code_course: { type: String },
    id_student: { type: String },
    name_student: { type: String },
    email_student: { type: String },
    status: { type: String },
    description: { type: String },
	id_tutor: { type: String },
	name_tutor: { type: String },
    type: { type: String },
	exponent: {type:String},
    circle: {type:String},
    title: {type:String},
  
}, { versionKey: false });

let Join = mongoose.model('Joins', joinsSchema);

module.exports = Join;