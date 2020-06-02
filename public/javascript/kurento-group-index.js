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

//$('#myModal31').css('visibility', 'visible');
var socket = io.connect();
var user_name;
var localVideoCurrentId;
var localVideo;
var sessionId;
var acum = 0;
var localVideo1 =  document.getElementById('main-video');
document.getElementById('stop-video1').onclick = controlStreamVideo;
document.getElementById('stop-audio1').onclick = controlStreamAudio;
var id_course = document.getElementById("id_CourProf").getAttribute("value");
//var name_video = document.getElementById('name_video').value;
var str = document.URL
var room = str.substring(str.lastIndexOf("/") + 1, str.lenght);

    /*var str = document.URL
    var roomlong = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    var room = roomlong.split("&&")[1];*/

$.ajax({
    type: "POST",
    url: "/control5/getAllfiles",
    dataType: "json",
    data: { id_course: id_course },
    success: function(result) {
        var max = result.Allfiles.length; //max de archivos  
        //En el boton atrás se establece en name el max valor de páginas
        document.getElementById("adelante").setAttribute("name", max);
        for (var r = 0; r < result.facefiles.length; r++) {
            idiv = "overlay" + r;
            document.getElementById(idiv).setAttribute("name", acum);
            acum = result.amount[r] - 1 + acum;
            document.getElementById(idiv).setAttribute("value", acum);
            acum++
            idiv2 = "ima_div" + r;
            // se agrega en src la info en base64 del archivo
            //document.getElementById(idiv2).setAttribute("src", "data:image/png;base64," + result.facefiles[r]);
            document.getElementById(idiv2).setAttribute("src", "");
        }
        for (var m = 0; m < result.Allfiles.length; m++) {
            $(".Main_container_files").append('<img type="hidden" id="hiddendiv' + m + '" src="data:image/png;base64,' + result.Allfiles[m] + '" class="imageCourse"/>');
        }
    },
    error: function(error) {
        console.log(error);
    }
});

var participants = {};
localVideo1.onloadedmetadata = function(event){
    startRecording();
}

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
            user_name = result.nombres;
            //joinRoom(result.nombres)
            joinRoom('tutor')
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
        /*case "incomingCall":
            incomingCall(message);
            break;
        case "callResponse":
            console.log(message);
            console.log(message.message);
            break;*/
        case "existingParticipants":
            //console.log("existingParticipants : " + message.data);
            onExistingParticipants(message);
            break;
        case "newParticipantArrived":
            //console.log("newParticipantArrived : " + message.new_user_id);
            onNewParticipant(message);
            break;
        case "participantLeft":
            //console.log("participantLeft : " + message.sessionId);
            onParticipantLeft(message);
            break;
        case "receiveVideoAnswer":
            //console.log("receiveVideoAnswer from : " + message.sessionId);
            onReceiveVideoAnswer(message);
            break;
        case 'control_audio_user':
            //console.log("messageChatFrom");
            control_audio_user_switched(message);
            break;
        case 'hand_up':
            show_hand_up(message, socket);
            break;
        case 'messageChatFrom':
            //console.log("messageChatFrom");
            messageChatFrom(message, socket.id);
            break;
        case 'userWritting':
            userWritting(message);
            break;
        case "startRecording":
            console.log("Starting recording");
            break;
        case "stopRecording":
            console.log("Stopped recording");
            break;
        case "iceCandidate":
            //console.log("iceCandidate from : " + message.sessionId);
            var participant = participants[message.sessionId];
            if (participant != null) {
                //console.log(message.candidate);
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
        id: "createRoom",
        roomName: room,
        name: name,
        course: id_course
    };
    sendMessage(data);
    //startRecording();
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
        to : document.getElementById('otherUserName').value
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
/*function incomingCall(message) {
    var joinRoomMessage = message;
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
    }
}*/

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
            localCanvas: false,
            localVideo: video,
            mediaConstraints: constraints,
            onicecandidate: localParticipant.onIceCandidate.bind(localParticipant)
        };


        localParticipant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
            /*if (error) {
                return console.error(error);
            }*/

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
        var nametoast = document.getElementById('video-' + participant.id).getAttribute("name")
        var toastHTML = "<span> " + nametoast + " se ha ido<span>"
        if ( nametoast == "tutor") {
            M.toast({html: toastHTML, classes: 'rounded green'});
        } else{
            M.toast({html: toastHTML, classes: 'rounded redusco'});
        }
        participant.dispose();
        delete participants[message.sessionId];

        console.log("video-" + participant.id);
        // remove video tag
        //document.getElementById("video-" + participant.id).remove();
        var video = document.getElementById("divvideo-" + participant.id);

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
            message.color = '#000000'
        }

        if (message.sender != socketId) {
            div.innerHTML = '<b id="namechat" style="color: ' + message.color + '; text-shadow: 1px 0 0 #000, -1px 0 0 #000, 0 0.5px 0 #000, 0 -1px 0 #000, 0.5px 0.5px #000, -0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000;">' + (message.sender_name || message.sender) + ':</b><br><p style="word-wrap: break-word; margin: 0;">' + message.text + '</p><p style="word-wrap: break-word; margin: 0; font-size: 11px; float: right;">' + message.dateMessage + '</p>';
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
            div.innerHTML = '<b id="namechat" style=" color: ' + message.color + '; text-shadow: 1px 0 0 #000, -1px 0 0 #000, 0 0.5px 0 #000, 0 -1px 0 #000, 0.5px 0.5px #000, -0.5px -0.5px 0 #000, 0.5px -0.5px 0 #000, -0.5px 0.5px 0 #000;">' + user_name + ':</b> <img class="checkmark" title="Received" src="https://www.webrtc-experiment.com/images/checkmark.png"><br><p style="word-wrap: break-word; margin: 0;">' + message.text + '</p><p style="word-wrap: break-word; margin: 0; font-size: 11px; float: right;">' + message.dateMessage + '</p>';
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
    var nameHand = message.user_name;
    var hand = '<div style="margin-left: 9px; margin-top: 5%; color: green;">' + nameHand + ' <img style="width: 25px; height: 25px;" title="Pregunta" src="/images/hand.png"><br></div>'
    $('#div_chat').append(hand);
    M.toast({html: nameHand + ' ha levantado la mano', classes:'rounded redusco'});  
}

    /**
     * Create video DOM element
     * @param participant
     * @returns {Element}
     */
    function createVideoForParticipant(participant, sender_name) {
        var participant_id = participant.id;

        var new_div = document.createElement('div');
        var new_divId = "divvideo-" + participant_id;
        new_div.id = new_divId;
        new_div.style.width = '50%';
        new_div.style.float = 'left';
        new_div.style.display = 'inline-block';
        document.getElementById("other-videos").appendChild(new_div);

        var video = document.createElement('video');
        var videoId = "video-" + participant_id;
        video.id = videoId;
        video.setAttribute('name', sender_name);
        video.style.float = 'left';
        video.autoplay = true;
        video.onmouseover = show_camera_options;
        new_div.appendChild(video);

        var div_options = document.createElement('div');
        var div_optionsID = "optionsvideo-" + participant_id;
        div_options.style.float = 'left';
        div_options.id = div_optionsID;
        div_options.style.background = '#c3c3c3';
        div_options.style.opacity = '0.6';
        div_options.style.marginTop = '7px';
        div_options.style.zIndex = '900';
        div_options.style.width = '18px';
        div_options.style.height = '5%';
        div_options.style.left = '40%';
        div_options.style.borderRadius = '0px 7px 7px 0px';
        div_options.style.display = 'none';
        new_div.appendChild(div_options);

        var image_option2 = document.createElement('img');
        image_option2.id = 'mic' + participant_id;
        image_option2.onclick = control_audio_user;
        image_option2.src = "../../images/microphone.png";
        image_option2.style.float = "left";
        image_option2.style.margin = "5px 1px";
        image_option2.style.cursor = "pointer";
        image_option2.title = "Silenciar";
        image_option2.name = "true";
        div_options.appendChild(image_option2);

        var over_video = document.createElement('div');
        var over_videoId = "overvideo-" + participant_id;
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
        over_video.onmouseout = hide_camera_options;
        new_div.appendChild(over_video);


        var p_name = document.createElement('p');
        var node = document.createTextNode(sender_name);
        p_name.style.fontSize = '12px';
        p_name.style.color = '#8d191d';
        p_name.style.fontWeight = '900';
        p_name.style.padding = '0 3px';
        p_name.appendChild(node);
        over_video.appendChild(p_name);

        return document.getElementById(videoId);
    }

    function hide_camera_options(){
        this.style.display = 'none';
    }

    function show_camera_options(){
        var over_video = document.getElementById('over'+this.id);
        over_video.style.display = 'block';
        over_video.style.width = this.offsetWidth + 'px';
        over_video.style.height = this.offsetHeight + 'px';
        over_video.style.borderRadius = '5px';
    }

    function control_audio_user(){
        (this.name == 'true') ? control = true : control = false;
        var msg = {
            id: "control_audio_user",
            control: !control,
            userId: this.id.slice(3)  //id del usuario a silenciar
        };
        sendMessage(msg);
        if(this.name == "true"){
            this.src = "../../images/muted.png";
            this.name =  "false";
        }else{
            this.src = "../../images/microphone.png";
            this.name =  "true";
        }
    }

    function control_audio_user_switched(message){
        if(message.control == true){
            document.getElementById('mic' + message.user_id).src = "../../images/microphone.png";
            document.getElementById('mic' + message.user_id).setAttribute("name",true);
            //document.getElementById('mic' + message.user_id).style.background = "url(/images/microphone.png) center no-repeat";
        }else{
            document.getElementById('mic' + message.user_id).src = "../../images/muted.png";
            document.getElementById('mic' + message.user_id).setAttribute("name",false);
            //document.getElementById('mic' + message.user_id).style.background = "url(/images/muted.png) center no-repeat";
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
        }else{
            document.getElementById('stop-audio1').style.background = "url(/images/microphone.png) center no-repeat";
        }
    }



    function blockUser(){
        //block_user
    }

    // When the user clicks anywhere outside of the modal, close it
    /*window.onclick = function(event) {
     if (event.target == document.getElementById('web-cam3')) {
        $('#web-cam3').css('visibility', 'hidden');
      }
    }*/

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
                tutor: true,
                color: '#ffffff'
            };
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

    document.querySelector('button#record').onclick = function() {
        var resp = confirm("¿Desea detener la transmisión?");
        if(resp == true){
            stopRecording();
            $.ajax({
                type: "POST",
                url: "/control4/tutor_left_class",
                data: {
                    id_videoclass: room,
                },
                success: function(result) {
                    document.getElementById('back').click()
                    sessionUser = true;
                },
                error: function(error) {
                    console.log("error");
                }
            });
        }
    }

});
