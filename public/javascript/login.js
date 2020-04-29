//relacionado con login.html 
$(document).ready(function() {
        
//función submit para loguear usuarios 
    $("#ingresar").click(function(e) {
      e.preventDefault();
        var session = {
            email: $("#correo").val(),
            password: $("#contra").val()
        };

        $.ajax({
            type: "POST",
            url: "/log_in",
            data: session,
            success: function(result) {
                console.log(result);
                if (result.token) {
                    window.localStorage.setItem('token', result.token);
                    window.location.href = "/logueo";
                } else if(result.err == "inactive"){
                    $("#error").html("<span style='color:#eee'>Error:</span> El correo no se ha validado </br> por favor validelo para poder ingresar");

                } else {
                    $("#error").html("<span style='color:#eee'>Error:</span> Correo y contraseña invalidas. ");
                    $("#contra").val("");
                }
            },
            error: function(error) {
                console.log("contraseña mal ingresada");
                $("#error").html("<span style='color:#eee'>Error:</span> No existe una cuenta con ese correo");
            }
        });
    });

});