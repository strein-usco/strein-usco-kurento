/*****************  Funciones undo y redo  ********************
**  https://codepen.io/keerotic/pen/yYXeaR
***************************************************************/
$(document).ready(function() { 	

	/******************************************************
     ******      Funciones tablero interactivo       ******
     ******************************************************/
    var localCanvas = document.getElementById('c1');
    var cardVideoWidth =  document.getElementById('c2').offsetWidth;
    var cardVideoHeight =  document.getElementById('c2').offsetHeight;
    //document.getElementById('web-cam4').style.display = 'none'
    //document.getElementById('web-cam1').style.display = 'none'
    localCanvas.width = cardVideoWidth;
    localCanvas.height = cardVideoHeight;

    var newPage;

    fabric.Object.prototype.transparentCorners = false;
    this.__canvases = [];
    var canvas = this.__canvas = new fabric.Canvas('c1', { stateful: true, backgroundColor: 'rgb(255,250,255)' });
    var white = new fabric.Rect({
        top: 0,
        left: 0,
        width: 2000,
        height: 2000,
        fill: 'white'
    });

    white.selectable = false;
    //canvas.add(white);
    canvas.setBackgroundColor('rgb(255,250,255)', canvas.renderAll.bind(canvas));

    var drawingLineWidthEl = document.getElementById('drawing-line-width'),
        drawingColorEl = document.getElementById('drawing-color'),
        drawing_mode_selector = document.getElementById('drawing-mode-selector');

    var startPoints = [
        {x: 0, y: 0},
        {x: 20, y: 0},
        {x: 20, y: 30},
        {x: 0, y: 30}
    ];

    var endPoints = [
        {x: 0, y: 0},
        {x: 20, y: 0},
        {x: 20, y: 50},
        {x: 0, y: 50}
    ];

    var clonedStartPoints = startPoints.map(function(o){
        return fabric.util.object.clone(o);
    });

    var polygon = new fabric.Polygon(clonedStartPoints, {
        left: 0,
        top: 0,
        fill: 'transparent',
        selectable: false,
        objectCaching: false,
    });
    
    canvas.add(polygon);

    function animatePoint(i, prop, endPoints) {
        fabric.util.animate({
          startValue: polygon.points[i][prop],
          endValue: endPoints[i][prop],
          duration: 1000,
          onChange: function(value) {
            polygon.points[i][prop] = value;
            // only render once
            if (i === startPoints.length - 1 && prop === 'y') {
              canvas.renderAll();
            }
          },
          onComplete: function() {
            polygon.setCoords();
            // only start animation once
            if (i === startPoints.length - 1 && prop === 'y') {
              even = !even;
              animate();
            }
          }
        });
    }

    function animate() {
        for (var i = 0, len = startPoints.length; i < len; i++) {
          animatePoint(i, 'x', even ? endPoints : startPoints);
          animatePoint(i, 'y', even ? endPoints : startPoints);
        }
    }

    var even = true;
    setTimeout(animate, 1000);

    //Desplegar imagenes en el canvas 
    $(".overlayCourse").click(function() {
        var min_pag = Number($(this).attr("name"));
        var max_pag = Number($(this).attr("value"));
        var page_current = "hiddendiv" + min_pag;
        var currentPage, newPage, group, numbergroup;
        var imageB64 = document.getElementById(page_current).getAttribute("src");
        displayPicture(imageB64)
        styleFaceFile(min_pag); 
        //canvas.add(white);
        canvas.setBackgroundColor('rgb(255,250,255)', canvas.renderAll.bind(canvas));
        document.getElementById("current").setAttribute("value", min_pag);
        group = "Group_" + this.id; ///Group_overlay# me indicará enque grupo de imagenes está
        numbergroup = document.getElementById(group).getAttribute("value");
        document.getElementById("currentGrup").setAttribute("value", numbergroup); //se imprime en este input para saber el actual grupo
        $("#target").hide();

    });

    $(".atras").click(function() {
        currentPage = document.getElementById("current").getAttribute("value");
        document.getElementById("hiddendiv" + currentPage).setAttribute("value",JSON.stringify(canvas));
        document.getElementById("hiddendiv" + currentPage).setAttribute("src","");
        newPage = Number(currentPage) - 1;
        updatepage(newPage);
    });

    $(".adelante").click(function() {
        currentPage = document.getElementById("current").getAttribute("value");
        document.getElementById("hiddendiv" + currentPage).setAttribute("value",JSON.stringify(canvas));
        document.getElementById("hiddendiv" + currentPage).setAttribute("src","");
        newPage = Number(currentPage) + 1;
        updatepage(newPage)
    });

    //funcion para desplegar una nueva imagen
    function updatepage(newPage) {
        var max_pag = document.getElementById("adelante").getAttribute("name");
        max_pag = Number(max_pag);
        if (newPage >= 0 && newPage < max_pag) {

            document.getElementById("current").setAttribute("value", newPage);
            var page_current = "hiddendiv" + newPage;
            var imageB64 = document.getElementById(page_current).getAttribute("src");
            displayPicture(imageB64);
            styleFaceFile(newPage); ///da estilo de bordes a la imagen que represneta el grupo de iamgenes
            //canvas.add(white);
            canvas.setBackgroundColor('rgb(255,250,255)', canvas.renderAll.bind(canvas));
        }
    }

    //Crea un objeto tipo imagen y lo muestra en el canvas
    function displayPicture(imageB64) {
        if(imageB64.slice(0,4) == "data"){
            var pugImg = new Image();
            pugImg.onload = function(img) {
                var width = pugImg.width;
                var height = pugImg.height;
                var anynumber, size, relationSize, newWidth;
                var flag_fit = document.getElementById("fitImage").getAttribute("name");
                if (flag_fit == "enable") {
                    relationSize = canvas.height / pugImg.height;
                    newWidth = pugImg.width * relationSize
                    size = {
                        height: canvas.height,
                        width: newWidth
                    }
                }
                var pug = new fabric.Image(pugImg, size);
                pug.top = 0;
                canvas.add(pug);
                canvas.add(polygon);
            };
            pugImg.src = imageB64;
            pugImg.setAttribute('crossOrigin', 'anonymous');
        }else{
            currentPage = document.getElementById("current").getAttribute("value");
            action_send = document.getElementById("hiddendiv" + currentPage).getAttribute("value");
            canvas.loadFromJSON(action_send);
            //connection.socket.emit(connection.socketCustomEvent, {user_id: "todos", action: action_send});
        }
    }

    $("#fitImage").click(function() {

        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#drawing-mode, #drawing-color, #textbox, #selecting-mode, #drawing-color, #after, #drawing-mode-selector, #drawing-line-width").css("border", "2px solid #8d191d");

        var flag_fit = $(this).attr("name");
        if (flag_fit == "disable") {
            $(this).val("Desajustar Imagen");
            document.getElementById("fitImage").setAttribute("name", "enable");
        } else {
            $(this).val("Ajustar Imagen");
            document.getElementById("fitImage").setAttribute("name", "disable");
        }
        newPage = document.getElementById("current").value;
        updatepage(newPage);
    });

    //FUNCION PARA DAR UN EFECTO DE RESALTAR LA IMAGEN SELECCIOANDA
    function styleFaceFile(newPage) {
        var number = 0;
        var divgroup = "overlay" + number;
        var element = document.getElementById(divgroup);
        var sampleMax, sampleMin, samplenum, CurrenGroupp, BiggerDiv, Normaldiv, totalpage, CurrentgroupPage;
        while (element) {
            samplenum = Number(newPage);
            sampleMax = Number(document.getElementById(divgroup).getAttribute("value"));
            sampleMin = Number(document.getElementById(divgroup).getAttribute("name"));
            if (samplenum >= sampleMin && samplenum <= sampleMax) {
                CurrenGroupp = number;
                BiggerDiv = "div" + number;
                document.getElementById(BiggerDiv).style.backgroundColor = "#D8CEA3";
                totalpage = sampleMax - sampleMin + 1;
                //totalpage = sampleMax - sampleMin;
                CurrentgroupPage = samplenum - sampleMin + 1;
                $("#number_page").html("").html(totalpage);
                $("#getNewPage").attr("value", CurrentgroupPage);
                $("#getNewPage").val(CurrentgroupPage);

            } else {
                Normaldiv = "div" + number;
                document.getElementById(Normaldiv).style.backgroundColor = "";
            }
            number++
            divgroup = "overlay" + number;
            element = document.getElementById(divgroup);
        }
        canvas.clear();
    }

    $('#getNewPage').keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
            var numbergroup = document.getElementById("currentGrup").getAttribute("value"); //numero del grupo
            var showpage = Number(this.value); //valor de la pagina deseada
            var idwanted = "overlay" + numbergroup
            var minpage = Number(document.getElementById(idwanted).getAttribute("name")); //pagina minima del grupo
            var maxpage = Number(document.getElementById(idwanted).getAttribute("value")); //pagina maxima del grupo
            newPage = minpage + showpage - 1;
            if (newPage >= minpage && newPage <= maxpage) {
                updatepage(newPage);
                document.getElementById("current").setAttribute("value", newPage);
            }
        }
    });
    
    //Botones para edicion de canvas
    var eraser_mode;
    $('#drawing-mode').click(function() {
        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#eraser-mode, #textbox, #drawing-color, #selecting-mode, #fitImage, #drawing-color, #after, #drawing-mode-selector, #drawing-line-width").css("border", "2px solid #8d191d");

        canvas.isDrawingMode = true;
        eraser_mode = false;
    });

    $('#selecting-mode').click(function() {
        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#drawing-mode, #eraser-mode, #drawing-color, #textbox, #fitImage, #drawing-color, #after, #drawing-mode-selector, #drawing-line-width").css("border", "2px solid #8d191d");
        
        canvas.isDrawingMode = false;
        eraser_mode = false;
    });

    //Borrar objectos del canvas
    $('#eraser-mode').click(function() {
        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#drawing-mode, #textbox, #drawing-color, #selecting-mode, #fitImage, #drawing-color, #after, #drawing-mode-selector, #drawing-line-width").css("border", "2px solid #8d191d");
        eraser_mode = true;
        canvas.isDrawingMode = false;
    });

    $('#after').click(function() {
        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#drawing-mode, #drawing-color, #textbox, #selecting-mode, #drawing-color, #drawing-mode-selector, #drawing-line-width").css("border", "2px solid #8d191d");
    
        canvas.isDrawingMode = false;
        eraser_mode = false;
    });

    $('#drawing-color').click(function() {
        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#drawing-mode, #textbox, #after, #selecting-mode, #drawing-mode-selector, #drawing-line-width").css("border", "2px solid #8d191d");
        canvas.isDrawingMode = false;
        eraser_mode = false;

    });

    $('#drawing-mode-selector').click(function() {
        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#drawing-mode, #drawing-color, #selecting-mode, #fitImage, #textbox, #drawing-color, #after, #drawing-line-width").css("border", "2px solid #8d191d");
        canvas.isDrawingMode = false;
        eraser_mode = false;

    });

    $('#drawing-line-width').click(function() {
        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#drawing-mode, #drawing-color, #selecting-mode, #fitImage, #textbox, #drawing-color, #after, #drawing-mode-selector").css("border", "2px solid #8d191d");
    
        canvas.isDrawingMode = false;
        eraser_mode = false;
    });

    $('#textbox').click(function() {

        $(this).css("border-top-width", "0px").css("border-color", "#e0e0e0");
        $("#drawing-mode, #drawing-color, #selecting-mode, #fitImage, #drawing-color, #after, #drawing-mode-selector, #drawing-line-width").css("border", "2px solid #8d191d");

        //Retorna un objeto tipo texto
        var textbox = new fabric.Textbox('texto', {
          left: 50,
          top: 50,
          width: 150,
          fontSize: 30,
          fill: '#D81B60'
        });
        canvas.add(textbox).setActiveObject(textbox);

        canvas.isDrawingMode = false;
        eraser_mode = false;
    });


    canvas.on('mouse:down', function(e) {
        if (eraser_mode && !e.target._element) {
            canvas.remove(e.target);
        }
    });

    canvas.on('object:added', function(e) {
        if (!isRedoing) {
            h = [];
        }
        isRedoing =  false;
    });

    var isRedoing = false;
    var h = [];
    document.getElementById('after').onclick = function() {
        if(canvas._objects.length>1){
            h.push(canvas._objects.pop());
            canvas.renderAll();
        }
    }
    /*function redo(){
        if(h.length>0){
            isRedoing = true;
            canvas.add(h.pop());
        }
    }*/

    canvas.on('object:modified', function(e) {
        if (e.target._element) {
            canvas.loadFromJSON(JSON.stringify(canvas));
            //connection.socket.emit(connection.socketCustomEvent, {user_id: "todos", action: JSON.stringify(canvas)});
        }
    });

    //Retorna el objecto a al estado inicial cuando este se sale de los limites del canvas    
    /*canvas.on('object:modified', function(e) {
        var obj = e.target;
        let boundingRect = obj.getBoundingRect(true);
        if (boundingRect.top < 0 ||
            boundingRect.left + boundingRect.width > canvas.getWidth() ||
            boundingRect.top + boundingRect.height > canvas.getHeight()) {
            obj.angle = obj._stateProperties.angle;
            obj.scaleX = obj._stateProperties.scaleX;
            obj.scaleY = obj._stateProperties.scaleY;
            obj.setCoords();
            obj.saveState();
        }
    });*/

    // Seleccionar el tipo de pincel
    drawing_mode_selector.onchange = function() {
        canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = drawingColorEl.value;
            canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
        }
    };

    // Seleccionar el tamaño del pincel
    drawingLineWidthEl.onchange = function() {
        canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
        this.previousSibling.innerHTML = this.value;
    };

    // Selecionar el color del pincel
    drawingColorEl.onchange = function() {
        canvas.freeDrawingBrush.color = this.value;
    };
    if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = drawingColorEl.value;
        canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
    }

    $("#hide").on('click', function() {
        $("#element").hide();
        $("#camera").show();
        return false;
    });
    
    $("#camera").on('click', function() {
        $("#element").show();
        $("#camera").hide();
        return false;
    });

    $("#trigger").click(function() {
      $("#target").slideToggle(); 
    });

    $("#trigger2").click(function() {
      $("#tablero").slideToggle(); 
    });

});   
    