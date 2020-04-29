$(document).ready(function() {

    window.addEventListener('click', function(event){
      	if (event.target == document.getElementById('myModal2')) {
        	$('#myModal2').css('visibility', 'hidden'); 
    	}
    });

  $("#idForm").submit(function(e){
    var form = $(this),
         url = form.attr('action');
         console.log(form.serialize());

    e.preventDefault();
    $.ajax({
      type:"POST",
      url: url,
      data: form.serialize(),
      success: function(result){
        console.log(result);
        if(result.answer == 'exist'){
          $("#err_email").html("<a id='err_pas' style='color:red'>El correo ya tiene una cuenta</a>");
        }else if(result.answer == 'no_inst'){
          $("#err_email").html("<a id='err_pas' style='color:red'>El correo debe ser institucional</a>");
        }
        else{
          alert("Registro exitoso, por favor revise su correo");
          location.reload();
        }
      },
      error: function(error){
        console.log(error);
      }
    });
  });
});

function edit_user(id_user){
    $.ajax({
        type: "POST",
        url: "/control/persona/info",
        data: {id_user: id_user.slice(4)},
        success: function(result) {
          var courses, tipo;
          document.getElementById('_id22').setAttribute("value",result.person._id)
          $("#_id2").attr("value",result.person._id);
          $("#nombres2").attr("value",result.person.nombres);
          $("#cedula2").attr("value",result.person.cedula);
          $("#correo2").attr("value",result.person.correo);
          $("#select_tipo2").val(result.person.tipo);
          $("#select_tipo2").formSelect();
          $("#select_estado2").val(result.person.estado);
          $("#select_estado2").formSelect();
			    $("#myModal2").css("visibility","hidden");
          (document.getElementsByClassName("editar3").length != 0)?document.getElementsByClassName("editar3")[0].setAttribute("class","tab col s3"):
          (result.courses.length == 0)? courses = false:courses = result.courses;
          tipo = result.person.tipo
			    move_to_tap3(courses, result.htmlText);       
        },
        error: function(err){
        }
    });
}

function move_to_tap3(courses, htmlText){
    var element2 = document.getElementById("tabs"), htmlText;
    var instance2 = M.Tabs.getInstance(element2);
    //edit_mode3 = true;
    instance2.select('test3');

  //if(courses){
    $("#courses_info").html(htmlText);
    //}

  
}

function delete_course(id_course){
  var id_course = id_course.slice(4);
  id_user = document.getElementById("_id2").value;
  var r = confirm("¿Desea desvincular a " + document.getElementById("nombres2").defaultValue + " de " + document.getElementById("name5"+id_course).innerText + " ?");
  if (r == true) {       
      $.ajax({
          type: "POST",
          url: "/control/unlink_user",
          data: {id_course: id_course,
                 id_user: id_user},
          success: function(course) {
             document.getElementById("tr5_" + id_course).innerHTML="";
          },
          error: function(err){
              console.log(err);
          }
      });
  } 
}

function delete_user(id_user){
  var id_user = id_user.slice(5);
  var r = confirm("¿Desea eliminar al usuario " + document.getElementById("nam1_"+id_user).innerText + " de la base de Datos?");
  if (r == true) {       
      $.ajax({
          type: "POST",
          url: "/control/persona/delete_user",
          data: {id_user: id_user},
          success: function(course) {
             document.getElementById("tr1_" + id_user).innerHTML="";
          },
          error: function(err){
              console.log(err);
          }
      });
  }
}
