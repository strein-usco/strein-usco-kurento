$(document).ready(function() {
    document.getElementById('myModal').style.visibility = 'visible';

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
var user_name
var localVideoCurrentId;
var localVideo;
var sessionId;
var id_course = $("#id_CourProf").attr("value");
var my_color = document.getElementById("myColor").value;
document.getElementById('stop-video1').onclick = controlStreamVideo;
document.getElementById('stop-audio1').onclick = controlStreamAudio;
document.getElementById('hand').onclick = hand_up;
//var name_video = document.getElementById('name_video').value;
/*var str = document.URL
var room = str.substring(str.lastIndexOf("/") + 1, str.lenght);
*/
    var str = document.URL
    var roomlong = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    var room = roomlong.split("&&")[1];


var participants = {};

window.onbeforeunload = function () {
    socket.disconnect();
};

socket.on("id", function (id) {
    console.log("receive id : " + id);
    sessionId = id;
    
    $.ajax({
        async: false,
        type: "POST",
        url: "/data-user",
        success: function(result) {
            params = {
                open: true,
                publicRoomIdentifier: "dashboard",
                sessionid: room,
                userFullName: result.nombres
            }
            user_name = result.nombres;
            joinRoom(result.nombres)
            //call()
            //window.params = params;
        },
        error: function(error) {
            console.log("error");
        }
    });
});

// message handler
socket.on("message", function (message) {
    switch (message.id) {
        case "registered":
            //disableElements("register");
            console.log(message.data);
            break;
        case "tutorNoOnline":
            tutorNoOnline()
            console.log('professor is not here');
            break;
        case "callResponse":
            console.log(message);
            console.log(message.message);
            break;
        case "existingParticipants":
            console.log("existingParticipants : " + message.data);
            onExistingParticipants(message);
            break;
        case "newParticipantArrived":
            console.log("newParticipantArrived : " + message.new_user_id);
            onNewParticipant(message);
            break;
        case "participantLeft":
            console.log("participantLeft : " + message.sessionId);
            onParticipantLeft(message);
            break;
        case "receiveVideoAnswer":
            console.log("receiveVideoAnswer from : " + message.sessionId);
            onReceiveVideoAnswer(message);
            break;
        case 'messageChatFrom':
            //console.log("messageChatFrom");
            messageChatFrom(message, socket.id);
            break;
        case 'userWritting':
            userWritting(message);
            break;
        case 'hand_up':
            show_hand_up(message, socket);
            break;
        case 'control_audio_user':
            //console.log("messageChatFrom");
            control_audio_user(message);
            break;
        case "startRecording":
            console.log("Starting recording");
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
        default:
            console.error("Unrecognized message: ", message);
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
 * Register to server
 */
/*function register() {
    var data = {
        id: "register",
        name: document.getElementById('userName').value
    };
    sendMessage(data);
}*/

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

    var data = {
        id: "joinRoom",
        roomName: room,
        name: name,
    };
    sendMessage(data);

}


function tutorNoOnline(){
    //$('#myModal').css('visibility', 'visible');
    //$('#myModal2').css('visibility', 'hidden');
    document.getElementById('myModal').style.display = 'block';
    var data = {
        id: "joinRoomAgain",
        roomName: room,
        name: name,
    };
    setTimeout(function() {
        sendMessage(data);
    }, 6000);
}

/**
 * Invite other user to a conference call
 */
/*function call() {
    // Not currently in a room
    //disableElements("call");
    var message = {
        id : 'call',
        from : document.getElementById('userName').value,
        //to : document.getElementById('otherUserName').value
        to : 'tutor'
    };
    sendMessage(message);
}*/

/**
 * Tell room you're leaving and remove all video elements
 */
function leaveRoom(){

    //disableElements("leaveRoom");
    var message = {
        id: "leaveRoom"
    };

    participants[sessionId].rtcPeer.dispose();
    sendMessage(message);
    participants = {};

    var myNode = document.getElementById("other-videos");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

/**
 * Javascript Confirm to see if user accepts invite
 * @param message
 */
function incomingCall(message) {
    /*var joinRoomMessage = message;
    if (confirm('User ' + message.from
            + ' is calling you. Do you accept the call?')) {
        if(Object.keys(participants).length > 0){
            leaveRoom();
        }
        console.log('message');
        console.log(message);
        joinRoom(joinRoomMessage.roomName);
    } else {
        var response = {
            id : 'incomingCallResponse',
            from : message.from,
            callResponse : 'reject',
            message : 'user declined'
        };
        sendMessage(response);
    }*/
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

    // Temasys constraints
    /*var constraints = {
     audio: true,
         video: {
             mandatory: {
                 minWidth: 32,
                 maxWidth: 320,
                 minHeight: 32,
                 maxHeight: 320,
                 maxFrameRate: 30,
                 minFrameRate: 1
             }
         }
     };*/

    console.log(sessionId + " register in room " + message.roomName);

    // create video for current user to send to server
    var localParticipant = new Participant(sessionId);
    participants[sessionId] = localParticipant;
    localVideo = document.getElementById("main-video");
    var video = localVideo;

    // bind function so that calling 'this' in that function will receive the current instance
    var options = {
        localVideo: video,
        mediaConstraints: constraints,
        onicecandidate: localParticipant.onIceCandidate.bind(localParticipant)
    };


    localParticipant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
        if (error) {
            return console.error(error);
        }

        // Set localVideo to new object if on IE/Safari
        localVideo = document.getElementById("main-video");

        // initial main video to local first
        localVideoCurrentId = sessionId;
        localVideo.srcObject = localParticipant.rtcPeer.localVideo.srcObject;
        localVideo.muted = true;

        console.log("local participant id : " + sessionId);
        this.generateOffer(localParticipant.offerToReceiveVideo.bind(localParticipant));
    });

    // get access to video from all the participants
    console.log(message.data);
    for (var i in message.data) {
        receiveVideoFrom(message.data[i], message.data2[i]);
    }
}

/**
 * Add new participant locally and request video from new participant
 * @param sender
 */
function receiveVideoFrom(sender, sender_name) {
    console.log(sessionId + " receive video from " + sender);
    var participant = new Participant(sender);
    participants[sender] = participant;

    var video = createVideoForParticipant(participant, sender_name);

    // bind function so that calling 'this' in that function will receive the current instance
    var options = {
        remoteVideo: video,
        onicecandidate: participant.onIceCandidate.bind(participant)
    };

    participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
        if (error) {
            return console.error(error);
        }
        this.generateOffer(participant.offerToReceiveVideo.bind(participant));
    });
    if(sender_name == 'tutor'){
        document.getElementById('myModal').style.display = 'none';
    }
}

/**
 * Receive video from new participant
 * @param message
 */
function onNewParticipant(message) {
    receiveVideoFrom(message.new_user_id, message.new_user_name)
}

/**
 * Destroy videostream/DOM element on participant leaving room
 * @param message
 */
function onParticipantLeft(message) {
    var participant = participants[message.sessionId];
    var toastHTML = "<span> " + document.getElementById('video-' + participant.id).getAttribute("name") + " se ha ido<span>"
    M.toast({html: toastHTML});
    participant.dispose();
    if(document.getElementById('video-' + participant.id).getAttribute("name") ==  'tutor'){
        document.getElementById('myModal').style.display = 'block';
    }
    delete participants[message.sessionId];

    console.log("video-" + participant.id);
    // remove video tag
    //document.getElementById("video-" + participant.id).remove();
    var video = document.getElementById("video-" + participant.id);

    // Internet Explorer doesn't know element.remove(), does know this
    video.parentNode.removeChild(video);
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

var conversationPanel = document.getElementById('div_chat');
//conversationPanel.scrollTop = conversationPanel.clientHeight;

/**
 * Reciveing messages from users in the same room 
 */
function messageChatFrom(message, socketId){
    var div = document.createElement('div');
    div.className = 'message';
    if(!message.color){
        message.color = '#ffffff'
    }

    if (message.sender != socketId) {
        div.innerHTML = '<b id="namechat" style="color: ' + message.color + '; text-shadow: 1px 0 0 #000, -1px 0 0 #000, 0 0.5px 0 #000, 0 -1px 0 #000, 0.5px 0.5px #000, -0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000;"">' + (message.sender_name || message.sender) + ':</b><br><p style="word-wrap: break-word; margin: 0;">' + message.text + '</p><p style="word-wrap: break-word; margin: 0; font-size: 11px; float: right;">' + message.dateMessage + '</p>';
        div.style.background = '#4E6470';
        div.style.color = 'white';
        div.style.width = '80%';
        div.style.float = 'right';
        div.style.margin = '9px 7px 5px 7px';
        div.style.padding = '5px';
        div.style.borderRadius = '10px 0px 10px 10px';
        div.style.opacity = '0.8';

        /*if (event.data.checkmark_id) {
            connection.send({
                checkmark: 'received',
                checkmark_id: event.data.checkmark_id
            });
        }*/
    } else {
        div.innerHTML = '<b id="namechat" style=" color: ' + message.color + '; text-shadow: 1px 0 0 #000, -1px 0 0 #000, 0 0.5px 0 #000, 0 -1px 0 #000, 0.5px 0.5px #000, -0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000;"">' + user_name + ':</b> <img class="checkmark" title="Received" src="https://www.webrtc-experiment.com/images/checkmark.png"><br><p style="word-wrap: break-word; margin: 0;">' + message.text + '</p><p style="word-wrap: break-word; margin: 0; font-size: 11px; float: right;">' + message.dateMessage + '</p>';
        div.style.background = '#8d191d';
        div.style.color = 'white';
        div.style.width = '80%';
        div.style.float = 'left';
        div.style.margin = '9px 7px 5px 7px';
        div.style.padding = '5px';
        div.style.borderRadius = '0px 10px 10px 10px';
        div.style.opacity = '0.8';
    }

    conversationPanel.appendChild(div);

    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
}

function userWritting(message){
    
    if (message.show) {
        $('#key-press').show().find('span').html(message.sender_name.slice(0,25) + ' está escribiendo');
    } else {
        $('#key-press').hide().find('span').html('');
    }
}

function show_hand_up(message){
    var hand = '<div id="handchat" style="margin-left: 9px; margin-top: 42%; color: green;">' + message.user_name + ' <img style="width: 25px; height: 25px;" title="Pregunta" src="/images/hand.png"><br></div>'
    $('#div_chat').append(hand);
    //M.toast({html:'Un estudiante ha levantado la mano', classes:'rounded'});  
}

function control_audio_user(message){
    if(message.control == true){
        window.MediaStream1.getAudioTracks()[0].enabled = true;
        document.getElementById('stop-audio1').style.background = "url(/images/microphone.png) center no-repeat";
        //document.getElementById('stop-audio1').src = "../../images/microphone.png";
    }else{
        window.MediaStream1.getAudioTracks()[0].enabled = false;
        document.getElementById('stop-audio1').style.background = "url(/images/muted.png) center no-repeat";  
        //document.getElementById('stop-audio1').src = "../../images/muted.png";
    }
}

function controlStreamVideo(){
    window.MediaStream1.getVideoTracks()[0].enabled =
    !(window.MediaStream1.getVideoTracks()[0].enabled);

    if(!window.MediaStream1.getVideoTracks()[0].enabled){
        document.getElementById('stop-video1').style.background = "url(/images/videocam_off.png) center no-repeat";
    }else{
        document.getElementById('stop-video1').style.background = "url(/images/videocam.png) center no-repeat";
    }
}

function controlStreamAudio(){
    window.MediaStream1.getAudioTracks()[0].enabled =
    !(window.MediaStream1.getAudioTracks()[0].enabled);

    if(!window.MediaStream1.getAudioTracks()[0].enabled){
        document.getElementById('stop-audio1').style.background = "url(/images/muted.png) center no-repeat";
        sendMessage({id: "control_audio_user", control: false});
    }else{
        document.getElementById('stop-audio1').style.background = "url(/images/microphone.png) center no-repeat";
        sendMessage({id: "control_audio_user", control: true});
    }
}


/**
 * Create video DOM element
 * @param participant
 * @returns {Element}
 */
function createVideoForParticipant(participant, sender_name) {

    /*var videoId = "video-" + participant.id;
    var video = document.createElement('video');
    video.setAttribute('name', sender_name);

    video.autoplay = true;
    video.id = videoId;
    video.poster = "img/webrtc.png";
    document.getElementById("other-videos").appendChild(video);

    // return video element
    return document.getElementById(videoId);*/


    var new_div = document.createElement('div');
    var new_divId = "divvideo-" + participant.id;
    new_div.id = new_divId;
    new_div.style.width = '50%';
    new_div.style.float = 'left';
    new_div.style.display = 'inline-block';

    var over_video = document.createElement('div');
    var over_videoId = "overvideo-" + participant.id;
    over_video.id = over_videoId;
    over_video.style.position = 'absolute';
    over_video.style.padding = '5px';
    over_video.style.background = '#c3c3c3';
    over_video.style.opacity = '0.6';
    over_video.style.marginTop = '7px';
    over_video.style.zIndex = '100';
    over_video.style.wordWrap = 'break-word';
    over_video.style.display = 'none';
    over_video.style.cursor = 'pointer';
    over_video.style.marginLeft = '6px';
    over_video.onmouseout = hide_name_dive;

    var p_name = document.createElement('p');
    var node = document.createTextNode(sender_name);
    p_name.style.fontSize = '12px';
    p_name.style.color = '#8d191d';
    p_name.style.fontWeight = '900';
    p_name.style.padding = '0 3px';
    p_name.appendChild(node);
    over_video.appendChild(p_name);

    var videoId = "video-" + participant.id;
    var video = document.createElement('video');
    video.setAttribute('name', sender_name);
    video.onmouseover = show_name_dive;
    
    video.autoplay = true;
    video.id = videoId;
    video.poster = "img/webrtc.png";
    new_div.appendChild(over_video);
    new_div.appendChild(video);
    document.getElementById("other-videos").appendChild(new_div);
    //document.getElementById("other-videos").appendChild(video);
    // return video element
    return document.getElementById(videoId);

}

$('#txt-chat-message').keypress(function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
        event.preventDefault(); 
        if (this.value.length === 0 || !this.value.trim()) {
            return;
        }

        var message = {
            id: 'messageChatFrom',
            room: room,
            id_course: id_course,
            sender: socket.id,
            sender_name: user_name,
            text : this.value,
            color: my_color
        };
        console.log("El mensaje es: ");
        console.log(message)
        sendMessage(message);
        this.value = "";
    }
});

$("#txt-chat-message").keydown(function(event){
    var message = {
        id: 'userWritting',
        room: room,
        sender: socket.id,
        sender_name: user_name,
        show: true,
    };
    sendMessage(message);
});

$("#txt-chat-message").keyup(function(event){
    var message = {
        id: 'userWritting',
        room: room,
        sender: socket.id,
        sender_name: user_name,
        show: false,
    };
    sendMessage(message);
});

function hand_up(){
    sendMessage({id: 'hand_up', control: true, user_name: user_name});   
}

function show_name_dive(){
    var over_video = document.getElementById('over'+this.id);
    over_video.style.display = 'block';
    over_video.style.width = this.offsetWidth + 'px';
    over_video.style.height = this.offsetHeight + 'px';
    over_video.style.borderRadius = '5px';
}

function hide_name_dive(){
    this.style.display = 'none';
}

$("#hide").on('click', function() {
    $("#element").hide();
    $("#camera").show();
    return false;
});

$("#camera").on('click', function() {
    $("#element").show();
    $("#camera").hide();
    return false;
});

});