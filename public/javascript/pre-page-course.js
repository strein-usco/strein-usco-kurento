var numStudent, mychecked,num, id_Join;

$(document).ready(function() {
    
    window.onkeydown =  function(e){
        if(e.target.name == "class_name" && e.key =="Tab"){
            console.log("show date")
            $('.datepicker').datepicker('open');
        }else if(e.target.name == "date" && e.key =="Tab"){
            $('.timepicker').timepicker('open');
        }
    }

    /**************************************
     *              CLASES                *
     **************************************/

    //formulario para crear la clase
    $("#idForm").submit(function(e){
        var form = $(this),
             url = form.attr('action');
        e.preventDefault();
        $.ajax({
          type:"POST",
          url: url,
          data: form.serialize(),
          success: function(result){
            location.reload();   
          },
          error: function(error){
            console.log(error);
          }
        });
    });

    check_classes_today();

    //modal para crear clase y ver los videos de las clases
    window.addEventListener('click', function(event){
        if (event.target == document.getElementById('myModal4')) {
            $('#myModal4').css('visibility', 'hidden');
            document.getElementById("videoPlayer").pause();
        }else if (event.target == document.getElementById('myModal3')) {
            $('#myModal3').css('visibility', 'hidden');
            clean_modal3();
        }
    });

    document.getElementById("link").style.display = "none";
    $('#typeOfStream').on('change',function(e){
        (e.delegateTarget.value == 'share-screen')?document.getElementById("link").style.display = "block": document.getElementById("link").style.display = "none"
    });

    $("#create_class").click(()=>{
        $('#myModal3').css('visibility', 'visible');
        var instance = M.Datepicker.getInstance($('.datepicker'));
        instance.options.minDate = new Date(getFullDate()); 
    });

    var instance = M.Datepicker.getInstance($('.datepicker'));
    instance.options.minDate = new Date(getFullDate());

    var data, idiv, numreq, idvideo, valueID;
    var id_course = $("#IDcourse").attr("value");


    /**********FUNCION INGRESAR A LA CLASE EN VIVO************/

    $('#sidenav-left a').click(function(e) {
        e.preventDefault();
        var href = $(this).attr('href');
            $('#contenido').html(''); // Borra el contenido
        $('#contenido').load(href + '.html');
    });
    
    if (location.protocol != 'https:'){
     location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    }
    
    /**************************************
     *               ARCHIVOS             *
     **************************************/
    
    document.getElementById("test_3").onclick = setImage;

    var str = document.URL
    var room = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    if(room.split("#!")[1] == "file"){
        var el = document.getElementById("tabs");
        var instance = M.Tabs.getInstance(el);
        instance.select('test3');           
    }

    /**************************************
     *                TABS                *
     **************************************/
    document.getElementById("test_1").onclick = block_test_3;
    document.getElementById("test_2").onclick = block_test_3;

    function block_test_3(){
        document.getElementsByClassName("tab col s3")[0].setAttribute("class","tab col s3 disabled videoClase")
        document.getElementById("videoPlayer").pause();
    }

    /**************************************
     *              EXPOSITOR             *
     **************************************/

    //document.getElementById("test_2").onclick = checkExpositor;
    
});


    /**************************************
     *              CLASES                *
     **************************************/


//edita la informacíon de la clase
function edit_class(id_class){
   var id_class = id_class.slice(5);
   $('#class_name').val(document.getElementById('tr_1'+id_class).cells[0].innerText);
   $('#id_class').val(id_class);
   $('#datepicker').val(document.getElementById('tr_1'+id_class).cells[1].innerText);
   $('#datepicker').datepicker()
   $('#timepicker').val(document.getElementById('tr_1'+id_class).cells[2].innerText);
   $('#timepicker').timepicker()
   $('#typeOfStream').val(document.getElementById('tr_1'+id_class).cells[3].innerText);
   $('#typeOfStream').formSelect();
   disable_options(id_class);
   $('#myModal3').css('visibility', 'visible'); 
}

///función para desabilitar las opciones de editar clase
/// cuando la clase ya ha sido dictada, no se puede editar las fechas y el tipo

function disable_options(id_class){
    if(document.getElementById('tr_1'+id_class).cells[4].innerText != 'programada'){
        var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        var month_class = document.getElementById('tr_1'+id_class).cells[1].innerText.slice(0,3);
        var mon_num1 = months.indexOf(month_class);

        var date_today = getFullDate();
        var mon_num2 = date_today.slice(5,7);
        if(mon_num1 < Number(mon_num2)){
            console.log("no se pueden modificar las fechas");
           $('#datepicker').attr("disabled",true);
           $('#datepicker').datepicker();
           $('#timepicker').attr("disabled",true);
           $('#timepicker').timepicker();
           $('#typeOfStream').attr("disabled",true);
           $('#typeOfStream').formSelect();
        }
   }
}

function clean_modal3(){
    $('#class_name').val("");
    $('#id_class').val("");
    $('#datepicker').val("").attr("disabled",false);
    $('#datepicker').datepicker()
    $('#timepicker').val("").attr("disabled",false);
    $('#timepicker').timepicker()
    $('#typeOfStream').val("no-share-screen").attr("disabled",false);
    $('#typeOfStream').formSelect(); 
    $('#myModal3').css('visibility', 'hidden'); 
}

function getFullDate (){
    var d = new Date();
    var date = d.getDate();
    var month = d.getMonth()+1;
    var year = d.getFullYear();
    if(Number(date) < 10 ){
        date = "0" + date;
    }
    if(Number(month) < 10 ){
        month = "0" + month;
    }
    var fullDate = year + "," +  month + "," + date;
    return fullDate;
}

//Elimina una clase en específico
function deleteClass(id_class){
    var id_class = id_class.slice(5)
    var name_class = document.getElementById('tr_1'+id_class).cells[0].innerText;
    var r = confirm("¿Desea eliminar " + name_class + " ?");
    if (r == true) {
        data = {idvideo: id_class}
        $.ajax({ 
            type: "POST",
            url: "/control4/del_info_video",
            data: data,
            success: function(result) {
                document.getElementById("tr_1" + id_class).innerHTML = "";
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
}

//compara que clases se transmiten hoy
function check_classes_today(){
    var classes = document.getElementsByClassName("schedule");
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    dateToday = dateToday();
    dateTodayNumer = dateTodayNumer();
    num_month_today = months.indexOf(dateToday.slice(0,3));
    num_day_today = dateToday.slice(4,6);
    num_year_today = dateToday.slice(7,11);
    for( var i=0; i <classes.length; i++){
       if(classes[i].parentElement.cells[1].innerText == dateToday){
            $('.schedule')[i].innerText = "";
            var id_class = classes[i].parentElement.id.slice(4);
            var text = '<a title="Ingresar" href="/tutor-account/empezar-curso/' + id_class + '"><i class="material-icons green-text">skip_next</i><a>';
            $('.schedule')[i].innerHTML = text;
       }else{
            month = classes[i].parentElement.cells[1].innerText.slice(0,3);
            num_month = months.indexOf(month);
            num_day = classes[i].parentElement.cells[1].innerText.slice(4,6);
            num_year = classes[i].parentElement.cells[1].innerText.slice(7,11);
            if(num_month<num_month_today){
                $('.schedule')[i].innerText = "no transmitida";
            }else if( num_month == num_month_today && num_day < num_day_today){
                $('.schedule')[i].innerText = "no transmitida";
            }
       }
    }
}

//fecha de hoy en texto
function dateToday(){
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var d = new Date();
    var date = d.getDate();
    var month = d.getMonth();
    var year = d.getFullYear();
    if(Number(date) < 10 ){
        date = "0" + date;
    }
    var fullDate = months[month] + " " + date + ", " + year ;
    return fullDate;
}

//fecha de hoy en número
function dateTodayNumer(){
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var d = new Date();
    var date = d.getDate();
    var month = d.getMonth();
    var year = d.getFullYear();
    if(Number(date) < 10 ){
        date = "0" + date;
    }
    var fullDate = {month: month, date: date, year: year};
    return fullDate;
}

//para reproducir clases
function play_video(id_video){
    var videohtml =' <video class="responsive-video" id="videoPlayer" autoplay controls><source src="/control4/video/' + id_video + '" type="video/webm"></video>';
    $("#div_video").html("").append(videohtml);

}


/** 
 * Elimina un video específico de una clase.
 * @class delete_video_num
 * @param id_video_num {Object} id del video específico por borrar.
*/
function delete_video_num(id_video_num){
    var r = confirm("¿Está seguro de que desea eliminar el video part-" + document.getElementById(id_video_num).name.split("&&").pop());
    console.log(document.getElementById(id_video_num).name.split("&&")[0].slice(3))
    if (r == true) {
        $.ajax({ 
            type: "POST",
            url: "/control4/delete_video_num",
            data: {id_video_num: id_video_num},
            success: function(result) {
                document.getElementById('tr' + id_video_num).innerHTML = "";
            },
            error: function(error) {
                console.log(error);
            }
        });
    }    
}


function move_to_tap4(id_video){
    document.getElementsByClassName("tab col s3")[0].setAttribute("class","tab col s3 videoClase")
    var element4 = document.getElementById("tabs"), htmlText;
    var instance4 = M.Tabs.getInstance(element4);
    instance4.select('test4');
    $.ajax({ 
        type: "POST",
        url: "/control4/num_videos",
        data: {id_video: id_video},
        success: function(result) {
            //$("#tr_first_video").html("")
            /// ciclo for, en result está el numero de video correspondientes a la clase id_video
            var table_html = '<table class="table striped" data-sorting="true"> <thead> <tr> <th class="center">VIDEO CLASE</th><th></th><th></th></tr></thead>'
            for (var r = 0; r < result.length; r++) {
                //$("#table_video")[0].append('<tr><td><a style="color: black; cursor: pointer;">video part-'+r+'</a><br></td><td><a id="" onclick="delete_video(this.id)"><i class="material-icons redusco-text card-create-course">delete_forever</i></a></td></tr>');
                table_html = table_html + '<tr id="tr' + result[r]._id  + '"> <td class="center"><a style="color: black;">video part-' + result[r].video_num + '</a><br></td><td><a style="cursor:pointer" id="' + id_video + '&&' + result[r].video_num + '" onclick="play_video(this.id)" title="reproducir"><i class="material-icons redusco-text">play_circle_outline</i></a></td><td><a style="cursor:pointer" id="' + result[r]._id + '" name="del' + id_video + '&&' + result[r].video_num + '"  onclick="delete_video_num(this.id)" title="Borrar video"><i class="material-icons redusco-text">delete</i></a></td></tr>';
            }  
            table_html = table_html + '</table>';    
            $("#table_video").html("").append(table_html);
            play_video(id_video+"&&0");
        },
        error: function(error) {
            console.log(error);
        }
    });  
}

//para eliminar video_clase específica
function delete_video(id_video){
    var r = confirm("¿Está seguro de que desea eliminar el video?");
    if (r == true) {
        data = {idvideo: id_class}
        $.ajax({ 
            type: "POST",
            url: "/control4/del_info_video",
            data: data,
            success: function(result) {
                document.getElementById(id_video).innerHTML = "";
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
}

    /**************************************
     *              ARCHIVOS              *
     **************************************/

//despliega las imagenes de los archivos
function setImage(){
    document.getElementById("videoPlayer").pause();
    document.getElementsByClassName("tab col s3")[0].setAttribute("class","tab col s3 disabled videoClase")
    var id_course = document.getElementById("IDcourse").getAttribute("value");
    $.ajax({
        type: "POST",
        url: "/control5/getFileTutor",
        dataType: "json",
        data: { id_course: id_course },
        success: function(result) {
            for (var r = 0; r < result.all_files.length; r++) {
                idiv = "imadiv" + r;
                idiv2 = "imadiv_" + r;
                // se le agrega en src la info en base64 del archivo
                document.getElementById(idiv).setAttribute("src", "data:application/octet-stream;base64," + result.all_files[r]);
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
}

// descarga archivos
function download_file (id_file){
    var id_course = document.getElementById("id_course").getAttribute("value")
    var name_file = document.getElementById(id_file).getAttribute("name");
    var r = confirm("¿Desea descargar " + name_file + " ?");
    if (r == true) {
        var base64;
        var myId = "ima" + id_file;
        var element = document.createElement('a');
        if(name_file.split(".").pop() == "pdf"){
            $.ajax({
                type: "POST",
                url: "/control5/getPDF",
                data: { id_course: id_course, name_file: name_file },
                success: function(result) {
                    base64 = "data:application/pdf;base64," + result.all_filesPDF;
                    element.download= name_file;
                    element.href = base64;
                    element.click();    
                },
                error: function(err){
                    console.log(err);
                }
            });
        }else{
            base64 = document.getElementById(myId).getAttribute("src");
            element.setAttribute("download", name_file);
            element.href = base64;
            element.click();
        }
    }
}

//elimina archivos
function delete_file(id_file){
    var name_file = document.getElementById(id_file).getAttribute('name');
    var r = confirm("¿Desea eliminar " + name_file + " ?");
    if (r == true) {
        data = { name_file: name_file };
        $.ajax({
            type: "POST",
            url: "/control5/delete_file",
            data: data,
            success: function(result) {
                document.getElementById("Img-" + id_file).innerHTML = "";
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
}


    /**************************************
     *              EXPOSITOR             *
     **************************************/
 
 //Permite escoger un estudainte como expositor
/*function selectAsExpo(id_join){
    var id_course = document.getElementById("IDcourse").getAttribute("value");
    id_Join = id_join.slice(5);
    var len = document.getElementsByClassName("checkbox_1");
    var thisBox = document.getElementById(id_join);
    var value = thisBox.checked;

    for (var i = 0;i < len.length; i++) {
        var nameCheck= document.getElementsByClassName("checkbox_1")[i].checked = false;
    }

    if ( value == true) {
        thisBox.checked = true;
    }
    var data = {
        id_join: id_Join,
        id_cou: id_course
    }
    $.ajax({ 
        type: "POST",
        url: "/control/expo_student",
        data: data,
        success: function(result) {
            //Éxito
        },
        error: function(error) {
            console.log(error);
        }
    });
}

//función para chequear si hay un estudiantes como expositor
function checkExpositor (){
    var id_course = document.getElementById("IDcourse").getAttribute("value");
    $.ajax({
        type: "POST",
        url: "/control/getExpo",
        data: {id_course: id_course},
        success: function(result) {
            if(result != 'negative'){
                document.getElementById("check" + result).checked = true;
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
}*/