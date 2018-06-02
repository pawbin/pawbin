function notify(obj){
  let refNotif = $(".reference-notif").eq(0).html();
  let parent;
  if(obj.form && $(".form-container[name='" + obj.form + "'] .notifs").length){
    parent = $(".form-container[name='" + obj.form + "'] .notifs").eq(0);
  } else if($("body>.notifs").length){
    parent = $("body>.notifs");
  } else {
    parent = ("<div class='notifs'></div>").prependTo("body");
  }
  //TODO: check if obj.form exists AND if  (.form-container[name=" + (obj.form) + "])  exists in the page, and change to global notif location otherwise
  let notif = $(refNotif).appendTo(parent);
  $(".notif", notif).addClass("notif-" + obj.type).text(obj.content);
  let height = $(".notif", notif).outerHeight();
  notif.css({"height": 0}).css({"height": height});
}

$(document).ready(function(){
  
  $('body').on('click', '.notif-close', function() {
    $(this).closest(".notif-container").css({height: 0})
  });

  $(".notif-container").each(function(){
    $(this).css({"height": $(".notif", this).outerHeight()});
  });

});