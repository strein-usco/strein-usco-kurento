/*
 * Ciertas funciones que hacen parte del canvas
 * fueron tomadas de las siguientes paginas:
 *
 * protocolo de señalización
 * https://github.com/trungdq88/webrtc-demo
 * https://github.com/googlecodelabs/webrtc-web/blob/master/step-05/index.js
 *
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 *
 * Ciertas funciones que hacen parte del canvas
 * fueron tomadas de las siguientes paginas:
 * 
 * retorno objeto estado inicial
 * https://stackoverflow.com/questions/42833142/prevent-fabric-js-objects-from-scaling-out-of-the-canvas-boundary
 *
 * animacion retangulo 
 * http://fabricjs.com/polygon-animation
 *
 * dibujo libre en el tablero 
 * http://fabricjs.com/freedrawing
 *
 * protocolo de señalización
 * https://github.com/trungdq88/webrtc-demo
 * https://github.com/googlecodelabs/webrtc-web/blob/master/step-05/index.js
 *
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 *
 * Los metodos implmentados para grabar y descargar fueron tomados de:
 * https://github.com/webrtc/samples/tree/gh-pages/src/content/capture/canvas-record
 * https://github.com/JohnSZhang/rtcPlayground/blob/master/multi-upload/multiupload.js
 *
 */
$(document).ready(function() { 

    /*********************************************************************
     ****************** COMUNICACION SOCKET - SERVDIOR    *****************
     **********************************************************************/
    //var socket = io.connect();
    var socket = io({transports: ['websocket']});
    var videoStream, stream2, newStream2, stream3, IDstudent2, id_session;
    var localStreamAudio, localStreamVideo1, localStreamVideo2;
    var localStream;
    var turnReady, idiv, idiv2;
    var peerConnectionConfig;
    var pcList = {};
    var id_class = document.getElementById('id_class').value;
    var name_video = document.getElementById('name_video').value;
    var localCanvas = document.getElementById('c1');
    var localVideo1 = document.getElementById('localVideo1'); //video del tutor 
    var localVideo2 = document.getElementById('localVideo2'); //video del estudiante
    var localVideo3 = document.getElementById('localVideo3'); //video de compartir pantalla
    var recordButton = document.querySelector('button#record');
    var shareScreenBtn = document.getElementById('shareScreenBtn');
    var playButton = document.querySelector('button#play');
    var taSend = document.querySelector('textarea#taSend');
    var taReceive = document.querySelector('textarea#taReceive');
    var videoConstraint = document.getElementById('share-screen').value;
    var id_tutor = document.getElementById('id_tutor').value;
    var cardVideoWidth =  document.getElementById('c2').offsetWidth;
    var cardVideoHeight =  document.getElementById('c2').offsetHeight;
    document.getElementById('web-cam4').style.display = 'none'
    document.getElementById('web-cam1').style.display = 'none'
    localCanvas.width = cardVideoWidth;
    localCanvas.height = cardVideoHeight;
    const mediaSource = new MediaSource();
    mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
    let mediaRecorder;
    let recordedBlobs;
    let sourceBuffer;
    recordButton.onclick = toggleRecording;
    var isChannelReady = false;
    var IsMicEnable = false;
    var IsDeviceEnable = false;
    var studentMicOn = false;
    var sessionUser = false;
    var mediaRecorderFlag = false;
    var text2send;
    var str = document.URL
    var roomlong = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    var room = roomlong.split("+")[0];
    var id_course = $("#id_CourProf").attr("value");
    var acum = 0;
    var pcConfig = {
        'iceServers': [{
            'urls': 'stun:stun.l.google.com:19302'
        }]
    };
    (videoConstraint == "false") ? videoConstraint = false: videoConstraint = true;
    var sdpSemantics ='unified-plan';
    console.log('sdpSemantics ' + sdpSemantics)

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
                idiv2 = "imadiv" + r;
                // se agrega en src la info en base64 del archivo
                document.getElementById(idiv2).setAttribute("src", "data:image/png;base64," + result.facefiles[r]);
            }
            for (var m = 0; m < result.Allfiles.length; m++) {
                $(".Main_container_files").append('<img type="hidden" id="hiddendiv' + m + '" src="data:image/png;base64,' + result.Allfiles[m] + '" class="imageCourse"/>');
            }
        },
        error: function(error) {
            console.log(error);
        }
    });

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

    // window.isSecureContext could be used for Chrome
    var isSecureOrigin = location.protocol === 'https:' ||
    location.hostname === 'localhost';
    if (!isSecureOrigin) {
        alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
            '\n\nChanging protocol to HTTPS');
        location.protocol = 'HTTPS';
    }
    socket.emit('get all old messages',id_class);
    socket.emit('')

    socket.on('load old messages', (messages)=>{
        for (let i = 0; i < messages.length;  i++) {
            display_mssgs(messages[i])
        }
    });

    localVideo3.addEventListener("play", function() {
        socket.emit('create or join room professor', room);
        sessionUserAJAX (sessionUser, socket,room,id_class)
    });

    // Playing 
    localVideo1.addEventListener("play", function() {
        if(videoConstraint){ 
            socket.emit('create or join room professor', room);
            sessionUserAJAX (sessionUser, socket,room,id_class)
        }
        if (location.hostname.match(/localhost|127\.0\.0/)) {
            socket.emit('ipaddr');
        }
    });
    
    function display_mssgs(messages){
        $('#div_chat').append(messages.messageText);
        $('#div_chat')[0].scrollTop = $('#div_chat')[0].scrollHeight - $('#div_chat')[0].clientHeight;
    }

    function sessionUserAJAX (sessionUser, socket,room,id_class){
        if(!sessionUser){
            $.ajax({
                async: false,
                type: "POST",
                url: "/sessionUser",
                data: {
                    socketID: socket.id,
                    roomID: room,
                    id_videoclass: id_class,
                },
                success: function(result) {
                    console.log("Se guardo la session de clase en vivo exitosamente");
                    sessionUser = true;
                },
                error: function(error) {
                    console.log("error");
                }
            });
        }
    }   

    /*****************************************
     * WebRTC peer connection 
     *****************************************/
    startMediaDevices();
  
    function startMediaDevices(){
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(gotStream).catch(function(e) {
            alert('getUserMedia() error: ' + e.name + ' desc: ' + e.message);
        });
    }

    function gotStream(stream) {
        if(mediaRecorderFlag){stopRecording();}
        console.log('Adding local stream.');
        localStreamVideo1 = localVideo1.srcObject = stream;
        if(!videoConstraint){ 
            shareScreen();
        }else{
            localVideo1.onloadedmetadata = function(event){
                startRecording();
            }
        }
    }

    function shareScreen(){

        var displayMediaStreamConstraints = {
            video: true // currently you need to set {true} on Chrome
        };

        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia(displayMediaStreamConstraints).then(gotStream2).catch(function(e) {
            alert('getUserMedia() error: ' + e.name + ' desc: ' + e.message);
        }); 
        } else {
            navigator.getDisplayMedia(displayMediaStreamConstraints).then(gotStream2).catch(function(e) {
            alert('getUserMedia() error: ' + e.name + ' desc: ' + e.message);
        }); 
        }
    }

    function gotStream2(stream) {
        document.getElementById('web-cam1').style.display = 'block'
        console.log('Adding local stream (Share Screen).');
        localStreamVideo2 = localVideo3.srcObject = stream;
        localVideo3.onloadedmetadata = function(event){startRecording();}
    }

    function handleRemoteStreamAdded (event){
        document.getElementById('web-cam4').style.display='block'
        console.log('Received audio stream from student.');
        console.log(event.stream);
        // Play stream to the <audio> element
        remoteStream1 = event.stream;
        localVideo2.srcObject = remoteStream1;
        studentMicOn = true;
        localVideo2.onloadedmetadata = function(event){
            socket.emit('broadcasting-student-stream', room);
        }
    }

    function handleRemoteStreamRemoved(event) {
      console.log('Remote stream removed. Event: ', event);
      document.getElementById('web-cam4').style.display='none'
    }

    
    function handleSourceOpen(event) {
        console.log('MediaSource opened');
        sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
        console.log('Source buffer: ', sourceBuffer);
    }

    function handleDataAvailable(event) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(event.data);
        reader.onloadend = function (event) {
            socket.emit('part-video',reader.result, id_course, name_video);
        };
    }

    function toggleRecording() {
        stopRecording();
    }
    
    // The nested try blocks will be simplified when Chrome 47 moves to Stable
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
           (videoConstraint) ? stream2 = localCanvas.captureStream() : stream2 = localVideo3.mozCaptureStream();
        }else{
           (videoConstraint) ? stream2 = localCanvas.captureStream() : stream2 = localVideo3.captureStream();
        }

        //se toma le flujo de video
        streamVideo2 = stream2.getVideoTracks()[0];
        
        //captura del flujo del audio
        if(adapter.browserDetails.browser === 'firefox'){
            stream3 = localVideo1.mozCaptureStream();
        }else{
            stream3 = localVideo1.captureStream();
        }
        // Se toma el flujo de audio
        streamTrack2 = stream3.getAudioTracks()[0];


        //mix entre los flujos de video y audio
        newStream2 = new MediaStream([streamVideo2, streamTrack2]);

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
        mediaRecorder.ondataavailable = handleDataAvailable;
       
        mediaRecorder.start(10); // collect 10ms of data
        console.log('MediaRecorder started', mediaRecorder);

        mediaRecorderFlag = true;

    }

    function stopRecording() {
        var resp = confirm("¿Desea detener la transmisión?");
        if(resp == true){
            console.log('Recorded Blobs: ', recordedBlobs);
            mediaRecorder.stop();
            localVideo1.controls = true;
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
    }
    
    socket.on('ipaddr', function(ipaddr) {
        console.log('Server IP address is: ' + ipaddr);
    });
    
    socket.on('created', function(room, clientId) {
        console.log('Created room', room, '- my client ID is', clientId);
    });

    socket.on('log', function(array) {
        console.log.apply(console, array);
    });

    socket.on('join', function(room, student, browserMoz) {
        console.log(student + ' made a request to join room ' + room);
        console.log('This peer is the initiator of room ' + room + '!');
        console.log(student, ' want to connect.');
        (browserMoz) ?peerConnectionConfig = {'iceServers': [{
            'urls': 'stun:stun.l.google.com:19302'
        }]}:peerConnectionConfig = {sdpSemantics: 'plan-b', 'iceServers': [{
            'urls': 'stun:stun.l.google.com:19302'
        }]};

        // Create peer connection for student
        var peerConnection = pcList[student] = new RTCPeerConnection(configuration3);

        // Be ready to send the candidate infomation to student
        // Candidate infomation will be available when an offer is created
        peerConnection.onicecandidate = function(event) {
            console.log('Sent ICE candidate information to ', student);
            if (event.candidate) {
                socket.emit('professor-sending-ice-candidate', {
                    studentName: student,
                    candidate: event.candidate
                });
            }
        };

        // Be ready to receive audio from student
        peerConnection.onaddstream = handleRemoteStreamAdded;
        //Be ready to remove stream from student
        peerConnection.onremovestream = handleRemoteStreamRemoved;
        //Capture stream from canvas (dashboard)
        var localStreamCanvas = localCanvas.captureStream();

        var streamVideo = localStreamVideo1.getVideoTracks()[0];
        var streamTrack = localStreamVideo1.getAudioTracks()[0];

        var newStream = new MediaStream([streamVideo, streamTrack]);
        // Add video stream from camera to the peer connection
        newStream.getTracks().forEach(track => peerConnection.addTrack(track, newStream));
        // Add video stream from screen or canvas (dashboard) to the peer connection
        if(!videoConstraint){
            localStreamVideo2.getTracks().forEach(track => peerConnection.addTrack(track, localStreamVideo2));
        }else{
            localStreamCanvas.getTracks().forEach(track => peerConnection.addTrack(track, localStreamCanvas));
        }

        if(studentMicOn){
            remoteStream1.getTracks().forEach(track => peerConnection.addTrack(track, remoteStream1));
        }
        console.log('An RTCPeerConnection with video stream is created for ', student);
        // Create an offer
        peerConnection.createOffer().then(function(sessionDescription) {
            // Set description as local description
            peerConnection.setLocalDescription(sessionDescription);
            console.log('setLocalDescription');
            console.log(sessionDescription);
            // Send sessionDescription to student
            socket.emit('professor-offer-a-session', {
                studentName: student,
                sessionDescription: sessionDescription,
                studentMicOn: studentMicOn
            });
            console.log('professor sent an offer to ', student);
        });
    });

    // Wait for student to answer the offer
    socket.on('student-answered', function(data) {
        console.log(data.studentName, ' accepted the offer.');
        // Set student's sessionDescription as remote description
        pcList[data.studentName].setRemoteDescription(data.sessionDescription);
        var IDstudent = data.my_id;
        if(id_session != data.studentID){
            //document.getElementById("mic"+IDstudent).setAttribute('src','/images/muted.png');
            document.getElementById("vid"+IDstudent).setAttribute('src','/images/videocam_off.png');
        }
        var valor = document.getElementById("vid"+IDstudent).getAttribute("name");
        var changeStaus = "status_tr" + valor;
        // agrego el valor de socket_id en la case del tr
        document.getElementById(changeStaus).setAttribute('class',data.studentID);
        var imageStatus = "img_status_tr" + valor;
        document.getElementById(imageStatus).src = '/images/circle.png';

    });

    // Receive ICE candidate info from student
    socket.on('student-sended-ice-candidate', function(data) {
        console.log('Received an ICE candidate from ', data.studentName);
        // Update ICE candidate info
        pcList[data.studentName].addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    // Imprimir mensaje en el chat
    socket.on('message-received', function(name, msg_chat) {
        if (name == socket.id) {
            $('#div_chat').append(msg_chat);
        } else {
            $('#div_chat').append(msg_chat.std_msg);
            $('#chat').effect('bounce');

        }
       $('#div_chat')[0].scrollTop = $('#div_chat')[0].scrollHeight - $('#div_chat')[0].clientHeight;
    });
    
    //El estudiante se ha retirado de la clase en vivo
    socket.on('student-left', function(socket_id){
        // Revisa si el estu retirado es el mismo de la llamada a estudiante
        if(id_session === socket_id){
            IsMicEnable = false;
            document.getElementById('web-cam4').style.display = 'none';
            socket.emit('stream-student-left',room);
        }else{
            IsMicEnable=IsMicEnable;
        }
        var id_td = document.getElementsByClassName(socket_id)[0].getAttribute("id");
        var imageStatus = "img_" + id_td;
        document.getElementById(imageStatus).src = '/images/circle2.png';
        id_td = id_td.split("status_tr");
        document.getElementsByName(id_td[1])[0].setAttribute("src","");
        document.getElementsByName(id_td[1])[1].setAttribute("src","");
    });

    //Imprimir mesaje levantar mano en el chat proveniente de un estudiante
    socket.on('handUp-std', function(text2send) {
        var hand = text2send.name + ' <img src="/images/hand.png"><br>'
        $('#div_chat').append(hand);
        M.toast({html:'Un estudiante ha levantado la mano', classes:'rounded'});
  
    });

    //stop event camara tutor
    $("#stop-video1").click(function(){
        localStreamVideo1.getVideoTracks()[0].enabled =
         !(localStreamVideo1.getVideoTracks()[0].enabled);

        if(!localStreamVideo1.getVideoTracks()[0].enabled){
            document.getElementById('stop-video1').style.background = "url(/images/videocam_off.png) center no-repeat";
        }else{
            document.getElementById('stop-video1').style.background = "url(/images/videocam.png) center no-repeat";
        }

    });

    //stop event camara compartir pantalla
    $("#stop-video2").click(function(){
        localStreamVideo2.getVideoTracks()[0].enabled =
         !(localStreamVideo2.getVideoTracks()[0].enabled);

        if(!localStreamVideo2.getVideoTracks()[0].enabled){
            document.getElementById('stop-video2').style.background = "url(/images/videocam_off.png) center no-repeat";
        }else{
            document.getElementById('stop-video2').style.background = "url(/images/videocam.png) center no-repeat";
        }

    });

    //stop event
    $("#stop-audio1").click(function(){
        localStreamVideo1.getAudioTracks()[0].enabled =
         !(localStreamVideo1.getAudioTracks()[0].enabled);

        if(!localStreamVideo1.getAudioTracks()[0].enabled){
            document.getElementById('stop-audio1').style.background = "url(/images/muted.png) center no-repeat";
        }else{
            document.getElementById('stop-audio1').style.background = "url(/images/microphone.png) center no-repeat";
        }

    });

    //Profesor habilita o desabilita microfono del estudiante
    $(".muted").click(function(e){
        e.preventDefault();
        var id_imageMic = $(this).attr("id");
        IDstudent2 = id_imageMic.slice(3); //id del estudiante
        var device_selected = id_imageMic.slice(0,3); // tipo de medi a tranmistir (camara o microfono)
        var id_student = "status_tr" + $(this).attr("name");
        id_session = document.getElementById(id_student).getAttribute('class');
        var icon_clicked = document.getElementById(id_imageMic);

        if(!IsMicEnable && device_selected == "mic"){
            socket.emit('professor-request-stream', id_session,device_selected);
            IsMicEnable = IDstudent2;
            IsDeviceEnable = device_selected;
            icon_clicked.setAttribute('src','/images/microphone.png');
        }else if(!IsMicEnable && device_selected == "vid"){
            socket.emit('professor-request-stream', id_session,device_selected);
            IsMicEnable = IDstudent2;
            IsDeviceEnable = device_selected;
            icon_clicked.setAttribute('src','/images/videocam.png');
            document.getElementById("mic"+IDstudent2).setAttribute('src','/images/microphone.png');

        }else if(IsMicEnable == IDstudent2 && device_selected=="vid" && IsDeviceEnable=="mic"){
            socket.emit('professor-request-stream', id_session,device_selected);
            IsDeviceEnable = device_selected;
            document.getElementById("mic"+IDstudent2).setAttribute('src','/images/microphone.png');
            icon_clicked.setAttribute('src','/images/videocam.png');
        }else if(IsMicEnable == IDstudent2 && device_selected=="mic" && IsDeviceEnable=="vid"){
            // video is already selected
        }else if(IsMicEnable == IDstudent2 && IsDeviceEnable == IsDeviceEnable){
            socket.emit('stop-student-stream', room, id_session);
            socket.emit('send-renegotiation',room);
            IsMicEnable =  false;
            IsDeviceEnable = false;
            document.getElementById('web-cam4').style.display = 'none'; //apaga video del estudiante
            document.getElementById("mic"+IDstudent2).setAttribute('src','/images/muted.png');
            document.getElementById("vid"+IDstudent2).setAttribute('src','/images/videocam_off.png');
            var tracktostop0 = remoteStream1.getTracks()[0];
            var tracktostop1 = remoteStream1.getTracks()[1];
            tracktostop0.stop();
            tracktostop1.stop();       
        }else{
           console.log("solo se permite un estudiante a la vez");  
           //alert("solo se permite un estudiante");
           M.toast({html:'solo se permite un estudiante', classes:'rounded'});
        }
    });

    //Envio de datos para mensajes en chat
    $('#input_text2').keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            text2send = {
                text: this.value,
                from: "master_prf",
                codigo: nameUser,
                email: codigoUser1
            }; // que tipo de usuario envia el mensaje estudiante o profe
            socket.emit('message1', room, text2send, socket.id)
            this.value = ""; //limpia el input
        }
    });

    //EXPOSITOR 
    /*var stundentFile, maxImgStudent, minImgStudent, currentSlice;
    socket.on('change-slide', function(nameFile){
        stundentFile = nameFile;
        var nameFile = document.getElementsByName(nameFile)[0].getAttribute("id");
        var numberFile = 'overlay' +nameFile.slice(3);
        maxImgStudent = document.getElementById(numberFile).getAttribute("value");
        minImgStudent = document.getElementById(numberFile).getAttribute("name");
        document.getElementById(numberFile).click();
    });
    socket.on('next-slide', function(){
        currentSlice =document.getElementById('current').getAttribute("value");
        if(minImgStudent != maxImgStudent && maxImgStudent && maxImgStudent != currentSlice){ document.getElementById("adelante").click();}
    });
    socket.on('previous-slide', function(){
        currentSlice =document.getElementById('current').getAttribute("value");
        if(minImgStudent != maxImgStudent && minImgStudent && minImgStudent != currentSlice){ document.getElementById("atras").click();}
    });*/



    /******************************************************
     ******      Funciones tablero interactivo       ******
     ******************************************************/

    var newPage;

    fabric.Object.prototype.transparentCorners = false;
    this.__canvases = [];
    var canvas = this.__canvas = new fabric.Canvas('c1', { stateful: true });
    var white = new fabric.Rect({
        top: 0,
        left: 0,
        width: 2000,
        height: 2000,
        fill: 'white'
    });

    white.selectable = false;
    canvas.add(white);
    var drawingLineWidthEl = document.getElementById('drawing-line-width'),
        drawingColorEl = document.getElementById('drawing-color'),
        drawing_mode_selector = document.getElementById('drawing-mode-selector');

    var startPoints = [
        {x: 0, y: 0},
        {x: 20, y: 0},
        {x: 20, y: 30},
        {x: 0, y: 30}
    ];

    var endPoints = [
        {x: 0, y: 0},
        {x: 20, y: 0},
        {x: 20, y: 50},
        {x: 0, y: 50}
    ];

    var clonedStartPoints = startPoints.map(function(o){
        return fabric.util.object.clone(o);
    });

    var polygon = new fabric.Polygon(clonedStartPoints, {
        left: 0,
        top: 0,
        fill: 'transparent',
        selectable: false,
        objectCaching: false,
    });
    
    canvas.add(polygon);

    function animatePoint(i, prop, endPoints) {
        fabric.util.animate({
          startValue: polygon.points[i][prop],
          endValue: endPoints[i][prop],
          duration: 1000,
          onChange: function(value) {
            polygon.points[i][prop] = value;
            // only render once
            if (i === startPoints.length - 1 && prop === 'y') {
              canvas.renderAll();
            }
          },
          onComplete: function() {
            polygon.setCoords();
            // only start animation once
            if (i === startPoints.length - 1 && prop === 'y') {
              even = !even;
              animate();
            }
          }
        });
    }

    function animate() {
        for (var i = 0, len = startPoints.length; i < len; i++) {
          animatePoint(i, 'x', even ? endPoints : startPoints);
          animatePoint(i, 'y', even ? endPoints : startPoints);
        }
    }

    var even = true;
    setTimeout(animate, 1000);

    
    //Retorna el objecto a al estado inicial cuando este se sale de los limites del canvas    
    /*canvas.on('object:modified', function(e) {
        var obj = e.target;
        let boundingRect = obj.getBoundingRect(true);
        if (boundingRect.top < 0 ||
            boundingRect.left + boundingRect.width > canvas.getWidth() ||
            boundingRect.top + boundingRect.height > canvas.getHeight()) {
            obj.angle = obj._stateProperties.angle;
            obj.scaleX = obj._stateProperties.scaleX;
            obj.scaleY = obj._stateProperties.scaleY;
            obj.setCoords();
            obj.saveState();
        }
    });*/

    //Desplegar imagenes en el canvas 
    $(".overlayCourse").click(function() {
        var min_pag = Number($(this).attr("name"));
        var max_pag = Number($(this).attr("value"));
        var page_current = "hiddendiv" + min_pag;
        var currentPage, newPage, group, numbergroup;
        var imageB64 = document.getElementById(page_current).getAttribute("src");
        displayPicture(imageB64)
        styleFaceFile(min_pag); 
        canvas.add(white);
        document.getElementById("current").setAttribute("value", min_pag);
        group = "Group_" + this.id; ///Group_overlay# me indicará enque grupo de imagenes está
        numbergroup = document.getElementById(group).getAttribute("value");
        document.getElementById("currentGrup").setAttribute("value", numbergroup); //se imprime en este input para saber el actual grupo
    });

    $(".atras").click(function() {
        currentPage = document.getElementById("current").getAttribute("value");
        newPage = Number(currentPage) - 1;
        updatepage(newPage);
    });

    $(".adelante").click(function() {
        currentPage = document.getElementById("current").getAttribute("value");
        newPage = Number(currentPage) + 1;
        updatepage(newPage)
    });

    //funcion para desplegar una nueva imagen
    function updatepage(newPage) {
        var max_pag = document.getElementById("adelante").getAttribute("name");
        max_pag = Number(max_pag);
        if (newPage >= 0 && newPage <= max_pag) {

            document.getElementById("current").setAttribute("value", newPage);
            var page_current = "hiddendiv" + newPage;
            var imageB64 = document.getElementById(page_current).getAttribute("src");
            displayPicture(imageB64);
            styleFaceFile(newPage); ///da estilo de bordes a la imagen que represneta el grupo de iamgenes
            canvas.add(white);
        }
    }

    //Crea un objeto tipo imagen y lo muestra en el canvas
    function displayPicture(imageB64) {
        var pugImg = new Image();
        pugImg.onload = function(img) {
            var width = pugImg.width;
            var height = pugImg.height;
            var anynumber, size, relationSize, newWidth;
            var flag_fit = document.getElementById("fitImage").getAttribute("name");
            if (flag_fit == "enable") {
                relationSize = canvas.height / pugImg.height;
                newWidth = pugImg.width * relationSize
                size = {
                    height: canvas.height,
                    width: newWidth
                }
            }
            var pug = new fabric.Image(pugImg, size);
            canvas.add(pug)
            canvas.add(polygon);
        };
        pugImg.src = imageB64;
        pugImg.setAttribute('crossOrigin', 'anonymous');
    }

    $("#fitImage").click(function() {
        var flag_fit = $(this).attr("name");
        if (flag_fit == "disable") {
            $(this).val("Desajustar Imagen");
            document.getElementById("fitImage").setAttribute("name", "enable");
        } else {
            $(this).val("Ajustar Imagen");
            document.getElementById("fitImage").setAttribute("name", "disable");
        }
        newPage = document.getElementById("current").value;
        updatepage(newPage);
    });

    //FUNCION PARA DAR UN EFECTO DE RESALTAR LA IMAGEN SELECCIOANDA
    function styleFaceFile(newPage) {
        var number = 0;
        var divgroup = "overlay" + number;
        var element = document.getElementById(divgroup);
        var sampleMax, sampleMin, samplenum, CurrenGroupp, BiggerDiv, Normaldiv, totalpage, CurrentgroupPage;
        while (element) {
            samplenum = Number(newPage);
            sampleMax = Number(document.getElementById(divgroup).getAttribute("value"));
            sampleMin = Number(document.getElementById(divgroup).getAttribute("name"));
            if (samplenum >= sampleMin && samplenum <= sampleMax) {
                CurrenGroupp = number;
                BiggerDiv = "div" + number;
                document.getElementById(BiggerDiv).style.border = "double #22a8b7";
                totalpage = sampleMax - sampleMin + 1;
                //totalpage = sampleMax - sampleMin;
                CurrentgroupPage = samplenum - sampleMin + 1;
                $("#number_page").html("").html(totalpage);
                $("#getNewPage").attr("value", CurrentgroupPage);
                $("#getNewPage").val(CurrentgroupPage);

            } else {
                Normaldiv = "div" + number;
                document.getElementById(Normaldiv).style.border = "";
            }
            number++
            divgroup = "overlay" + number;
            element = document.getElementById(divgroup);
        }
        canvas.clear();
    }

    $('#getNewPage').keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            var numbergroup = document.getElementById("currentGrup").getAttribute("value"); //numero del grupo
            var showpage = Number(this.value); //valor de la pagina deseada
            var idwanted = "overlay" + numbergroup
            var minpage = Number(document.getElementById(idwanted).getAttribute("name")); //pagina minima del grupo
            var maxpage = Number(document.getElementById(idwanted).getAttribute("value")); //pagina maxima del grupo
            newPage = minpage + showpage - 1;
            if (newPage >= minpage && newPage <= maxpage) {
                updatepage(newPage);
                document.getElementById("current").setAttribute("value", newPage);
            }
        }
    });
    
    //Botones para edicion de canvas
    var eraser_mode;
    $('#drawing-mode').click(function() {
        $(this).css("border-top-width", "5px").css("border-top-color", "#9b9b9b");
        $('#eraser-mode').css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $('#selecting-mode').css("border-top-width", "0px").css("border-color", "#e0e0e0");
        canvas.isDrawingMode = true;
        eraser_mode = false;
    });

    $('#selecting-mode').click(function() {
        $(this).css("border-top-width", "5px").css("border-top-color", "#9b9b9b");
        $("#drawing-mode").css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $('#eraser-mode').css("border-top-width", "0px").css("border-color", "#e0e0e0");

        canvas.isDrawingMode = false;
        eraser_mode = false;
    });

    //Borrar objectos del canvas
    $('#eraser-mode').click(function() {
        $(this).css("border-top-width", "5px").css("border-top-color", "#9b9b9b");
        $("#drawing-mode").css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $('#selecting-mode').css("border-top-width", "0px").css("border-color", "#e0e0e0");
        eraser_mode = true;
        canvas.isDrawingMode = false;
    });

    $('#textbox').click(function() {
        //Retorna un objeto tipo texto
        var textbox = new fabric.Textbox('texto', {
          left: 50,
          top: 50,
          width: 150,
          fontSize: 30,
          fill: '#D81B60'
        });
        canvas.add(textbox).setActiveObject(textbox);

        canvas.isDrawingMode = false;
        eraser_mode = false;
    });


    canvas.on('mouse:down', function(e) {
        if (eraser_mode) {
            canvas.remove(e.target);
        }
    });

    // Seleccionar el tipo de pincel
    drawing_mode_selector.onchange = function() {
        canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = drawingColorEl.value;
            canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
        }
    };

    // Seleccionar el tamaño del pincel
    drawingLineWidthEl.onchange = function() {
        canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
        this.previousSibling.innerHTML = this.value;
    };

    // Selecionar el color del pincel
    drawingColorEl.onchange = function() {
        canvas.freeDrawingBrush.color = this.value;
    };
    if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = drawingColorEl.value;
        canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
    }
});   