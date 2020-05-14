/**
 * Created by eak on 9/14/15.
 */
$(document).ready(function() {

/**
 * Created by eak on 9/15/15.
 */

/**
 * @param id
 * @constructor
 */
function Participant(id) {
    this.id = id;
    this.rtcPeer = null;
    this.iceCandidateQueue = [];
}

/**
 *
 * @param error
 * @param offerSdp
 * @returns {*}
 */
Participant.prototype.offerToReceiveVideo = function (error, offerSdp) {
    if (error) {
        return console.error("sdp offer error");
    }
    var msg = {
        id: "receiveVideoFrom",
        sender: this.id,
        sdpOffer: offerSdp
    };
    console.log('Invoking SDP offer callback function ' + msg.sender);
    sendMessage(msg);
};

/**
 * Message to send to server on Ice Candidate.
 * candidate contains 3 items that must be sent for it to work
 * in Internet Explorer/Safari.
 * @param candidate
 */
Participant.prototype.onIceCandidate = function (candidate) {
    //console.log(this.id + " Local candidate" + JSON.stringify(candidate));

    var message = {
        id: 'onIceCandidate',
        candidate : {
            candidate : candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex
        },
        sender: this.id
    };
    sendMessage(message);
};

/**
 * Dispose of a participant that has left the room
 */
Participant.prototype.dispose = function () {
    console.log('Disposing participant ' + this.id);
    this.rtcPeer.dispose();
    this.rtcPeer = null;
};

var socket = io.connect();
var user_name;
var localVideoCurrentId;
var localVideo;
var localCanvas;
var localCanvasCurrentId;
var sessionId;
var id_course = document.getElementById("id_CourProf").getAttribute("value");
var videoConstraint = document.getElementById('share-screen').value;
(videoConstraint == "true") ? videoConstraint = true : videoConstraint = false;
//var name_video = document.getElementById('name_video').value;
var str = document.URL
var room = str.substring(str.lastIndexOf("/") + 1, str.lenght);

    /*var str = document.URL
    var roomlong = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    var room = roomlong.split("&&")[1];*/

var participants = {};

window.onbeforeunload = function () {
    socket.disconnect();
};

socket.on("id", function (id) {
    console.log("receive id : " + id);
    sessionId = id;
    var data = {
        id: "register",
        name: 'tutors-board'
    };
    sendMessage(data);
	//joinRoom('tutors-board')
});

// message handler
socket.on("message", function (message) {
    switch (message.id) {
        case "registered":
            //disableElements("register");
            console.log(message.data);
            break;
        case "existingParticipants":
            console.log("existingParticipants : " + message.data);
            onExistingParticipants(message);
            break;
        case "receiveVideoAnswer":
            console.log("receiveVideoAnswer from : " + message.sessionId);
            onReceiveVideoAnswer(message);
            break;
        case "startRecording":
            console.log("Starting recording");
            if(videoConstraint){
                joinRoom2('tutors-board')
            }else{
                joinRoom('tutors-board')
            }
            break;
        case "stopRecording":
            console.log("Stopped recording");
            break;
        case "iceCandidate":
            console.log("iceCandidate from : " + message.sessionId);
            var participant = participants[message.sessionId];
            if (participant != null) {
                console.log(message.candidate);
                participant.rtcPeer.addIceCandidate(message.candidate, function (error) {
                    if (error) {
                        if (message.sessionId === sessionId) {
                            console.error("Error adding candidate to self : " + error);
                        } else {
                            console.error("Error adding candidate : " + error);
                        }
                    }
                });
            } else {
                console.error('still does not establish rtc peer for : ' + message.sessionId);
            }
            break;
    }
});

/**
 * Send message to server
 * @param data
 */
function sendMessage(data) {
    socket.emit("message", data);
}

/**
 * Check if roomName exists, use DOM roomName otherwise, then join room
 * @param roomName
 */
function joinRoom(name) {
    //disableElements('joinRoom');

    // Check if roomName was given or if it's joining via roomName input field
    /*if(typeof roomName == 'undefined'){
        roomName = document.getElementById('roomName').value;
    }
    document.getElementById('roomName').value = roomName;*/
// capura el flujo se está transmitiendo (recurso para ser visto)

    var localVideo3 =  document.getElementById('c1');
    if(adapter.browserDetails.browser === 'firefox'){
        stream2 = localVideo3.moscrezCaptureStream();
    }else{
        stream2 = localVideo3.captureStream();
    }

    //se toma le flujo de video
    streamVideo2 = stream2.getVideoTracks()[0];
    
    //captura del flujo del audio
    /*if(adapter.browserDetails.browser === 'firefox'){
        stream3 = window.MediaStream.mozCaptureStream();
    }else{
        stream3 = window.MediaStream.captureStream();
    }*/
    // Se toma el flujo de audio
    streamTrack2 = window.MediaStream1.getAudioTracks()[0];

    //mix entre los flujos de video y audio
    newStream2 = new MediaStream([streamVideo2, streamTrack2]);

    document.getElementById('screen-viewer').srcObject = newStream2;
    document.getElementById('screen-viewer').style.display = "none";
    
    var data = {
        id: "joinRoom",
        roomName: room,
        name: name,
    };
    sendMessage(data);
    //startRecording();
}


function joinRoom2(name) {
    streamTrack2 = window.MediaStream1.getAudioTracks()[0];

    //se toma le flujo de video

    var displayMediaStreamConstraints = {
        video: true // currently you need to set {true} on Chrome
    };

    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints).then(function(stream){
            window.MediaStream2 = stream;
            streamVideo2 = stream.getVideoTracks()[0];
    
            //mix entre los flujos de video y audio
            newStream2 = new MediaStream([streamVideo2, streamTrack2]);

            document.getElementById('screen-viewer').srcObject = newStream2;
            document.getElementById('screen-viewer').style.display = "none";
            
            var data = {
                id: "joinRoom",
                roomName: room,
                name: name,
            };
            sendMessage(data);
            
        }).catch(function(e) {
            alert('getUserMedia() error: ' + e.name + ' desc: ' + e.message);
        }); 
    } else {
        navigator.getDisplayMedia(displayMediaStreamConstraints).then(function(stream){
            window.MediaStream2 = stream;
            streamVideo2 = stream.getVideoTracks()[0];
            
            //mix entre los flujos de video y audio
            newStream2 = new MediaStream([streamVideo2, streamTrack2]);

            document.getElementById('screen-viewer').srcObject = newStream2;
            document.getElementById('screen-viewer').style.display = "none";

            var data = {
                id: "joinRoom",
                roomName: room,
                name: name,
            };
            sendMessage(data);            
        }).catch(function(e) {
            alert('getUserMedia() error: ' + e.name + ' desc: ' + e.message);
        }); 
    }
    //startRecording();
}

function getMediaScreen(constraints){   

}

/**
 * Request video from all existing participants
 * @param message
 */
function onExistingParticipants(message) {
    // Standard constraints
    var constraints = {
        audio: true,
        video: {
            frameRate: {
                min: 1, ideal: 15, max: 30
            },
            width: {
                min: 32, ideal: 50, max: 320
            },
            height: {
                min: 32, ideal: 50, max: 320
            }
        }
    };

    console.log(sessionId + " register in room " + message.roomName);

    // create video for current user to send to server
    var localParticipant = new Participant(sessionId);
    participants[sessionId] = localParticipant;
    //localVideo = document.getElementById("main-video");
    localCanvas = document.getElementById("c1");
    var video = localCanvas;

    // bind function so that calling 'this' in that function will receive the current instance
    var options = {
    	localCanvas: true,
        localVideo: video,
        mediaConstraints: constraints,
        onicecandidate: localParticipant.onIceCandidate.bind(localParticipant)
    };


    localParticipant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
        /*if (error) {
            return console.error(error);
        }*/

        // Set localVideo to new object if on IE/Safari
        localVideo = document.getElementById("c1");

        // initial main video to local first
        localVideoCurrentId = sessionId;
        localVideo.srcObject = localParticipant.rtcPeer.localVideo.srcObject;
        localVideo.muted = true;

        console.log("local participant id : " + sessionId);
        this.generateOffer(localParticipant.offerToReceiveVideo.bind(localParticipant));
    });

    // get access to video from all the participants
    /*console.log(message.data);
    for (var i in message.data) {
        receiveVideoFrom(message.data[i], message.data2[i]);
    }*/
}


/**
 * Required WebRTC method
 * @param message
 */
function onReceiveVideoAnswer(message) {
    var participant = participants[message.sessionId];
    participant.rtcPeer.processAnswer(message.sdpAnswer, function (error) {
        if (error) {
            console.error(error);
        } else {
            participant.isAnswer = true;
            while (participant.iceCandidateQueue.length) {
                console.error("collected : " + participant.id + " ice candidate");
                var candidate = participant.iceCandidateQueue.shift();
                participant.rtcPeer.addIceCandidate(candidate);
            }
        }
    });
}

/**
 * Start recording video
 */
function startRecording(){
    var data = {
        id: "startRecording"
    };
    sendMessage(data);
}

/**
 * Stop recording video
 */
function stopRecording(){
    var data = {
        id: "stopRecording"
    };
    sendMessage(data);
}


/**
 * Create video DOM element
 * @param participant
 * @returns {Element}
 */
function createVideoForParticipant(participant, sender_name) {

    var videoId = "video-" + participant.id;
    var video = document.createElement('video');
    video.setAttribute('name', sender_name);
    video.onmouseover = showCameraOptions

    video.autoplay = true;
    video.id = videoId;
    video.poster = "img/webrtc.png";
    document.getElementById("other-videos").appendChild(video);

    // return video element
    return document.getElementById(videoId);
}

});