$(document).ready(function(){
  var width = screen.width,
    height = screen.height;

    if (screen.width <= 500) {

$('.slidebar').remove();
    }
});

var mybutton = document.getElementById("myBtn");
    
window.onscroll = function() {scrollFunction()};
    
function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}
    
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

var FormStuff = {
  
  init: function() {
    this.applyConditionalRequired();
    this.bindUIActions();
  },
  
  bindUIActions: function() {
    $("input[type='radio']").on("change", this.applyConditionalRequired);
  },
  
  applyConditionalRequired: function() {
    
    $(".require-if-active").each(function() {
      var el = $(this);
      if ($(el.data("require-pair")).is(":checked")) {
        el.prop("required", true);
      } else {
        el.prop("required", false);
      }
    });
    
  }
  
};

FormStuff.init();