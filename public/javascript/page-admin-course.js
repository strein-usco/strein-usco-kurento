$(document).ready(function() {
    var elements = document.getElementsByClassName("check");
    document.getElementById("add_more_students").onclick = add_more_students;
    document.getElementById("add_one_tutor").onclick = add_one_tutor;
    document.getElementById("select-all").onclick = select_all;
    document.getElementById("test_2").onclick = moved_tap2;
    document.getElementById("test_4").onclick = moved_tap4;
    var students=[], tutor=[], students2=[];

    window.addEventListener('click', function(event){
      if (event.target == document.getElementById('myModal2')) {
        $('#myModal2').css('visibility', 'hidden'); 
      }else if (event.target == document.getElementById('myModal3')) {
        $('#myModal3').css('visibility', 'hidden');
      }
    });

    // estilos y funciones de footable
    $('.table1').footable({
        "columns": 8,
        "rows": document.getElementsByClassName('delete-course').length
    });
    $('.table2').footable({
        "columns": 2,
        "rows": document.getElementsByClassName('edit-course').length
    });
    $('.table3').footable({
        "columns": 5,
        "rows": document.getElementsByClassName('delete-course').length
    });
    $('.table4').footable();

    //permite seleccionar todos los estudiantes
    function select_all(){
        (document.getElementById("select-all").getAttribute("value") == "none")? selectAll() : selectNone(); 
    }
    //des-selecciona todos los estudiantes
    function selectNone() {
        $('#select-all').attr('value','none')
        for(var i=0; i<elements.length; i++) {
            elements[i].checked = false;
        }
    };

    function selectAll() {
        $('#select-all').attr('value','all');
        for(var i=0; i<elements.length; i++) {
            elements[i].checked = true;
        }
    };
    // Submit para asignar tutor y estudiantes a un curso
    $("#update_course").submit(function(event){
        event.preventDefault();
        var id = document.getElementById('_id2').value;
        var code_course = document.getElementById('code_course2').value;
        var name_course = document.getElementById('name_course2').value;
        var id_tutor = document.getElementById("id_tutor").value;
        var array_stundets = JSON.stringify(checked_students());
        var type = document.getElementById('type_course').value;

        var data = {
            id: id,
            code_course: code_course,
            name_course: name_course,
            id_tutor: id_tutor,
            type: type,
            students :array_stundets,
            unjoined: ""
        }
        $.ajax({
            type: "POST",
            url: "/control/update_course",
            data: data,
            success: function(result) {
                location.reload();
            },
            error: function(err){
            }
        });
    });


    // Submit para asignar tutor y estudiantes a un curso
    $("#update_course4").submit(function(event){
        event.preventDefault();   

        var el = document.getElementById("mySelect4");
        var instance = M.FormSelect.getInstance(el);
        var type = $("#mySelect4")[0].value;
        $('#mySelect4').formSelect();
        var id = document.getElementById('_id4').value;
        var code_course = document.getElementById('code_course4').value;
        var name_course = document.getElementById('name_course4').value;
        var id_tutor = checked_tutor4();
        var array_stundets = JSON.stringify(checked_students4());
        var array_stundets2 = JSON.stringify(unchecked_students4());
        var data = {
            id: id,
            code_course: code_course,
            name_course: name_course,
            id_tutor: id_tutor,
            type: type,
            students :array_stundets,
            unjoined:array_stundets2  
        }
        $.ajax({
            type: "POST",
            url: "/control/update_course",
            data: data,
            success: function(result) {
                location.reload();
            },
            error: function(err){
            }
        });
    });
        // trae los valores de los estudiantes seleccionados
    function checked_students4(){
        var elem_students = document.getElementsByClassName("check_6");
        for(var i=0; i<elem_students.length; i++) {
            if(elem_students[i].checked == true){
                students.push(elem_students[i].id.slice(6));
            }
        }
        return students
    }
    function unchecked_students4(){
        var elem_students2 = document.getElementsByClassName("check6");
        for(var i=0; i<elem_students2.length; i++) {
            if(elem_students2[i].checked == false){
                students2.push(elem_students2[i].id.slice(6));
            }
        }
        return students2
    }

    function checked_tutor4(){
        var newId_tutor;
        var elem_tutor = document.getElementsByClassName("check7");
        for(var i=0; i<elem_tutor.length; i++) {
            if(elem_tutor[i].checked == true){
                newId_tutor = elem_tutor[i].id.slice(6);
                i=elem_tutor.length+1;
            }
        }
        return newId_tutor
    }

    //se cancela la aginacion de valores a un curso en específico
    $("#cancel_course").click(function(){
        location.reload();
    });

    // trae los valores de los estudiantes seleccionados
    function checked_students(){
        var elements1 = document.getElementsByClassName("check");
        for(var i=0; i<elements1.length; i++) {
            if(elements1[i].checked == true){
                students.push(elements1[i].id.slice(5));
            }
        }
        return students
    }

    var str = document.URL
    var roomlong = str.substring(str.lastIndexOf("/") + 1, str.lenght);
    if(roomlong != "course-accounts"){
        var partUrl = roomlong.split("++");
        move_to_tap4(partUrl[0]);
    }
});
    var id_course;
    var elements8 = document.getElementsByClassName("check8");
    var elements7 = document.getElementsByClassName("check7");
    var elements6 = document.getElementsByClassName("check_6");
    var elements5 = document.getElementsByClassName("check_5");
    var elements3 = document.getElementsByClassName("check3");
    var elements2 = document.getElementsByClassName("check2");
    var elements1 = document.getElementsByClassName("check");
    var edit_mode =edit_mode4 = false;

    function zero_tutor(){
        for(var i=0; i<elements2.length; i++) {
            elements2[i].checked = false;
            elements2[i].setAttribute("required", "true")
        }
    }

    function zero_students(){
        for(var i=0; i<elements1.length; i++) {
            elements1[i].checked = false;
            elements1[i].setAttribute("required", "true")
        }
    }

    function select_one_tutor(id_check, name_check){
        for(var i=0; i<elements2.length; i++) {
            elements2[i].checked = false;
            elements2[i].removeAttribute("required")
        }
        document.getElementById(id_check).checked = true;
        document.getElementById("id_tutor").setAttribute("value",id_check.slice(5))
        document.getElementById("id_tutor").setAttribute("name",name_check)
    }

    function select_one_student(id_check){
        for(var i=0; i<elements1.length; i++) {
            elements1[i].removeAttribute("required")
        }
    }


    function select_one_course(id_check, name_check){
        var __id = id_check.slice(6);
        var name = name_check;
        var type = document.getElementById("type-"+__id).innerText;    
        //var desc = document.getElementById("desc-"+__id).innerText;  
        var r = confirm("¿Desea editar " + name_check);
        document.getElementById(id_check).checked = false;
        if (r == true) {       
            //move_to_tap2(__id,name,desc,type);
            move_to_tap2(__id,name,type)   
        } 
    }

    function edit_course (value){
        var value= value.slice(4);
        id_course = document.getElementById("__id"+value).innerText;
        name = document.getElementById("name"+value).innerText;
        var r = confirm("¿Desea editar " + name);
        if (r == true) {  
            move_to_tap4(id_course)       
        }   
    }

    function move_to_tap2(__id,name,type,code){
        $("#_id2").val("").val(__id);
        $("#code_course2").val("").val(name);
        $("#name_course2").val("").val(name);
        $('#type_course').val(type);
        var el = document.getElementById("tabs");
        var instance = M.Tabs.getInstance(el);
        edit_mode = true;
        instance.select('test2');
    }

    function moved_tap2(event){
        if(edit_mode){
            document.getElementById("secondPart").style.display = 'block';
            document.getElementById("FirstPart").style.display = 'none';    
        }else{
            document.getElementById("secondPart").style.display = 'none';
            document.getElementById("FirstPart").style.display = 'block';
            $("#_id2").val("");
            $("#name_course2").val("");
            $("#code_course2").val("");
            //$("#description2").val(""); 
            zero_tutor()
            zero_students()
        }
    }
    function edit_course2 (id_course){
        id_course = id_course.slice(3);
        move_to_tap4(id_course);
    }

    function delete_course (value){
        var value = value.slice(4); 
        var __id = document.getElementById("__id"+value).innerText;    
        var name = document.getElementById("name"+value).innerText;
        var r = confirm("¿Desea eliminar " + name + "?");
        if (r == true) {
            $.ajax({
                type: "POST",
                url: "/control/delete_course",
                data: {id_course: __id},
                success: function(course) {
                    location.reload();
                },
                error: function(err){
                    console.log(err);
                }
            });
        }   
    }

//*******Funciones relacionada al TAB4 *********************//
    //reconoce cuando se ha dado clic en tab 4
    function moved_tap4(event){
        if(edit_mode4){
            document.getElementById("secondPart4").style.display = 'block';
            document.getElementById("FirstPart4").style.display = 'none';
            id_course = document.getElementById("_id4").value;
            check_each_student(id_course);   
        }else{
            document.getElementById("secondPart4").style.display = 'none';
            document.getElementById("FirstPart4").style.display = 'block';
            $("#_id4").val("");
            $("#name_course4").val("");
            //$("#description4").val(""); 
            //zero_tutor()
            //zero_students()
        }
    }

    function select_one_tutor2(id_check){
        var first_tutor = document.getElementsByClassName("check5")[0];
        var check_value = document.getElementById(id_check).checked;
        var new_id_tutor = id_check.slice(6);
        if(first_tutor){
            first_tutor = first_tutor.id.slice(6);
            document.getElementsByClassName("check5")[0].checked = false;
        }else{first_tutor=false;}
        for(var i=0; i<elements7.length; i++) {
            elements7[i].removeAttribute("required");
            elements7[i].checked = false;
        }
        $(".new_tr").html("");
        
        var new_name_tutor = document.getElementById("name7"+new_id_tutor).innerText;
        var new_email_tutor = document.getElementById("mail7"+new_id_tutor).innerText;
        if(check_value){
            document.getElementById("check7" + new_id_tutor).checked = true;
            if(first_tutor == new_id_tutor){
              document.getElementsByClassName("check5")[0].checked = true;  
            }else{
                $("#empty_tutor").html("");
                $("#myTable4").append('<tr class="new_tr"><th> <p style="margin-top: 0px !important; margin-bottom: 0px !important"> <label> <input type="checkbox" class="check" id="check_' + new_id_tutor+ '" onclick="select_one_tutor2(this.id)" checked="true"/> <span></span> </label> </p></th> <td>' + new_name_tutor+ '</td><td>' + new_email_tutor + '</td></tr>');
            }
        }
    }

    function select_one_student2(id_check){
        id_course = document.getElementById("_id4").value;  
        name_course = document.getElementById("name_course4").value;
        id_student = id_check.slice(6)
        name_student = document.getElementById('tr_8'+id_check.slice(6)).cells[1].innerText;
        email_student = document.getElementById('tr_8'+id_check.slice(6)).cells[2].innerText;
        if( document.getElementById(id_check).checked == true){
            var resp1 =  confirm('¿Desea agregar a ' + name_student + ' al curso ' + name_course + '?')
            if(resp1){
                $("#myTable4_2").append('<tr id="tr_6'+id_student+'"><th> <p style="margin-top: 0px !important; margin-bottom: 0px !important"> <label> <input type="checkbox" class="check_6' + id_student+ '" id="check_' + id_student+ '" onclick="select_one_student2(this.id)" checked="true"/> <span></span> </label> </p></th> <td>' + name_student+ '</td><td>' + email_student + '</td></tr>');                
                $.ajax({
                    type: "POST",
                    url: "/control/create_join",
                    data: {id_course: id_course,
                           id_student: id_student},
                    success: function(result) {

                    },
                    error: function(err){
                        
                    }
                });
            }

        }else{
            var resp2 =  confirm('¿Desea eliminar a ' + name_student + ' del curso ' + name_course + '?')          
            if(resp2){
                document.getElementsByClassName("check_6"+id_student)[0].checked = false;
                document.getElementsByClassName("check_6"+id_student)[1].checked = false;
                document.getElementById('tr_6'+id_student).remove();
                $.ajax({
                    type: "POST",
                    url: "/control/delete_join",
                    data: {id_course: id_course,
                           id_student: id_student},
                    success: function(result) {

                    },
                    error: function(err){
                        
                    }
                });
            }
        }
    }


    function select_one_course3(id_check){
        id_course = id_check.slice(6);
        name = document.getElementById("name4"+id_course).innerText;
        var r = confirm("¿Desea editar " + name);
        document.getElementById(id_check).checked = false;
        if (r == true) {       
            move_to_tap4(id_course); 
        } 
    }

    function move_to_tap4(id_course){
        $.ajax({
            type: "POST",
            url: "/control/get_course_info",
            data: {id_course: id_course},
            success: function(course) {
                $("#_id4").val("").val(course._id);
                $("#code_course4").val("").val(course.code_course);
                $("#name_course4").val("").val(course.name_course);
                $('#mySelect4').val(course.type);
                $("#mySelect4").formSelect();
                var el = document.getElementById("tabs");
                var instance = M.Tabs.getInstance(el);
                edit_mode4 = true;
                instance.select('test4');
            },
            error: function(err){
                console.log(err);
            }
        });
    }

    function check_each_student(id_course){    
        $.ajax({
            type: "POST",
            url: "/control/get_joins_info",
            data: {id_course: id_course},
            success: function(result) {
                $("#tab4_tutor").html("").append(result.textHtml1);
                $("#tab4_students").html("").append(result.textHtml2)
                check_tutor_table(result.course.id_tutor);
                check_student_table(result.joins)
            },
            error: function(err){
                
            }
        });
    }

    function check_tutor_table(id_tutor){
        if(id_tutor){
            document.getElementById("check7"+id_tutor).checked = true;
        }
    }

    function check_student_table(joins){
        for(var i=0; i<joins.length; i++) {
            document.getElementsByClassName("check_6"+joins[i].id_student)[0].checked = true;
            document.getElementsByClassName("check_6"+joins[i].id_student)[1].checked = true;
        }
    }

    function add_one_tutor(){
        $("#myModal2").css("visibility","visible");
    }

    function add_more_students(){
        $("#myModal3").css("visibility","visible");
    }  
