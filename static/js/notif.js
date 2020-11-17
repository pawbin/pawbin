let refNotif = `<div class="notif">
  <p class="content"></p>
  <div class="notif-close">
    <span class="fas fa-times"></span>
  </div>
</div>`


$.extend($.easing, {
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  }
});



function notify({content, type}){
  let notif = $(refNotif).appendTo($(".notifs"));
  notif.addClass(`notif-${type}`);
  notif.find('.content').html(content/* + '='.repeat(Math.random() * 300)*/);
  let h = notif.outerHeight();
  notif.css({"height": 0, visibility: "visible"}).css({"height": h});
  setTimeout(() => {
    notif.css({height: ''});
  }, 360);
}

$(document).ready(function(){
  $('body').on('click', '.notif-close', function() {
    let notif = $(this).closest(".notif");
    let h = notif.outerHeight();
    notif.next('.notif').css({'margin-top': h + parseFloat(notif.css('margin-bottom'))}).animate({'margin-top': 0}, 350, 'easeOutQuart');
    notif.stop().css({
      top: notif[0].offsetTop, 'margin-top': 0, 'margin-bottom': 0,
      opacity: notif.css('opacity'), 'z-index': parseInt(notif.css('z-index'))+1, transform: notif.css('transform'), 
    });
    notif.detach().prependTo($('.removed-notifs'));
    notif.css({"height": h});
    notif.css({height: 0});
    setTimeout(() => {
      notif.remove();
    }, 360);
  });
  
  $(".notifs>.notif").each(function(){
    let h = $(this).outerHeight();
    $(this).css({"height": 0, visibility: "visible"}).css({"height": h});
    setTimeout(() => {
      $(this).closest(".notif").css({height: ''});
    }, 360);
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