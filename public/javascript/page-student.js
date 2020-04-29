//relaciondo con page-student.html

$('document').ready(function() { 

    /**************************************
     *             TAB - CORREO           *
     **************************************/

    // visualizar correos enviados y recibidos
   
    var modal = document.getElementById('myModal1');

    $(".view_mail").click(function(event){   
        var id_message = document.getElementsByClassName($(this).attr("value"))[0].id;      
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
      if (event.target == modal) {
        $('#myModal1').css('visibility', 'hidden');
      }
    }

    //seleccionar todos los correos recibidos y enviados respectivamente
    //para ser eliminados
    document.getElementById('delete_tr1').style.display = "none";
    document.getElementById('delete_tr2').style.display = "none";

    //eliminar un correo específico   
    $(".del_mail").click(function(event){
        event.preventDefault();
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


    $("#selection").on('change',function(event){
        var name_tutor = event.delegateTarget.lastElementChild.className;
        $("#name_tutor").attr("placeholder", name_tutor)
    })

    var str = document.URL
    var room = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    if(room.split("##")[1] == "email"){
        var el = document.getElementById("tabs");
        var instance = M.Tabs.getInstance(el);
        instance.select('test2');           
    }   
});

    
    /**************************************
     *             TAB - CORREO           *
     **************************************/

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
    //document.getElementById("all_msg"+value).checked = false;
    (element.name ==  "zero" + value)?element.setAttribute("name","one-" + value):element.setAttribute("name","zero" + value);
    (document.getElementsByName('one-' + value).length != 0)?document.getElementById('delete_tr' + value).style.display = "block":document.getElementById('delete_tr' + value).style.display = "none";
}