$(document).ready(function() {

    var socket = io.connect();
    var id_course = $("#id_CourProf").attr("value");
    var name_video = document.getElementById('name_video').value;
    var screen_viewer =  document.getElementById('screen-viewer');
    var localCanvas = document.getElementById('c1');
    var id_class = document.getElementById('id_class').value;
    var acum = 0;
    var str = document.URL
    var room = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    var videoConstraint = document.getElementById('share-screen').value;
    (videoConstraint == "true") ? videoConstraint = true : videoConstraint = false;
    var chunks = [];
    var recorder;

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

            window.params = params;
        },
        error: function(error) {
            console.log("error");
        }
    });
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

    var myMessages = document.getElementsByClassName(params.userFullName);
    for (var i = 0; i < myMessages.length; i++) {
        myMessages[i].style.background = '#4E6470';
        myMessages[i].style.color = 'white';
        myMessages[i].style.width = '80%';
        myMessages[i].style.float = 'right';
        myMessages[i].style.margin = '5px';
        myMessages[i].style.padding = '5px';
        myMessages[i].style.borderRadius = '7px';
    }

var connection = new RTCMultiConnection();

connection.socketURL = '/';
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.extra.userFullName = params.userFullName;

/// make this room public
connection.publicRoomIdentifier = params.publicRoomIdentifier;

connection.socketMessageEvent = 'canvas-dashboard-demo';
connection.socketCustomEvent = params.sessionid;

// keep room opened even if owner leaves
connection.autoCloseEntireSession = true;

// https://www.rtcmulticonnection.org/docs/maxParticipantsAllowed/
connection.maxParticipantsAllowed = 1000;
// set value 2 for one-to-one connection
// connection.maxParticipantsAllowed = 2;

// here goes canvas designer
/*var designer = new CanvasDesigner();

// you can place widget.html anywhere
designer.widgetHtmlURL = '/node_modules/canvas-designer/widget.html';
designer.widgetJsURL = '/node_modules/canvas-designer/widget.min.js'

designer.addSyncListener(function(data) {
    connection.send(data);
});

designer.setSelected('pencil');

designer.setTools({
    pencil: true,
    text: true,
    image: true,
    pdf: true,
    eraser: true,
    line: true,
    arrow: true,
    dragSingle: true,
    dragMultiple: true,
    arc: true,
    rectangle: true,
    quadratic: false,
    bezier: true,
    marker: true,
    zoom: false,
    lineWidth: false,
    colorsPicker: false,
    extraOptions: false,
    code: false,
    undo: true
});*/

// here goes RTCMultiConnection

connection.chunkSize = 16000;
connection.enableFileSharing = true;

if( videoConstraint){
    shareScreen()
}

connection.session = {
    audio: true,
    video: true,
    data: true,
};

connection.DetectRTC.load(function() {
    if (connection.DetectRTC.hasMicrophone === true) {
        // enable microphone
        connection.mediaConstraints.audio = true;
        connection.session.audio = true;
    }else{
         alert('Algo ha salido mal, no hemos podido detectar ningun dispositivo tipo micrófono en su equipo, por favor conecte uno.');
    }

    if (connection.DetectRTC.hasWebcam === true) {
        // enable camera
        connection.mediaConstraints.video = true;
        connection.session.video = true;
    }else{
         alert('Algo ha salido mal, no hemos podido detectar ningun dispositivo tipo cámara en su equipo, por favor conecte uno.');
    }

    if (connection.DetectRTC.hasMicrophone === false &&
        connection.DetectRTC.hasWebcam === false) {
        // he do not have microphone or camera
        // so, ignore capturing his devices
        connection.dontCaptureUserMedia = true;
    }

    if (connection.DetectRTC.hasSpeakers === false) { // checking for "false"
        alert('Algo ha salido mal, no hemos podido detectar ningun dispositivo tipo speaker en su equipo, por favor conecte uno.');
    }

});

var BandwidthHandler = connection.BandwidthHandler;
connection.bandwidth = {
    audio: 128,
    video: 256,
    screen: 300
};
connection.processSdp = function(sdp) {
    sdp = BandwidthHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, !!connection.session.screen);
    sdp = BandwidthHandler.setVideoBitrates(sdp, {
        min: connection.bandwidth.video,
        max: connection.bandwidth.video
    });

    sdp = BandwidthHandler.setOpusAttributes(sdp);

    sdp = BandwidthHandler.setOpusAttributes(sdp, {
        'stereo': 1,
        //'sprop-stereo': 1,
        'maxaveragebitrate': connection.bandwidth.audio * 1000 * 8,
        'maxplaybackrate': connection.bandwidth.audio * 1000 * 8,
        //'cbr': 1,
        //'useinbandfec': 1,
        // 'usedtx': 1,
        'maxptime': 3
    });

    return sdp;
};

connection.mediaConstraints = {
    audio: true,
    video: {
        mandatory: {
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720,
            minFrameRate: 30,
            minAspectRatio: 1.77
        },
        optional: [{
            facingMode: 'user' // or "application"
        }]
    }
};

if (DetectRTC.browser.name === 'Firefox') {
    connection.mediaConstraints = {
        audio: true,
        video: {
            width: 1280,
            height: 720,
            frameRate: 30,
            aspectRatio: 1.77,
            facingMode: 'user' // or "application"
        }
    };
}

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

// first step, ignore default STUN+TURN servers
connection.iceServers = [];

// second step, set STUN url
connection.iceServers.push({
    urls: 'stun:stun.l.google.com:19302'
});

// last step, set TURN url (recommended)
connection.iceServers.push({
    urls: 'turn:numb.viagenie.ca',
    credential: 'muazkh',
    username: 'webrtc@live.com'
});

connection.onUserStatusChanged = function(event) {
    var infoBar = document.getElementById('onUserStatusChanged');
    var names = [];
    connection.getAllParticipants().forEach(function(pid) {
        names.push(getFullName(pid));
    });

    if (!names.length) {
        names = ['Only You'];
    } else {
        names = [connection.extra.userFullName || 'You'].concat(names);
    }

   // infoBar.innerHTML = '<b>Active users:</b> ' + names.join(', ');
};

connection.onopen = function(event) {
    connection.onUserStatusChanged(event);
    document.getElementById("vid"+event.extra.user_id).setAttribute('src','/images/videocam_off.png');
    document.getElementById("img"+event.extra.user_id).setAttribute('src','/images/circle.png');
    //document.getElementById('btn-chat-message').disabled = false;
    //document.getElementById('btn-attach-file').style.display = 'inline-block';

};

connection.onclose = connection.onerror = connection.onleave = function(event) {
    connection.onUserStatusChanged(event);
};

connection.onmessage = function(event) {
    if(event.data.showMainVideo) {
        // $('#main-video').show();
        $('#screen-viewer').show();
        return;
    }

    if(event.data.hideMainVideo) {
        // $('#main-video').hide();
        $('#screen-viewer').hide();
        return;
    }

    if(event.data.typing === true) {
        $('#key-press').show().find('span').html(event.extra.userFullName.slice(0,25) + '... está escribiendo');
        return;
    }

    if(event.data.typing === false) {
        $('#key-press').hide().find('span').html('');
        return;
    }

    if (event.data.chatMessage) {
        appendChatMessage(event);
        return;
    }

    if (event.data.checkmark === 'received') {
        var checkmarkElement = document.getElementById(event.data.checkmark_id);
        if (checkmarkElement) {
            checkmarkElement.style.display = 'inline';
        }
        return;
    }

    if (event.data === 'plz-sync-points') {
        //designer.sync();
        return;
    }

    //designer.syncData(event.data);
};

// extra code
var mainstremid
connection.onstream = function(event) {

    if (event.stream.isScreen && !event.stream.canvasStream) {
        $('#screen-viewer').get(0).srcObject = event.stream;
        $('#screen-viewer').hide();
        //$('#remoteVideo2').get(0).srcObject = event.stream;
    }
    else if (event.extra.roomOwner === true) {
        var video = document.getElementById('main-video');
        video.setAttribute('data-streamid', event.streamid);
        mainstremid = event.streamid;   
        // video.style.display = 'none';
        if(event.type === 'local') {
            video.muted = true;
            video.volume = 0;
        }
        video.srcObject = event.stream;
        $('#main-video').show();
        document.getElementById('main-video').onloadedmetadata = function(event){startRecording();}
    } else {
        event.mediaElement.controls = false;
        var otherVideos = document.querySelector('#other-videos');
        otherVideos.appendChild(event.mediaElement);
        document.getElementById("vid" + event.extra.user_id).setAttribute('src','/images/videocam.png');
        document.getElementById('request_call').style.display = "none";
    }

    connection.onUserStatusChanged(event);
};

connection.onstreamended = function(event) {
    var video = document.querySelector('video[data-streamid="' + event.streamid + '"]');
    if (!video) {
        video = document.getElementById(event.streamid);
        if (video) {
            document.getElementById("vid"+event.extra.user_id).setAttribute('src','/images/videocam_off.png');
            video.parentNode.removeChild(video);
            return;
        }
    }
    if (video) {
        video.srcObject = null;
        video.style.display = 'none';
    }
};

connection.onPeerStateChanged = function(state) {
    if (connection.enableLogs) {
        if (state.iceConnectionState.search(/closed|failed/gi) !== -1) {
            document.getElementById("vid"+state.extra.user_id).setAttribute('src','');
            document.getElementById("img"+state.extra.user_id).setAttribute('src','/images/circle2.png');
        }
    }
};

var conversationPanel = document.getElementById('div_chat');
conversationPanel.scrollTop = conversationPanel.clientHeight;
conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;

function appendChatMessage(event, checkmark_id) {
    var div = document.createElement('div');

    div.className = 'message';
    var userFullNameMsg, userchatMessage;

    if (event.data) {
        div.innerHTML = '<b>' + (event.extra.userFullName || event.userid) + ':</b><br>' + event.data.chatMessage;
        div.style.background = '#8d191d';
        div.style.color = 'white';
        div.style.width = '80%';
        div.style.float = 'left';
        div.style.margin = '5px';
        div.style.padding = '5px';
        div.style.borderRadius = '7px';
        div.title = event.extra.userFullName;
        userFullNameMsg = event.extra.userFullName;
        userchatMessage = event.data.chatMessage;
        if (event.data.checkmark_id) {
            connection.send({
                checkmark: 'received',
                checkmark_id: event.data.checkmark_id
            });
        }
    } else {
        div.innerHTML = '<b>' + params.userFullName + ':</b> <img class="checkmark" id="' + checkmark_id + '" title="Received" src="https://www.webrtc-experiment.com/images/checkmark.png"><br>' + event;
        div.style.background = '#4E6470';
        div.style.color = 'white';
        div.style.width = '80%';
        div.style.float = 'right';
        div.style.margin = '5px';
        div.style.padding = '5px';
        div.style.borderRadius = '7px';
        div.title = params.userFullName;
        message_to_save = '<b>' + params.userFullName + ':</b><br>' + event;
        userFullNameMsg = params.userFullName;
        userchatMessage = event;
    }
    
    //userchatMessage.slice(1,4) == "img" ?  

    connection.socket.emit('message-chat', room, userFullNameMsg, userchatMessage)

    conversationPanel.appendChild(div);

    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
    //$('#div_chat')[0].scrollTop = $('#div_chat')[0].scrollHeight - $('#div_chat')[0].clientHeight;
}

var keyPressTimer;
var numberOfKeys = 0;
$('#txt-chat-message').emojioneArea({
    pickerPosition: "top",
    filtersPosition: "bottom",
    tones: false,
    autocomplete: true,
    inline: true,
    hidePickerOnBlur: true,
    events: {
        focus: function() {
            $('.emojionearea-category').unbind('click').bind('click', function() {
                $('.emojionearea-button-close').click();
            });
        },
        keyup: function(e) {
            var chatMessage = $('.emojionearea-editor').html();
            if (!chatMessage || !chatMessage.replace(/ /g, '').length) {
                connection.send({
                    typing: false
                });
            }


            clearTimeout(keyPressTimer);
            numberOfKeys++;

            if (numberOfKeys % 3 === 0) {
                connection.send({
                    typing: true
                });
            }

            keyPressTimer = setTimeout(function() {
                connection.send({
                    typing: false
                });
            }, 1200);
        },
        blur: function() {
            // $('#btn-chat-message').click();
            connection.send({
                typing: false
            });
        }
    }
});

window.onkeyup = function(e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
        $('#txt-chat-message').click();
    }
};

document.getElementById('txt-chat-message').onclick = function() {
    var chatMessage = $('.emojionearea-editor').html();
    $('.emojionearea-editor').html('');

    if (!chatMessage || !chatMessage.replace(/ /g, '').length) return;

    var checkmark_id = connection.userid + connection.token();

    appendChatMessage(chatMessage, checkmark_id);

    connection.send({
        chatMessage: chatMessage,
        checkmark_id: checkmark_id
    });

    connection.send({
        typing: false
    });
};

var recentFile;
/*document.getElementById('btn-attach-file').onclick = function() {
    var file = new FileSelector();
    file.selectSingleFile(function(file) {
        recentFile = file;

        if(connection.getAllParticipants().length >= 1) {
            recentFile.userIndex = 0;
            connection.send(file, connection.getAllParticipants()[recentFile.userIndex]);
        }
    });
};*/

function getFileHTML(file) {
    var url = file.url || URL.createObjectURL(file);
    var attachment = '<a href="' + url + '" target="_blank" download="' + file.name + '">Download: <b>' + file.name + '</b></a>';
    if (file.name.match(/\.jpg|\.png|\.jpeg|\.gif/gi)) {
        attachment += '<br><img crossOrigin="anonymous" src="' + url + '">';
    } else if (file.name.match(/\.wav|\.mp3/gi)) {
        attachment += '<br><audio src="' + url + '" controls></audio>';
    } else if (file.name.match(/\.pdf|\.js|\.txt|\.sh/gi)) {
        attachment += '<iframe class="inline-iframe" src="' + url + '"></iframe></a>';
    }
    return attachment;
}

function getFullName(userid) {
    var _userFullName = userid;
    if (connection.peers[userid] && connection.peers[userid].extra.userFullName) {
        _userFullName = connection.peers[userid].extra.userFullName;
    }
    return _userFullName;
}

connection.onFileEnd = function(file) {
    var html = getFileHTML(file);
    var div = progressHelper[file.uuid].div;

    if (file.userid === connection.userid) {
        div.innerHTML = '<b>You:</b><br>' + html;
        div.style.background = '#cbffcb';

        if(recentFile) {
            recentFile.userIndex++;
            var nextUserId = connection.getAllParticipants()[recentFile.userIndex];
            if(nextUserId) {
                connection.send(recentFile, nextUserId);
            }
            else {
                recentFile = null;
            }
        }
        else {
            recentFile = null;
        }
    } else {
        div.innerHTML = '<b>' + getFullName(file.userid) + ':</b><br>' + html;
    }
};

// to make sure file-saver dialog is not invoked.
connection.autoSaveToDisk = false;

var progressHelper = {};

connection.onFileProgress = function(chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};

connection.onFileStart = function(file) {
    var div = document.createElement('div');
    div.className = 'message';

    if (file.userid === connection.userid) {
        var userFullName = file.remoteUserId;
        if(connection.peersBackup[file.remoteUserId]) {
            userFullName = connection.peersBackup[file.remoteUserId].extra.userFullName;
        }

        div.innerHTML = '<b>You (to: ' + userFullName + '):</b><br><label>0%</label> <progress></progress>';
        div.style.background = '#cbffcb';
    } else {
        div.innerHTML = '<b>' + getFullName(file.userid) + ':</b><br><label>0%</label> <progress></progress>';
    }

    div.title = file.name;
    conversationPanel.appendChild(div);
    progressHelper[file.uuid] = {
        div: div,
        progress: div.querySelector('progress'),
        label: div.querySelector('label')
    };
    progressHelper[file.uuid].progress.max = file.maxChunks;

    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
};

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}

if(!!params.password) {
    connection.password = params.password;
}

//designer.appendTo(document.getElementById('widget-container'), function() {
    //if (params.open === true || params.open === 'true') {


            var tempStreamScreen = document.getElementById('screen-viewer');
            if(adapter.browserDetails.browser === 'firefox'){
                var tempStream2 = tempStreamScreen.mozCaptureStream();
            }else{
                var tempStream2 = tempStreamScreen.captureStream();
            }
            tempStream2.isScreen = true;
            tempStream2.isVideo = true;
            tempStream2.streamid = tempStream2.id;
            tempStream2.type = 'local';
            connection.attachStreams.push(tempStream2);

            if(!videoConstraint){
                var tempStreamCanvas = document.getElementById('c1');
                var tempStream = tempStreamCanvas.captureStream();
                tempStream.isScreen = true;
                tempStream.streamid = tempStream.id;
                tempStream.type = 'local';
                connection.attachStreams.push(tempStream);
                window.tempStream = tempStream;
            }
            connection.extra.roomOwner = true;
            connection.open(params.sessionid, function(isRoomOpened, roomid, error) {
                if (error) {
                    if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                        alert('Someone already created this room. Please either join or create a separate room.');
                        return;
                    }
                    alert(error);
                }

                connection.socket.on('disconnect', function() {
                    location.reload();
                });
                connection.socket.on(connection.socketCustomEvent, function(message) {
                    if(message.action == "reject-call"){
                        document.getElementById('request_call').style.display = 'none';
                        document.getElementById('vid' + message.user_id).setAttribute('src','/images/videocam_off.png');
                    }else if (message.action == 'hand-up'){
                        var hand = message.user_name + ' <img title="Inquietud" src="/images/hand.png"><br>'
                        $('#div_chat').append(hand);
                        M.toast({html:'Un estudiante ha levantado la mano', classes:'rounded'});  
                        conversationPanel.scrollTop = conversationPanel.clientHeight;
                        conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
                    }
                });
            });
    //} else {
        /*connection.join(params.sessionid, function(isRoomJoined, roomid, error) {
            if (error) {
                if (error === connection.errors.ROOM_NOT_AVAILABLE) {
                    alert('This room does not exist. Please either create it or wait for moderator to enter in the room.');
                    return;
                }
                if (error === connection.errors.ROOM_FULL) {
                    alert('Room is full.');
                    return;
                }
                if (error === connection.errors.INVALID_PASSWORD) {
                    connection.password = prompt('Please enter room password.') || '';
                    if(!connection.password.length) {
                        alert('Invalid password.');
                        return;
                    }
                    connection.join(params.sessionid, function(isRoomJoined, roomid, error) {
                        if(error) {
                            alert(error);
                        }
                    });
                    return;
                }
                alert(error);
            }

            connection.socket.on('disconnect', function() {
                location.reload();
            });
        });
    }*/
//});

var canvas = document.getElementById('c1');
var ctx = canvas.getContext('2d');

var img = new Image();

img.onload = function(){
canvas.width = img.naturalWidth
canvas.height = img.naturalHeight
ctx.drawImage(img, 0, 0);
}

function addStreamStopListener(stream, callback) {
    stream.addEventListener('ended', function() {
        callback();
        callback = function() {};
    }, false);

    stream.addEventListener('inactive', function() {
        callback();
        callback = function() {};
    }, false);

    stream.getTracks().forEach(function(track) {
        track.addEventListener('ended', function() {
            callback();
            callback = function() {};
        }, false);

        track.addEventListener('inactive', function() {
            callback();
            callback = function() {};
        }, false);
    });
}

function replaceTrack(videoTrack, screenTrackId) {
    if (!videoTrack) return;
    if (videoTrack.readyState === 'ended') {
        alert('Can not replace an "ended" track. track.readyState: ' + videoTrack.readyState);
        return;
    }
    connection.getAllParticipants().forEach(function(pid) {
        var peer = connection.peers[pid].peer;
        if (!peer.getSenders) return;
        var trackToReplace = videoTrack;
        peer.getSenders().forEach(function(sender) {
            if (!sender || !sender.track) return;
            if(screenTrackId) {
                if(trackToReplace && sender.track.id === screenTrackId) {
                    sender.replaceTrack(trackToReplace);
                    trackToReplace = null;
                }
                return;
            }

            if(sender.track.id !== tempStream.getTracks()[0].id) return;
            if (sender.track.kind === 'video' && trackToReplace) {
                sender.replaceTrack(trackToReplace);
                trackToReplace = null;
            }
        });
    });
}

function replaceScreenTrack(stream) {
    stream.isScreen = true;
    stream.streamid = stream.id;
    stream.type = 'local';

    // connection.attachStreams.push(stream);
    connection.onstream({
        stream: stream,
        type: 'local',
        streamid: stream.id,
        // mediaElement: video
    });

    var screenTrackId = stream.getTracks()[0].id;
    addStreamStopListener(stream, function() {
        connection.send({
            hideMainVideo: true
        });

        // $('#main-video').hide();
        $('#screen-viewer').hide();
        replaceTrack(tempStream.getTracks()[0], screenTrackId);
    });

    stream.getTracks().forEach(function(track) {
        if(track.kind === 'video' && track.readyState === 'live') {
            replaceTrack(track);
        }
    });

    connection.send({
        showMainVideo: true
    });

    // $('#main-video').show();
    $('#screen-viewer').css({
            top: 100,
            left: 100,
            width: 100,
            height: 100
        });
    $('#screen-viewer').show();
}

function shareScreen(){

    screen_constraints= {video: true}
    if(navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(screen_constraints).then(stream => {
            $('#screen-viewer').get(0).srcObject = stream;
        }, error => {
            alert('Please make sure to use Edge 17 or higher.');
        });
    }
    else if(navigator.getDisplayMedia) {
        navigator.getDisplayMedia(screen_constraints).then(stream => {
            $('#screen-viewer').get(0).srcObject = stream;
        }, error => {
            alert('Please make sure to use Edge 17 or higher.');
        });
    }
    else {
        alert('getDisplayMedia API is not available in this browser.');
    }
}

var remotestream = false

    //Profesor habilita o desabilita microfono del estudiante
    $(".muted").click(function(e){
        e.preventDefault();
        var user_id = $(this).attr("id").slice(3);
        var icon_clicked = document.getElementById("vid" + user_id);
        icon_clicked.disabled = true;
        var remotestream = icon_clicked.getAttribute('src').slice(8);
        if(remotestream == 'videocam_off.png'){
            connection.socket.emit(connection.socketCustomEvent, {user_id: user_id, action: "turn-on"});
            document.getElementById('request_call').style.display = 'block'; 
            icon_clicked.setAttribute('src','/images/loading2.gif');
            document.getElementById("p1").innerHTML = " Llamando a " + document.getElementById("name" + user_id).getAttribute("name");
            document.getElementById("hung_up1").setAttribute("value",user_id)
        }else{
            connection.socket.emit(connection.socketCustomEvent, {user_id: user_id, action: "turn-off"});
            emotestream = false;
            icon_clicked.setAttribute('src','/images/videocam_off.png');
        }
    });

    $("#hung_up1").click(function(e){
        var user_id = $(this).attr("value");
        connection.socket.emit(connection.socketCustomEvent, {user_id: user_id, action: "turn-off"});
        document.getElementById('request_call').style.display = 'none'; 
        document.getElementById('vid' + user_id).setAttribute('src','/images/videocam_off.png');
    });
    
    //stop event camara tutor (local)
    $("#stop-video1").click(function(){
        var firstStreamEvent = connection.streamEvents.selectFirst({
            local: true
        });

        firstStreamEvent.stream.getVideoTracks()[0].enabled =
        !(firstStreamEvent.stream.getVideoTracks()[0].enabled);

        if(!firstStreamEvent.stream.getVideoTracks()[0].enabled){
            document.getElementById('stop-video1').style.background = "url(/images/videocam_off.png) center no-repeat";
        }else{
            document.getElementById('stop-video1').style.background = "url(/images/videocam.png) center no-repeat";
        }
    });
    //stop event audio tutor (local)
    $("#stop-audio1").click(function(){
        var firstStreamEvent = connection.streamEvents.selectFirst({
            local: true
        });

        firstStreamEvent.stream.getAudioTracks()[0].enabled =
        !(firstStreamEvent.stream.getAudioTracks()[0].enabled);

        if(!firstStreamEvent.stream.getAudioTracks()[0].enabled){
            document.getElementById('stop-audio1').style.background = "url(/images/muted.png) center no-repeat";
        }else{
            document.getElementById('stop-audio1').style.background = "url(/images/microphone.png) center no-repeat";
        }
    });

    function startRecording() {
        document.getElementById('record').setAttribute('name','Stop Recording')
        recordedBlobs = [];
        let options = {mimeType: 'video/webm;codecs=vp9'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not Supported`);
            options = {mimeType: 'video/webm;codecs=vp8'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.error(`${options.mimeType} is not Supported`);
                options = {mimeType: 'video/webm'};
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    console.error(`${options.mimeType} is not Supported`);
                    options = {mimeType: ''};
                }
            }
        }

        // capura el flujo se está transmitiendo (recurso para ser visto)
        if(adapter.browserDetails.browser === 'firefox'){
           (videoConstraint) ? stream2 = screen_viewer.mozCaptureStream() : stream2 = localCanvas.captureStream();
        }else{
           (videoConstraint) ? stream2 = screen_viewer.captureStream() : stream2 = localCanvas.captureStream();
        }
        //(videoConstraint) ? stream2 = screen_viewer.captureStream() : stream2 = localCanvas.captureStream();
        //stream2 = document.getElementById('c1').captureStream()

        //se toma le flujo de video
        streamVideo2 = stream2.getVideoTracks()[0];

        //captura del flujo del audio
        if(adapter.browserDetails.browser === 'firefox'){
            stream3 = document.getElementById('main-video').mozCaptureStream();
        }else{
            stream3 = document.getElementById('main-video').captureStream();
        }

        if(adapter.browserDetails.browser != 'firefox' && videoConstraint){
            streamVideo2.addEventListener('ended', function() {
                document.getElementById('back').click()
            });
        }

        // Se toma el flujo de audio
        streamTrack2 = stream3.getAudioTracks()[0];


        //mix entre los flujos de video y audio
        newStream2 = new MediaStream([streamVideo2, streamTrack2]);

        //recorder = RecordRTC(newStream2, {type: 'video'});
        //recorder.startRecording();

                    // enable stop-recording button  
        try {
            mediaRecorder = new MediaRecorder(newStream2, options);
        } catch (e) {
            console.error('Exception while creating MediaRecorder:', e);
            return;
        }
        console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
        
        mediaRecorder.onstop = (event) => {
            console.log('Recorder stopped: ', event);
        };
        //mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.ondataavailable = postBlob 
       
        mediaRecorder.start(100); // collect 10ms of data
        console.log('MediaRecorder started', mediaRecorder);

        mediaRecorderFlag = true;
        
    }

    function handleDataAvailable(event) {
        /*//var reader = new FileReader();
        //reader.readAsArrayBuffer(event.data);
        //reader.onloadend = function (event) {
            //socket.emit('part-video',reader.result, id_course, name_video);
            //connection.socket.emit('part-video',reader.result, id_course, name_video);
            var fd = new FormData();
            fd.append('id_course',id_course);
            fd.append('name_video',name_video);
            fd.append('data', event.data);
            //fd.append('data', event.target.result);
            $.ajax({
                type: 'POST',
                url: '/control4/pushVideo',
                data: fd,
                processData: false,
                contentType: false
            }).done(function(data) {
                   //console.log(data);
            });
        //};*/
    }


    /*function handleDataAvailable(event) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(event.data);
        reader.onloadend = function (event) {
            //socket.emit('part-video',reader.result, id_course, name_video);
            //connection.socket.emit('part-video',reader.result, id_course, name_video);
            var fd = new FormData();
            fd.append('id_course',id_course);
            fd.append('name_video',name_video);
            //fd.append('data', event.data);
            fd.append('data', new Blob([reader.result]));
            $.ajax({
                type: 'POST',
                url: '/control4/pushVideo',
                data: fd,
                processData: false,
                contentType: false
            }).done(function(data) {
                   //console.log(data);
            });
        };
    }*/
    
    document.querySelector('button#record').onclick = function() {
        var resp = confirm("¿Desea detener la transmisión?");
        if(resp == true){

        /*recorder.stopRecording(function() {
            var blob = recorder.getBlob();

            var fd = new FormData();
            fd.append('id_course',id_course);
            fd.append('name_video',name_video);
            fd.append('data', event.data);
            //fd.append('data', event.target.result);
            $.ajax({
                type: 'POST',
                url: '/control4/pushVideo',
                data: fd,
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                success: function(result) {
                    console.log("exitoso")
                },
                error: function(error) {
                    console.log("error");
                }
            });

            window.open( URL.createObjectURL(blob) );
         });*/

            console.log('Recorded Blobs: ', recordedBlobs);
            mediaRecorder.stop();
            document.getElementById('main-video').controls = true;
            var MediaStream = window.MediaStream;

            if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
                MediaStream = webkitMediaStream;
            }

            if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
                MediaStream.prototype.stop = function() {
                    this.getTracks().forEach(function(track) {
                        track.stop();
                    });
                };
            }
            $.ajax({
                type: "POST",
                url: "/control4/tutor_left_class",
                data: {
                    id_videoclass: id_class,
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
    };

const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let sourceBuffer;

/*function customRecordStream(stream) {
  // should actually check to see if the given mimeType is supported on the browser here.
  let options = { mimeType: 'video/webm;codecs=vp9' };
  recorder = new MediaRecorder(window.stream, options);
  recorder.ondataavailable = postBlob 
  recorder.start(INT_REC)
};*/

function postBlob(event){
  if (event.data && event.data.size > 0) {
    sendBlobAsBase64(event.data);
  }
}

function handleSourceOpen(event) {
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
} 

function sendBlobAsBase64(blob) {
  const reader = new FileReader();

  reader.addEventListener('load', () => {
    const dataUrl = reader.result;
    const base64EncodedData = dataUrl.split(',')[1];
    //console.log(base64EncodedData)
    sendDataToBackend(base64EncodedData);
  });

  reader.readAsDataURL(blob);
};

function sendDataToBackend(base64EncodedData) {
  const body = JSON.stringify({
    data: base64EncodedData,
    id_course: id_course,
    name_video: name_video
  });
  fetch('/control4/pushVideo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body
  }).then(res => {
    return res.json()
  })//.then(json => console.log(json));
}; 




});
    