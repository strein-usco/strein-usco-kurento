$(document).ready(function(){
    $('.tabs').tabs();
    $('.sidenav').sidenav();
    $('.parallax').parallax();
    $(".dropdown-trigger").dropdown();
    $('.carousel').carousel();
    $('.slider').slider();
    $('select').formSelect();
    $('.collapsible').collapsible();
    $('.tooltipped').tooltip();
    $('.modal').modal();


       $('#logout').click(function(){
    	$.ajax({
    		type:"GET",
    		url: "/logout",
    	});
    });
    $('input#description, textarea#textarea2').characterCounter();
    $('.datepicker').datepicker();
    $('.timepicker').timepicker();
    $('.carousel').carousel();
    $('select').formSelect();
    $('.table').footable();

});

document.addEventListener('DOMContentLoaded', function() {
var elems = document.querySelectorAll('.fixed-action-btn');
var instances = M.FloatingActionButton.init(elems, {
  direction: 'top',
  hoverEnabled: false
});
});