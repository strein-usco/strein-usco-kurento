/*
 * El protocolo de señalización fue tomado de:
 * https://github.com/trungdq88/webrtc-demo
 * https://github.com/googlecodelabs/webrtc-web/blob/master/step-05/index.js
 *
 * El codigo se tomó de estos dos repositorios de github
 */

$(document).ready(function() {
    $('#myModal2').css('visibility', 'visible');    
    /*********************************************************************
     ****************** COMUNICACION SOCKET - SERVDIOR    *****************
     **********************************************************************/

    var socket = io.connect();
    var remoteVideo2 = document.getElementById('remoteVideo2');
    var isChannelReady = false;
    var isStarted = false;
    var micEnable = false;
    var sessionUser = false;
    var remoteStream1;
    var remoteStream2;
    var remoteStream3;
    var amountStream = 0;
    var amountStream2 = 0;
    var localStream;
    var localAudio;
    var pc;
    var studentMicOn;
    var turnReady;
    var text2send;
    var pcConfig = {
        'iceServers': [{
            'urls': 'stun:stun.l.google.com:19302'
        }]
    };
    var sdpSemantics ='unified-plan';
    var configuration ={
        sdpSemantics: sdpSemantics,
        iceServers: [{
           urls: [ "stun:u2.xirsys.com" 
        ]},
        { username: "q5eU0nRfRsHydrNEVgNikRqwmWCgRssL_b6zn9OYQJ_Jdv9Bg_PBALYadTwCLhrfAAAAAFzJNYRzdHJlaW4=",
          credential: "2468235a-6bd6-11e9-94d7-6ea37c7028db",
          urls: [
               "stun:stun.stunprotocol.org:3478",
               "turn:u2.xirsys.com:80?transport=udp",
               "turn:u2.xirsys.com:3478?transport=udp",
               "turn:u2.xirsys.com:80?transport=tcp",
               "turn:u2.xirsys.com:3478?transport=tcp",
               "turns:u2.xirsys.com:443?transport=tcp",
               "turns:u2.xirsys.com:5349?transport=tcp"   
            ]
        }]
    } 

    var configuration2 = {
        sdpSemantics: sdpSemantics,
        iceServers: [{
           urls: [ "stun:u2.xirsys.com" 
        ]},
        { username: "q5eU0nRfRsHydrNEVgNikRqwmWCgRssL_b6zn9OYQJ_Jdv9Bg_PBALYadTwCLhrfAAAAAFzJNYRzdHJlaW4=",
          credential: "2468235a-6bd6-11e9-94d7-6ea37c7028db",
          urls: [
               "turn:u2.xirsys.com:80?transport=udp",
               "turn:u2.xirsys.com:3478?transport=udp",
               "turn:u2.xirsys.com:80?transport=tcp",
            ]
        }]
    }

    var configuration3 = {
        sdpSemantics: sdpSemantics,
        iceServers:[
            { urls: [ 'stun:stun.stunprotocol.org:3478' ]},
            { username: 'webrtc@live.com',
              credential: 'muazkh',
              urls: [
                'turn:numb.viagenie.ca'
              ]
            },
            { username: '28224511:1379330808',
              credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              urls: [
                'turn:192.158.29.39:3478?transport=udp'
              ]
            }
        ]
    }

    var datos_user
    $.ajax({
        async: false,
        type: "POST",
        url: "/data-user",
        success: function(result) {
            datos_user = result;
        },
        error: function(error) {
            console.log("error");
        }
    });

    //Extraemos el codigo del correo en el caso de un correo institucional
    var codigoUser1 = datos_user.correo;
    codigoUser = codigoUser1.substring(0, codigoUser1.lastIndexOf("@"));
    var nameUser = datos_user.nombres;
    var my_id = datos_user.my_id;
    var str = document.URL
    //var room = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    var room = document.getElementById("id_class").getAttribute("value");
    var iscanvasStream = false;
    var peerConnection;
    var peerConnectionConfig = {sdpSemantics: 'plan-b', 'iceServers': [{
            'urls': 'stun:stun.l.google.com:19302'
        }]};
    var remoteVideo = document.getElementById('remoteVideo');
    var remoteCanvas = document.getElementById('remoteCanvas');
    var remoteAudio = document.getElementById('remoteAudio');
    var btnClass = document.getElementById('btnClass');
    var browserMoz;
    (adapter.browserDetails.browser === 'firefox')?browserMoz = true: browserMoz = false;
    btnClass.onclick = startNegotiation;
    
    if (location.hostname !== 'localhost') {
        //requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
    }

    socket.emit('get all old messages',room);

    socket.on('load old messages', (messages)=>{
        for (let i = 0; i < messages.length;  i++) {
            display_mssgs(messages[i])
        }
    });

    function display_mssgs(messages){
        $('#div_chat').append(messages.messageText);
        $('#div_chat')[0].scrollTop = $('#div_chat')[0].scrollHeight - $('#div_chat')[0].clientHeight;
    }

    socket.on('ipaddr', function(ipaddr) {
        console.log('Server IP address is: ' + ipaddr);
    });

    socket.on('joined', function(room, clientId) {
        console.log('This peer has joined room', room, 'with client ID', clientId);
        isChannelReady = true;
    });

    if (location.hostname.match(/localhost|127\.0\.0/)) {
        socket.emit('ipaddr');
    }
    socket.on('ready', function(other) {
        console.log('Socket is ready');
        //createPeerConnection();
    });
    socket.on('log', function(array) {
        console.log.apply(console, array);
    });
    // Wait for professor to offer
    socket.on('professor-offer-a-session', function(professorSessionDescription, studentMicOn) {
        document.getElementById('studentMicOn').val =studentMicOn;
        amountStream = amountStream2 = 0;
        console.log('professor has offerred a session');
        $('#myModal').css('visibility', 'hidden');
        $('#myModal2').css('visibility', 'hidden');
        if(peerConnection){
            peerConnection.getLocalStreams().forEach(function(stream){
                peerConnection.removeStream(stream);
            });
        }
        if(!sessionUser){
            $.ajax({
                async: false,
                type: "POST",
                url: "/sessionUser2",
                data: {
                    socketID: socket.id,
                    roomID: room
                },
                success: function(result) {
                    console.log("Se guardo la session de clase en vivo exitosamente");
                    sessionUser =  true;
                },
                error: function(error) {
                    console.log("error");
                }
            });
        }
        
        // Create peer connection
        //peerConnection = new RTCPeerConnection(peerConnectionConfig);
        peerConnection = new RTCPeerConnection(configuration3);

        if(micEnable){
            localStream.getTracks()
          .forEach(track => peerConnection.addTrack(track, localStream));
            console.log('Adding Local Stream to peer connection');
        }

        // Be ready to send the candidate infomation to Professor
        peerConnection.onicecandidate = handleIceCandidate;

        // Be ready to receive video from professor
        /*if(adapter.browserDetails.browser === 'firefox'){
            peerConnection.ontrack = handleRemoteTrackAdded;
        }else{
            //peerConnection.onaddstream = handleRemoteStreamAdded;
        }*/
        peerConnection.ontrack = handleRemoteTrackAdded;

        //Bre ready to remove stream from professor
        peerConnection.onremovestream = handleRemoteStreamRemoved;

        // Set professor's sessionDescription as remote description
        peerConnection.setRemoteDescription(professorSessionDescription);
        console.log('setRemoteDescription');
        console.log(professorSessionDescription);
        // Create an answer and send session description back to professor
        peerConnection.createAnswer()
            .then(function(studentSessionDescription) {
                peerConnection.setLocalDescription(studentSessionDescription);
                console.log('setLocalDescription');
                console.log(studentSessionDescription)
                socket.emit('student-answer-the-offer', studentSessionDescription, room, nameUser, my_id);
                console.log('Offer accepted. An answer is sent to professor.');
            });
    });

    // Receive ICE candidate info from professor
    socket.on('professor-sending-ice-candidate', function(candidate) {
        console.log('Received an ice candidate from professor');
        // Update ICE candidate info
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('renegotiation', function(){
        socket.emit('join',room, browserMoz);
    });
    
    socket.on('professor-is-not-here', function() {
        $('#myModal').css('visibility', 'visible');
        $('#myModal2').css('visibility', 'hidden');
        console.log('professor is not here');
        setTimeout(function() {
            socket.emit('join', room, browserMoz);
        }, 6000);
    });

    socket.on('professor-left', function() {
        if(micEnable){
            peerConnection.getLocalStreams().forEach(function(stream){
                peerConnection.removeStream(stream);
            });
            var streamVideo = localStream.getVideoTracks()[0];
            var streamTrack = localStream.getAudioTracks()[0];
            streamVideo.stop();
            streamTrack.stop();
        }
        micEnable = false
        console.log('proffesor left');
        $('#myModal').css('visibility', 'visible');
        setTimeout(function() {
            socket.emit('join', room, browserMoz);
            console.log("reconectando");
        }, 5000);
    });

    socket.on('message-received', function(name, msg_chat) {
        if (name == socket.id) {
            $('#div_chat').append(msg_chat.own_msg);
            $('#chatbodytop').append(msg_chat.own_msg);
        } else if (msg_chat.std_msg) {
            $('#headChat').attr("class","pulse");
            $('#div_chat').append(msg_chat.std_msg);
            $('#chatbodytop').append(msg_chat.std_msg);
        } else {
            $('#headChat').attr("class","pulse");
            $('#div_chat').append(msg_chat);
            $('#chatbodytop').append(msg_chat);
        }
       $('#div_chat')[0].scrollTop = $('#div_chat')[0].scrollHeight - $('#div_chat')[0].clientHeight;
    });
    
    socket.on('handUp-std', function(name) {
        var hand = text2send.name + ' <img src="/images/hand.png"><br>'
        $('#div_chat').append(hand);
        $('#chatbodytop').append(hand);
    });

    socket.on('request-enable-stream', function(mediaConstraint){
        console.log("El profesor ha solicitado una renegociacion");
        //var widthVideo = document.getElementById('card-small').offsetWidth;
        peerConnection.getLocalStreams().forEach(function(stream){
            peerConnection.removeStream(stream);
        });
        //remoteVideo2.width = widthVideo;
        requestAudio(mediaConstraint);
        micEnable = true;
    });

    socket.on('broadcasting-student-stream', function(){
        if(!micEnable){
            //var widthVideo = document.getElementById('card-small').offsetWidth;
            peerConnection.getLocalStreams().forEach(function(stream){
                peerConnection.removeStream(stream);
            });
            //remoteVideo2.width = widthVideo;
            socket.emit('join', room, browserMoz);
        }
    });

    socket.on('request-disable-stream', function(){
        micEnable = false;
        //remoteVideo2.srcObject = null;
        var streamVideo = localStream.getVideoTracks()[0];
        var streamTrack = localStream.getAudioTracks()[0];
        streamVideo.stop();
        streamTrack.stop();
        //remoteVideo2.width = 0;
        console.log("mic is off");
    });

    function startNegotiation (){
        $('#myModal2').css('visibility', 'hidden');
        // Joining a room.
        socket.emit('join', room,browserMoz);
    }

    function handleIceCandidate (event){
        console.log('Sent ICE candidate information to Professor');
        if (event.candidate) {
            socket.emit('student-sending-ice-candidate', event.candidate, room);
        }
    }
    function handleRemoteTrackAdded (event){
        switch(amountStream){
            case 0:
                amountStream = 1;
                remoteVideo.srcObject = event.streams[0]
                break;
            case 1:
                amountStream = 2;
                remoteVideo.srcObject = event.streams[0]
                break;
            case 2:
                amountStream = 3;
                remoteCanvas.srcObject = event.streams[0]
                break;
            case 3:
                amountStream = 4;
                remoteVideo2.srcObject = event.streams[0]
                break;
            case 4:
                amountStream = 0;
                remoteVideo2.srcObject = event.streams[0]
                break;
        }
    }


    /*function handleRemoteStreamAdded (event){
        console.log('Received video stream from professor.');
        var camOn = document.getElementById('studentMicOn').val;
        switch(amountStream2){
            case 0:
                (!camOn)? amountStream2 = 1: amountStream2 = 2;
                remoteStream1 = event.stream;
                remoteVideo.srcObject = remoteStream1;
                break;
            case 1:
                amountStream2 = 2;
                remoteStream2 = event.stream;
                remoteCanvas.srcObject = remoteStream2;
                break;
            case 2:
                (!camOn)? amountStream2 = 0: amountStream2 = 1;
                if(!micEnable){
                remoteVideo2.muted=false;
                remoteStream3 = event.stream;
                remoteVideo2.srcObject = remoteStream3;
                }
                break;
        }
    }*/

    function handleRemoteStreamRemoved(event) {
      console.log('Remote stream removed. Event: ', event);
    }

    function requestAudio (mediaConstraint){
        navigator.mediaDevices.getUserMedia(mediaConstraint)
        .then(gotStream)
        .catch(function(e) {
            alert('getUserMedia() error: ' + e.name);
        });
    }

    function gotStream (mediaStream){
        //localAudio = document.getElementById('localAudio');
        //localAudio.srcObject = mediaStream;
        remoteVideo2.srcObject = mediaStream;
        remoteVideo2.muted = true;
        localStream = mediaStream;
        socket.emit('join',room, browserMoz)
    }

    function requestTurn(turnURL) {
        var turnExists = false;
        for (var i in pcConfig.iceServers) {
            if (pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:') {
                turnExists = true;
                turnReady = true;
                break;
            }
        }
        if (!turnExists) {
            console.log('Getting TURN server from ', turnURL);
            // No TURN server. Get one from computeengineondemand.appspot.com:
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var turnServer = JSON.parse(xhr.responseText);
                    console.log('Got TURN server: ', turnServer);
                    pcConfig.iceServers.push({
                        'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
                        'credential': turnServer.password
                    });
                    turnReady = true;
                }
            };
            xhr.open('GET', turnURL, true);
            xhr.send();
        }
    }

    $("#hand").click(function(){
        text2send = {
            name: nameUser,
            email: codigoUser1
        }; // que tipo de usuario envia el mensaje estudiante o profe
        socket.emit('handUp', room, text2send, socket.id)
    });

    $('#input_text2').keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        // cuando se da click en la tecla
        if (keycode == '13') {
            text2send = {
                text: this.value,
                from: "std",
                codigo: nameUser,
                email: codigoUser1
            }; // que tipo de usuario envia el mensaje estudiante o profe
            socket.emit('message1', room, text2send, socket.id)
            this.value = ""; //limpia el input
        }
    });

    //*************** Efectos de movieminto de tablero **********************/
    $(".containerCourse").click(function() {
        var nameFile = $(this).attr("name");
        console.log("ha hecho click en el archivo "+nameFile);
        socket.emit("change-slide",room,nameFile);
    });

    $("#atras").click(function(){
        socket.emit("previous-slide",room);
    });

    $("#adelante").click(function(){
        socket.emit("next-slide",room);
    });

    //stop event
    $("#stop").click(function(){
        localStream.getVideoTracks()[0].enabled =
         !(localStream.getVideoTracks()[0].enabled);
    });
    $("#stop-audio").click(function(){
        // se detiene el audio
        localStream.getVideoTracks()[1].enabled =
         !(localStream.getVideoTracks()[1].enabled);
    });

});


