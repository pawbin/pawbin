function notify({content, type}){
  let refNotif = $(".reference-notif").eq(0).html();
  let notif = $(refNotif).appendTo($(".notifs"));
  notif.addClass(`notif-${type}`);
  notif.find('.content').html(content);
  let h = notif.outerHeight();
  notif.css({"height": 0, visibility: "visible"}).css({"height": h});
  setTimeout(() => {
    notif.css({height: ''});
  }, 400);
}

$(document).ready(function(){
  $('body').on('click', '.notif-close', function() {
    let notif = $(this).closest(".notif");
    let h = notif.outerHeight();
    notif.css({"height": h});
    notif.css({height: 0});
    setTimeout(() => {
      notif.remove();
    }, 400);
  });
  
  $(".notifs>.notif").each(function(){
    let h = $(this).outerHeight();
    $(this).css({"height": 0, visibility: "visible"}).css({"height": h});
    setTimeout(() => {
      $(this).closest(".notif").css({height: ''});
    }, 400);
  });
  
  $(".test-message").on('click', function(){
    let types = [
      'basic',
      'success',
      'info',
      'alert',
      'warning',
      'danger',
    ];
    notify({content: "hello world!", type: types[Math.floor(Math.random() * types.length)]});
  });
});