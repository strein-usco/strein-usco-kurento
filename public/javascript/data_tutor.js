$(document).ready(function() {

/*********************************************
***	    	CAMBIO DE DATOS		         ****
**********************************************/
	$(".td-table").prop("disabled", true);
	$("#editar").click(function() {
    	//$(this).css("  background: #ce2323; color: #fff; border: 2px solid #ce2323; ")
    	var val = $(this).val();
    	if (val== "EDITAR"){
	    	$(this).val("GUARDAR").html("").html("GUARDAR");
	    	$(".td-table").prop("disabled", false);
    	}else{
			var tabla = $("#table");
			$.ajax({
				type: "POST",
				url: "/control/persona/editar",
				data: tabla.serialize(),
				success: function(result){
					console.log("success");
					$(".td-table").prop("disabled", true);
					$("#title-bold").html("").html($("#nombres").val());
					$("#editar").val("EDITAR").html("").html("EDITAR");
					alert("CAMBIO EXITOSO");
				},
				error: function(error){
					console.log("error");
				}
			});
    	}
    });

/*********************************************
***	    	CAMBIO DE CONTRASEÑA          ****
**********************************************/
	$('#contra2').on('keyup', function () {
      if ($('#contra').val() == $('#contra2').val()) {
        $('#err_pas2').html("<a id='err_pas'></a>")
      } else 
        $('#err_pas2').html("<a id='err_pas' style='color:red'> Las contraseñas no coinciden</a>");
    });
    $("#table2").submit(function(e){
    	var tabla = $(this);
    	e.preventDefault();
    	if ($('#contra').val() == $('#contra2').val()) {
    		$.ajax({
			type: "POST",
			url: "/control/persona/contra",
			data: tabla.serialize(),
			success: function(result){
				if(result.err){
					$('#err_pas').html("<a id='err_pas' style='color:red'> Las contraseñas no coinciden</a>");
					$('#contra2').val("");
					$('#contra_act').val("");
					$('#contra').val("");
				}else{
					alert("CAMBIO DE CONTRASEÑA EXITOSO");
					$('#contra2').val("");
					$('#contra_act').val("");
					$('#contra').val("");
				}	
			},
			error: function(error){
				console.log("error");
			}
		});
    	}
    });

/*********************************************
***	      	CAMBIO DE CORREO              ****
**********************************************/
	$('#correo2').on('keyup', function () {
      if ($('#correo1').val() == $('#correo2').val()) {
        $('#err_pas3').html("<a id='err_pas'></a>")
      } else 
        $('#err_pas3').html("<a id='err_pas' style='color:red'> Los correos no coinciden</a>");
    });
    $("#table3").submit(function(e){
    	var tabla = $(this);
    	e.preventDefault();
    	if ($('#correo1').val() == $('#correo2').val()) {
    		$.ajax({
			type: "POST",
			url: "/control/persona/editmail",
			data: tabla.serialize(),
			success: function(result){
				if(result.err){
					$('#err_pas3').html("<a id='err_pas' style='color:red'> Los correos no coinciden</a>");
				}else{
					alert("CAMBIO DE CORREO EXITOSO");
				}	
				$('#correo2').val("");
				$('#correo1').val("");
			},
			error: function(error){
				console.log("error");
			}
		});
    	}
    });


});