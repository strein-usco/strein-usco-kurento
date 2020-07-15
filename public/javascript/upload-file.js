/*
 * El cogido para envio de de archivos 
 * desde el clietne al servidor fue 
 * obtenido por un projecto desarrollado
 * por el Ingeniero Jhon Ibarra.
 */
window.onload = function() {
    var target,
        theF;
    //************************************************************
    //*********    Pre-visualizar Imagen
    //************************************************************
    document.getElementById('upload_input').addEventListener('change', handleFileSelect, false);


    function handleFileSelect(evt) {
        event.preventDefault();
        var files = evt.target.files;
        for (var i = 0, f; f = files[i]; i++) {
            if (!f.type.match('image.*') && !f.type.match('application/pdf')) {
                alert("Este tipo de archivo no se puede cargar, solo imagenes y pdf"); //mandar aviso que el archivo no se puede cargar
                continue;
            }
            reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    // Render thumbnail.
                    target = e.target.result;
                    var span = document.createElement('span');
                    nombreArchivo = e.target.result;
                    theF = theFile;
                    span.innerHTML = ['<img id="imagenNueva" src="', e.target.result, '" title="', escape(theFile.name), '" width="100px" height="100px"/>'].join('');
                    document.getElementById('imagenO').insertBefore(span, null);
                };
            })(f);
            current_file = reader.readAsDataURL(f);
            $('#imagenNueva').remove();
        }
    }

    //************************************************************
    //*********    Envio de Archivo al servidor
    //************************************************************

    $("#btnAgregar").click(function() {
        if(theF.size >= 6000000){
            alert('El archivo tiene que ser inferior a 6MB, por favor comprimalo antes de subirlo')
        }else{
            test();
        }
    });

    function test() {
        var id_course = $('#idCourse2').val()
        var fileElement = {
            id_course: id_course,
            from_course_name: $('#idCourse1').val(),
            state: $('#carlist').val(),
            name: theF.name,
            type: theF.type,
            contents: target
        };
        $('#loading').css('visibility', 'visible');;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/control5/save_file', true);
        xhr.onreadystatechange = function() {
            console.log("onreadystate: " + xhr.readyState + " status: " + xhr.status);
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    window.location.href = "/tutor-account/info-curso/" + id_course + "#!file";
                }
            }
        };
        xhr.send(JSON.stringify(fileElement));
    }

};