$('document').ready(function() {

    /**************************************
     *              CLASES                *
     **************************************/

    window.addEventListener('click', function(event){
        if (event.target == document.getElementById('myModal4')) {
            $('#myModal4').css('visibility', 'hidden');
            document.getElementById("videoPlayer").pause();
        }//else if (event.target == document.getElementById('myModal3')) {
           // $('#myModal3').css('visibility', 'hidden');
            //clean_modal3();
        //}
    });

    check_classes_today()

    /*var instance = M.Datepicker.getInstance($('.datepicker'));
    instance.options.minDate = new Date(getFullDate());*/

    // Funciones relacionadas a VIDEO 
    $(".playvideo").click(function(){
      var idvideo = this.id;
      var videohtml =' <video width="100%" height="80%" id="videoPlayer" autoplay controls><source src="/video/' + idvideo + '" type="video/webm"></video>';
      $("#video_conatiner").html("").html(videohtml);
    });

    if (location.protocol != 'https:'){
     location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    }

    /**************************************
     *              ARCHIVOS              *
     **************************************/

    document.getElementById("test_2").onclick = setImage;

    /**************************************
    *                TABS                *
    **************************************/
    document.getElementById("test_1").onclick = block_test_3;

    function block_test_3(){
        document.getElementsByClassName("tab col s3")[0].setAttribute("class","tab col s3 disabled videoClase")
        document.getElementById("videoPlayer").pause();
    }



    /**************************************
     *              EXPOSITOR             *
     **************************************/

    /*

    $("#create_class").click(()=>{
        $('#myModal3').css('visibility', 'visible');
        var instance = M.Datepicker.getInstance($('.datepicker'));
        instance.options.minDate = new Date(getFullDate()); 
    });

    document.getElementById("link1").style.display = "none";
    $('#typeOfStream').on('change',function(e){
        (e.delegateTarget.value == 'share-screen')?document.getElementById("link1").style.display = "block": document.getElementById("link1").style.display = "none"
    });*/
    
});


    /**************************************
     *               ARCHIVOS             *
     **************************************/

//FUNCIÓN PARA DESCARGAR ARCHIVOS
function download_file (id_file){
    var id_course = document.getElementById("id_CourStudent").getAttribute("value")
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

//despliega las imagenes de los archivos
function setImage(){
    document.getElementById("videoPlayer").pause();
    document.getElementsByClassName("tab col s3")[0].setAttribute("class","tab col s3 disabled videoClase")
    var id_course = document.getElementById("id_CourStudent").getAttribute("value")
    $.ajax({
        type: "POST",
        url: "/control5/get_files",
        dataType: "json",
        data: { id_course: id_course },
        success: function(result) {
            for (var r = 0; r < result.all_files.length; r++) {
                idiv = "imadiv" + r;
                // se le agrega en src la info en base64 del archivo
                document.getElementById(idiv).setAttribute("src", "data:application/octet-stream;base64," + result.all_files[r]);
            }
        },
        error: function(error) {
            console.log(error);
        }
    });
}

    /**************************************
     *              CLASES                *
     **************************************/

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
            var id_course = document.getElementById("id_CourStudent").getAttribute("value");
            var text = '<a href="/student-account/empezar-curso/' + id_course + '&&' + id_class + '"><i class="material-icons green-text">skip_next</i><a>';
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

// Función para reproducir el video de una clase
function play_video(id_video){
    var videohtml =' <video class="responsive-video" id="videoPlayer" autoplay controls><source src="/control4/video/' + id_video + '" type="video/webm"></video>';
    $("#div_video").html("").append(videohtml);

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
            var table_html = '<table class="table striped" data-sorting="true"> <thead> <tr> <th class="center">VIDEO CLASE</th><th></tr></thead>'
            for (var r = 0; r < result.length; r++) {
                table_html = table_html + '<tr> <td class="center"><a style="color: black;">video part-' + result[r].video_num + '</a><br></td><td><a style="cursor:pointer" id="' + id_video + '&&' + result[r].video_num  + '" onclick="play_video(this.id)" title="reproducir"><i class="material-icons redusco-text">play_circle_outline</i></a></td></tr>';
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

    /**************************************
     *              EXPOSITOR             *
     **************************************/

// función para eliminar un archivo propio
/*function delete_file(id_file){
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

//pregunta si el estudiante puede subir un archivo
function requestUploadFile(){
    var id_course = document.getElementById("id_CourStudent").getAttribute("value")
    $.ajax({
        type: "POST",
        url: "/control5/requestUploadFile",
        dataType: "json",
        data: { id_course: id_course },
        success: function(result) {
            location.replace("/tutor-account/cargar-archivo/"+id_course);
        },
        error: function(error) {
            alert("No está autorizado para cargar archivos");
        }
    });
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
*/