window.onload = function(){
    $('#myModal').css('visibility', 'visible');
    var str = document.URL
    var roomlong = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    var room = roomlong.split("&&")[1];
    
    $.ajax({
        async: false,
        type: "POST",
        url: "/data-user",
        success: function(result) {
            params = {
                open: false,
                publicRoomIdentifier: "dashboard",
                sessionid: room,
                userFullName: result.nombres,
                my_id: result.my_id
            }

            window.params = params;
        },
        error: function(error) {
            console.log("error");
        }
    });

    var myMessages = document.getElementsByClassName(params.userFullName);
    for (var i = 0; i < myMessages.length; i++) {
        myMessages[i].style.background = '#8d191d';
        myMessages[i].style.color = 'white';
        myMessages[i].style.width = '80%';
        myMessages[i].style.float = 'left';
        myMessages[i].style.margin = '5px';
        myMessages[i].style.padding = '5px';
        myMessages[i].style.borderRadius = '7px';
    }

/*var localCanvas = document.getElementById('c1');
var cardVideoWidth =  document.getElementById('c3').offsetWidth;
var cardVideoHeight =  document.getElementById('c3').offsetHeight;
localCanvas.width = cardVideoWidth;
localCanvas.height = cardVideoHeight;

fabric.Object.prototype.transparentCorners = false;
this.__canvases = [];
var canvas = this.__canvas = new fabric.Canvas('c1', { stateful: true, backgroundColor: 'rgb(255,250,255)' });
*/

document.getElementById('btnClass').onclick = reloadPage;
function reloadPage(){
    $('#myModal2').css('visibility', 'hidden');
    document.getElementById('main-video').play();
    document.getElementById('remoteVideo2').play();
}

startnegotiation()
function startnegotiation(){
    $('#myModal2').css('visibility', 'hidden');

    var connection = new RTCMultiConnection();

    connection.socketURL = '/';
    // connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    connection.extra.userFullName = params.userFullName;
    connection.extra.user_id = params.my_id;

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

    // here goes RTCMultiConnection

    connection.chunkSize = 16000;
    connection.enableFileSharing = true;

    connection.session = {
        audio: true,
        video: true,
        data: true,
    };

    var BandwidthHandler = connection.BandwidthHandler;
    connection.bandwidth = {
        audio: 128,
        video: 256,
        screen: 300
    };

    connection.DetectRTC.load(function() {
    if (connection.DetectRTC.hasMicrophone === true) {
        // enable microphone
        connection.mediaConstraints.audio = true;
        connection.session.audio = true;
    }else{
         alert('No se ha detectado ningun dispositivo tipo micrófono en su equipo, por favor conecte uno.');
    }

    if (connection.DetectRTC.hasWebcam === true) {
        // enable camera
        connection.mediaConstraints.video = true;
        connection.session.video = true;
    }else{
         alert('No se ha detectado ningun dispositivo tipo cámara en su equipo, por favor conecte uno.');
    }

    if (connection.DetectRTC.hasMicrophone === false &&
        connection.DetectRTC.hasWebcam === false) {
        // he do not have microphone or camera
        // so, ignore capturing his devices
        connection.dontCaptureUserMedia = true;
    }

    if (connection.DetectRTC.hasSpeakers === false) { // checking for "false"
        alert('No se ha detectado ningun dispositivo tipo speaker en su equipo, por favor conecte uno.');
    }

});

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

    /*connection.DetectRTC.load(function() {
        if (connection.DetectRTC.hasMicrophone === true) {
            // enable microphone
            connection.mediaConstraints.audio = true;
            connection.session.audio = true;
        }

        if (connection.DetectRTC.hasWebcam === true) {
            // enable camera
            connection.mediaConstraints.video = true;
            connection.session.video = true;
        }

        if (connection.DetectRTC.hasMicrophone === false &&
            connection.DetectRTC.hasWebcam === false) {
            // he do not have microphone or camera
            // so, ignore capturing his devices
            connection.dontCaptureUserMedia = true;
        }

        if (connection.DetectRTC.hasSpeakers === false) { // checking for "false"
            alert('Please attach a speaker device. You will unable to hear the incoming audios.');
        }

    });*/

    connection.bandwidth = {
        audio: 50,  // 50 kbps
        video: 256 // 256 kbps
    };

    /*connection.mediaConstraints = {
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
    };*/

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

    connection.dontCaptureUserMedia = true;

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
        /*names.forEach(function(name) {
            status_student = document.getElementById("status" + name);
            if(status_student){
                status_student.setAttribute('src','/images/circle.png');  
            }
        });*/
        //infoBar.innerHTML = '<b>Active users:</b> ' + names.join(', ');
    };

    connection.onopen = function(event) {
        connection.onUserStatusChanged(event);
        document.getElementById("status" + params.userFullName).setAttribute('src','/images/circle.png');

        /*if (designer.pointsLength <= 0) {
            // make sure that remote user gets all drawings synced.
            setTimeout(function() {
                connection.send('plz-sync-points');
            }, 1000);
        }*/

        //document.getElementById('btn-chat-message').disabled = false;
        //document.getElementById('btn-attach-file').style.display = 'inline-block';
        //document.getElementById('btn-share-screen').style.display = 'inline-block';
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
            $('#key-press').show().find('span').html(event.extra.userFullName + ' is typing');
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
var flagnumber = false;
    connection.onstream = function(event) {
        //if (event.stream.isScreen && !event.stream.canvasStream) {
        if (event.stream.isScreen ) {
            //$('#screen-viewer').get(0).srcObject = event.stream;
            //$('#screen-viewer').hide();
            if( flagnumber && !event.stream.isVideo){
                return;    
            }
            $('#remoteVideo2').get(0).srcObject = event.stream;
            //$('#remoteVideo2').hide();
            if(document.getElementById("main-video").paused){
                $('#myModal2').css('visibility', 'visible');
            }

            flagnumber = true;
        }else if (event.extra.roomOwner === true) {
            var video = document.getElementById('main-video');
            video.setAttribute('data-streamid', event.streamid);
            // video.style.display = 'none';
            if(event.type === 'local') {
                video.muted = true;
                video.volume = 0;
            }
            video.srcObject = event.stream;
        } else {
            event.mediaElement.controls = false;

            var otherVideos = document.querySelector('#other-videos');
            otherVideos.appendChild(event.mediaElement)

        }
        connection.onUserStatusChanged(event);
    };

    connection.onstreamended = function(event) {
        var video = document.querySelector('video[data-streamid="' + event.streamid + '"]');
        if(event.extra.roomOwner){
            location.reload();
        }
        if (!video) {
            video = document.getElementById(event.streamid);
            if (video) {
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
            //document.getElementById("main-video").play();
            if (state.iceConnectionState.search(/closed|failed/gi) !== -1) {
                //document.getElementById("vid"+state.extra.user_id).setAttribute('src','');
                //document.getElementById("img"+state.extra.user_id).setAttribute('src','/images/circle2.png');
                if(state.extra.roomOwner === true){
                    location.reload();
                    /*console.log("El profesor se fue");
                    (function checkRoom() {
                        connection.checkPresence(room, function(isRoomExist, roomid, error) {
                            if (isRoomExist === true) {
                                location.reload();
                            }
                            setTimeout(checkRoom, 3000); // recheck after every 3 seconds
                        });
                    })();*/              
                }
            }
        }
    };

    connection.onPeerStateChanged = function(state) {
        if (connection.enableLogs) {
            status_student = document.getElementById("status" + state.extra.userFullName);
            if (state.iceConnectionState.search(/closed|failed/gi) !== -1) {
                if(status_student){
                    status_student.setAttribute('src','/images/circle2.png');
                }
            }else if(state.iceConnectionState == 'connected'){
                if(status_student){
                    status_student.setAttribute('src','/images/circle.png');
                }
            }
        }
    };

    var conversationPanel = document.getElementById('conversation-panel');
    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;

    function appendChatMessage(event, checkmark_id) {
        var div = document.createElement('div');
        div.className = 'message';

        if (event.data) {
            div.innerHTML = '<b>' + (event.extra.userFullName || event.userid) + ':</b><br>' + event.data.chatMessage;
            div.style.background = '#4E6470';
            div.style.color = 'white';
            div.style.width = '80%';
            div.style.float = 'right';
            div.style.margin = '5px';
            div.style.padding = '5px';
            div.style.borderRadius = '7px';

            if (event.data.checkmark_id) {
                connection.send({
                    checkmark: 'received',
                    checkmark_id: event.data.checkmark_id
                });
            }
        } else {
            div.innerHTML = '<b>' + params.userFullName + ':</b> <img class="checkmark" id="' + checkmark_id + '" title="Received" src="https://www.webrtc-experiment.com/images/checkmark.png"><br>' + event;
            div.style.background = '#8d191d';
            div.style.color = 'white';
            div.style.width = '80%';
            div.style.float = 'left';
            div.style.margin = '5px';
            div.style.padding = '5px';
            div.style.borderRadius = '7px';
        }

        conversationPanel.appendChild(div);

        conversationPanel.scrollTop = conversationPanel.clientHeight;
        conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
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

(function checkRoom() {
    connection.checkPresence(room, function(isRoomExist, roomid, error) {
        if (isRoomExist === true) {
            connection.join(params.sessionid, function(isRoomJoined, roomid, error) {
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
            $('#myModal').css('visibility', 'hidden');
            $('#myModal2').css('visibility', 'hidden');
            connection.socket.on('disconnect', function() {
                location.reload();
            });
            connection.socket.on(connection.socketCustomEvent, function(message) {
                if(message.user_id == params.my_id && message.action == "turn-on"){
                    document.getElementById('request_call').style.display = 'block'; 
                }else if(message.user_id == params.my_id && message.action == "turn-off"){
                    document.getElementById('in_call').style.display = 'none'; 
                    document.getElementById('request_call').style.display = 'none'; 
                    connection.attachStreams.forEach(function(stream){
                        stream.stop();
                    });
                }else if(message.user_id == "todos"){
                    //canvas.loadFromJSON(message.action);
                }else if (message.action == 'hand-up'){
                    var hand = message.user_name + ' <img title="Inquietud" src="/images/hand.png"><br>'
                    $('#conversation-panel').append(hand); 
                    conversationPanel.scrollTop = conversationPanel.clientHeight;
                    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
                }
            });
        });
            return;
        }
        console.log('profesor no está en la sala')
        setTimeout(checkRoom, 3000); // recheck after every 3 seconds
    });
})();

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
        //$('#btn-share-screen').show();
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
            top: $('#widget-container').offset().top,
            left: $('#widget-container').offset().left,
            width: $('#widget-container').width(),
            height: $('#widget-container').height()
        });
    $('#screen-viewer').show();
}

    /*$('#btn-share-screen').click(function() {
    if(!window.tempStream) {
        alert('Screen sharing is not enabled.');
        return;
    }

    
    screen_constraints = {video: true}


    //$('#btn-share-screen').hide();

    if(navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia(screen_constraints).then(stream => {
            replaceScreenTrack(stream);
        }, error => {
            alert('Please make sure to use Edge 17 or higher.');
        });
    }
    else if(navigator.getDisplayMedia) {
        navigator.getDisplayMedia(screen_constraints).then(stream => {
            replaceScreenTrack(stream);
        }, error => {
            alert('Please make sure to use Edge 17 or higher.');
        });
    }
    else {
        alert('getDisplayMedia API is not available in this browser.');
    }
});
*/
    $(".accept").click(function(e){
        connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        };
       connection.addStream({
            audio: true,
            video: true,
            oneway: true
       });
        document.getElementById('request_call').style.display = 'none'; 
        document.getElementById('in_call').style.display = 'block'; 
    });
    
    $(".reject_call").click(function(e){
        connection.socket.emit(connection.socketCustomEvent, {user_id: params.my_id, action: "reject-call"});
        document.getElementById('request_call').style.display = 'none'; 
    });

    $("#stop-video").click(function(e){
        connection.attachStreams.forEach(function(localStreamVideo1){
            localStreamVideo1.getVideoTracks()[0].enabled =
             !(localStreamVideo1.getVideoTracks()[0].enabled);

            if(!localStreamVideo1.getVideoTracks()[0].enabled){
                document.getElementById('stop-video').style.background = "url(/images/videocam_off.png) center no-repeat";
            }else{
                document.getElementById('stop-video').style.background = "url(/images/videocam.png) center no-repeat";
            }
        });
    });
    $("#stop-audio").click(function(e){
        connection.attachStreams.forEach(function(localStreamVideo1){

            localStreamVideo1.getAudioTracks()[0].enabled =
             !(localStreamVideo1.getAudioTracks()[0].enabled);

            if(!localStreamVideo1.getAudioTracks()[0].enabled){
                document.getElementById('stop-audio').style.background = "url(/images/muted.png) center no-repeat";
            }else{
                document.getElementById('stop-audio').style.background = "url(/images/microphone.png) center no-repeat";
            }
        });
    });
    $("#hung_up").click(function(e){
        connection.attachStreams.forEach(function(stream){
            stream.stop();
            document.getElementById('in_call').style.display = 'none'; 
        });
    });
    $("#hand").click(function(e){
        connection.socket.emit(connection.socketCustomEvent, {user_id: params.my_id, action: "hand-up", user_name: params.userFullName});
        var hand = params.userFullName + '<img src="/images/hand.png" title="Inquietud"><br>'
        $('#conversation-panel').append(hand);
        conversationPanel.scrollTop = conversationPanel.clientHeight;
        conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;    
    });

    conversationPanel.scrollTop = conversationPanel.clientHeight;
    conversationPanel.scrollTop = conversationPanel.scrollHeight - conversationPanel.scrollTop;
}
}

$(document).ready(function() {  

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

    $("#trigger").click(function() {
      $("#target").slideToggle(); 
    });

    $("#trigger2").click(function() {
      $("#tablero").slideToggle(); 
    });
});