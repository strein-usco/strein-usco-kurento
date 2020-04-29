$(document).ready(function(){

  $("#idForm").submit(function(e){
    var form = $(this),
    url = form.attr('action');

    e.preventDefault();

    $.ajax({
      type:"POST",
      url: url,
      data: form.serialize(),
      success: function(result){
         window.location.href= "/tutor-account";
      },
      error: function(error){
        console.log(error);
      }
    });
  });

});
