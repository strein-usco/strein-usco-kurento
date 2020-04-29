let mongoose = require('mongoose');
let VideoClasses = require('./../models/videoclass'),
	SessionRoom = require('./../models/sessionRoom'),
	MessageChat =  require('./../models/messageChat'),
    Correos = require('./../models/correos'),
    Course = require('./../models/courses'),
    File = require('./../models/files');

mongoose.promise = require('bluebird')
//mongoose.connect('mongodb://localhost:27017/databasename', {useNewUrlParser:true});
mongoose.connect('mongodb+srv://admin:admin@cluster0-lnslu.mongodb.net/test?retryWrites=true', {useNewUrlParser:true}).then(function(model){
	if(__dirname === "/app/config"){
		console.log("Usando Heroku");
		/*VideoClasses.deleteMany({schedule: "false"}, function(err) {
			if (err) return handleError(err);
		});*/
		File.deleteMany({static_name: { $ne : "Ejemplo.pdf" }}, function(err) {
			if (err) return handleError(err);
		});

	}
	/*SessionRoom.deleteMany({}, function(err) {
		if (err) return handleError(err);
	});*/
	MessageChat.deleteMany({}, function(err) {
		if (err) return handleError(err);
	});
	
	console.log('MongoDB connected')
})
.catch(err => console.log(err));

module.exports = mongoose;

