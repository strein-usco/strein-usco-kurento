//relacionado con page-tutor.html

/*
 *
 *  Las funciones selectNone() y selectAll() fueron tomadas 
 *  de la respuesta del usuario Daniel Ruf en el siguiente link:
 *  
 *  https://stackoverflow.com/questions/44001532/select-all-option-in-materialize-multi-select
 *
 *
 */

$(document).ready(function() { 

    /**************************************
     *             TAB - CORREO           *
     **************************************/

    // visualizar correos enviados y recibidos
    var modal = document.getElementById('myModal');

    $(".view_mail").click(function(event){      
        var id_message = document.getElementsByClassName($(this).attr("value"))[0].id       
        $.ajax({
            type: "POST",
            url: "/control3/getSpecificMail",
            data: {id_message: id_message},
            success: function(result) {
                console.log(result)
                $("#modal-content1").html("").html(result.contentHTML);
                $("#myModal1").css("visibility","visible");
                document.getElementById(id_message).setAttribute("style","background-color:transparent;")
            },
            error: function(error) {
                console.log(error);
            }
        });
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
     if (event.target == document.getElementById('myModal1')) {
        $('#myModal1').css('visibility', 'hidden');
      }
    }
    
    //seleccionar todos los correos recibidos y enviados respectivamente
    //para ser eliminados

    document.getElementById('delete_tr1').style.display = "none";
    document.getElementById('delete_tr2').style.display = "none";
    

    //eliminar un correo específico   
    $(".del_mail").click(function(event){
        var id_message = document.getElementsByClassName($(this).attr("value"))[0].id;  
        var r = confirm("¿Desea eliminar este mensaje ?");
        if (r == true) {
            $.ajax({
                type: "POST",
                url: "/control3/deleteMessage",
                data: {id_message: id_message},
                success: function(result) {
                    $('#myModal1').css('visibility', 'hidden'); 
                    document.getElementById(id_message).innerHTML= "";
                },
                error: function(error) {
                    console.log(error);
                }
            });
        }    
    });
 
    //enviar correo
    $("#send-email").click(function(e){
        e.preventDefault();
        var stringStudents = [];
        var id_course = $("#select1")[0].value;
        var eachStudent = $('#select2').val();
        if(id_course == ""){
            alert("Seleccione un curso");
            return false;
        }
        if(eachStudent == ""){
            alert("Seleccione un estudiante");
            return false;
        }
        var subject = $("#subject_mail")[0].value;
        if(subject == ""){
            var r = confirm("¿Desea enviar el mensaje sin asunto?");
            if (r == false) {  
                return false;
            }
        }
        var textarea1 = $("#textarea1")[0].value;
        if(textarea1 == ""){
            alert("Escriba un mensaje en el cuerpo del correo");
            return false;
        }
        for (var i = 0;i < eachStudent.length; i++) {
            stringStudents.push({student : eachStudent[i]});
        }
        stringStudents = JSON.stringify(stringStudents);

        var alldata = {
            eachStudent_by_name: stringStudents,
            subject: subject,
            textarea1:textarea1,
            id_course: id_course
        }
        $.ajax({
            type: "POST",
            url: "/control3/tutor_email",
            data: alldata,
            success: function(result) {
                window.location.href = "/tutor-account##email";
                location.reload();
            },
            error: function(error) {
                console.log(error);
            }
        });
    });

    var str = document.URL
    var roomlong = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    if(roomlong != "course-accounts"){
        var partUrl = roomlong.split("##");
        if(partUrl[1] == "email"){
            move_to_tap2(partUrl)   
        }     
    }

    // para mostrar los estudiantes del curso seleccionado
    $("#select1").on('change',function(event){
        document.getElementById("all_people").removeAttribute("disabled");
        document.getElementById("all_people").checked = false;
        document.getElementById("all_people").setAttribute('value','none');
        var id_course = event.delegateTarget.value;
        $.ajax({
            type: "POST",
            url: "/getStudents",
            data: {id_course: id_course},
            success: function(result) {
                $("#box_students").html("").append(result);
                $('#select2').formSelect();
            },
            error: function(error) {
                console.log(error);
            }
        });
    });

    //seleccionar y deseleccionar todos los estudiantes
    $("#all_people").click(function(){
        (document.getElementById('all_people').getAttribute('value')== "none")? selectAll() : selectNone();
    });

});


    /**************************************
     *             TAB - CORREO           *
     **************************************/

//función para visualizar el tab-2 (correo)
function move_to_tap2(partUrl){
    var el = document.getElementById("tabs");
    var instance = M.Tabs.getInstance(el);
    instance.select('test2');
}

//función para deseleccionar todos los estudiantes 
function selectNone() {
    document.getElementById('all_people').setAttribute('value','none');
    $('select2 option:selected').not(':disabled').prop('selected', false);
    $('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:checked').not(':disabled').prop('checked', '');
    var values = $('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:disabled').parent().text();
    $('input.select-dropdown').val(values);
    console.log($('select').val());
    $('#select1').formSelect();
};

//función para seleccionar todos los estudiantes 
function selectAll() {
    document.getElementById('all_people').setAttribute('value','all');
    $('#select2 option:not(:disabled)').not(':selected').prop('selected', true);
    $('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:not(:checked)').not(':disabled').prop('checked', 'checked');
    //$('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:not(:checked)').not(':disabled').trigger('click');
    var values = $('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:checked').not(':disabled').parent().map(function() {
        return $(this).text();
    }).get();
    $('input.select-dropdown').val(values.join(', '));
    $('#select1').formSelect();
};

//función para eliminar mensaje visualizado 
function delete_message(id_message){
    var r = confirm("¿Desea eliminar este mensaje ?");
    var id_message = id_message.slice(3);
    if (r == true) {
        ajax_del_msg(id_message);
    }  
}

//selecciona todos los correos recibidos -1/enviados - 2
function click_check(element_id){
    var num = element_id.slice(7);
    var value = document.getElementById("all_msg" + num).getAttribute('value'), val,val2;
    if(value == 'none'){
        document.getElementById("all_msg" + num).setAttribute('value','all')
        $('#all_msg2').attr('value','all');
        val = true;
        val2 = "one-" + num;
        document.getElementById('delete_tr' + num).style.display = "block";
    }else{
        document.getElementById("all_msg" + num).setAttribute('value','none')
        val = false;
        val2 = "zero" + num;
        document.getElementById('delete_tr' + num).style.display = "none";
    }
    var checkbox = document.getElementsByClassName("filled-in all_msg1" + num);
    for (var i=0; i<checkbox.length; i++) {
        checkbox[i].checked = val;
        checkbox[i].setAttribute("name",val2);
    }
    if(checkbox.length ==0 && value == 'none'){
        document.getElementById('delete_tr' + num).style.display = "none";
    }
}

//función para eliminar mensaje seleccionados
function delete_tr(element_id){
    rst = confirm("Desea eliminar los correos seleccionados");
    var num = element_id.slice(9)
    if(rst == true){
        document.getElementById('delete_tr' + num).style.display = "none";
        var all_msg = document.getElementsByName('one-' + num);
        for (var i = all_msg.length - 1; i >= 0; i--) {
            id_message = all_msg[i].id.slice(4);
            ajax_del_msg(id_message);
        }
    }
}

function ajax_del_msg(id_message){
    document.getElementById(id_message).innerHTML= "";
    $.ajax({
        type: "POST",
        url: "/control3/deleteMessage",
        data: {id_message: id_message},
        success: function(result) {
            $('#myModal1').css('visibility', 'hidden');
        },
        error: function(error) {
            console.log(error);
        }
    });

}

//función para seleccionar un mensaje
function check_tr(element_id){
    var element = document.getElementById(element_id);
    var value = element.name.slice(4);
    (element.name ==  "zero" + value)?element.setAttribute("name","one-" + value):element.setAttribute("name","zero" + value);
    (document.getElementsByName('one-' + value).length != 0)?document.getElementById('delete_tr' + value).style.display = "block":document.getElementById('delete_tr' + value).style.display = "none";
}