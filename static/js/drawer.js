// run once the document is ready
$(document).ready( function() {
  
  // HAMBURGER BUTTONS
  
  // grab parts of the page
  let drawer = $("#drawer");
  let drawerCloak = $(".drawer-cloak").eq(0);
  let openButton = $(".drawer-button.open").eq(0);
  let closeButton = $(".drawer-button.close").eq(0);
  
  // when the drawer button that opens is clicked
  let openDrawer = function() {
    drawer.removeClass('closed');
    drawer.addClass('opened');
    
    drawerCloak.removeClass('closed');
    drawerCloak.addClass('opened');
  }
  
  // when the drawer button that closes is clicked
  let closeDrawer = function() {
    drawer.removeClass('opened');
    drawer.addClass('closed');
    
    drawerCloak.removeClass('opened');
    drawerCloak.addClass('closed');
  }
  
  openButton.on("click", openDrawer);
  closeButton.on("click", closeDrawer);
  drawerCloak.on("click", closeDrawer);
  
  // TOUCH DRAG
  
  let body = $('body');
  let mouseStart = { x: 0, y: 0 };
  let mouseEnd = { x: 0, y: 0 };
  let mouseDelta = { x: 0, y: 0 };
  let prevState = 'closed';
  
  // the drawer only does any touch dragging if this is true
  let isDragging = true;
  
  let prevDrawerWidth = 0;
  let prevDrawerMaxWidth = 0;
  
  let prevXPos = [];
  
  // changes properties of drawer divs based on mouseDelta
  // also removes the closed and open properties
  let updateDrawer = function() {
    drawer.css({
      width: (prevDrawerWidth + mouseDelta.x)
    });
    drawerCloak.css({
      opacity: (prevState === 'opened' ? 1 : 0) + mouseDelta.x / Math.min(body.width(), 400)
    });
  }
  
  // removes the styles from .css() to prevent it from
  // overriding other things
  let clearDrawerStyle = function() {
    drawer.removeAttr('style');
    drawerCloak.removeAttr('style');
  }
  
  // holds onto the previous drawer classes and css
  let grabPrevState = function() {
    // grab css
    prevDrawerWidth = drawer[0].offsetWidth;
    prevDrawerMaxWidth = drawer[0].offsetWidth;
    
    // grab class states
    if(drawer.hasClass('closed')) {
      prevState = 'closed';
      //drawer.removeClass(prevState);
      //drawerCloak.removeClass(prevState);
    }
    else if(drawer.hasClass('opened')) {
      prevState = 'opened';
      //drawer.removeClass(prevState);
      //drawerCloak.removeClass(prevState);
    }
    else {
      throw('grabPrevState() was called, but drawer has no previous state');
    }
  }
  
  // returns drawer to resting state
  let resetDrawer = function() {
    if( prevState === 'closed' ) {
      closeDrawer();
    }
    else if( prevState === 'opened' ) {
      openDrawer();
    }
    else {
      throw("somehow the drawer was neither closed nor opened");
    }
  }
  
  // as touch starts
  
  body.on("touchstart", (e) => {
    isDragging = true;
    
    let touch = e.changedTouches[0];
    
    mouseStart.x = touch.clientX;
    mouseStart.y = touch.clientY;
    mouseEnd.x = touch.clientX;
    mouseEnd.y = touch.clientY;
    mouseDelta.x = 0;
    mouseDelta.y = 0;
    
    //body.removeClass('noscroll');
    grabPrevState();
    
    // stop dragging drawer
    if( (prevState === 'closed' && mouseStart.x > 100) || (prevState === 'opened' && mouseStart.x < (Math.min(body.width(), 400) - 100)) ) {
      isDragging = false;
      //clearDrawerStyle();
      //resetDrawer();
    }
    
    if(isDragging) {
      updateDrawer();
    }
  });
  
  // as touch is moved
  
  body[0].addEventListener("touchmove", (e) => {
    let touch = e.changedTouches[0];
    
    // save 8 most recent x positions
    prevXPos.unshift(touch.clientX - mouseEnd.x);
    if(prevXPos.length > 8) prevXPos.pop();
    
    mouseEnd.x = touch.clientX;
    mouseEnd.y = touch.clientY;
    mouseDelta.x = mouseEnd.x - mouseStart.x;
    mouseDelta.y = mouseEnd.y - mouseStart.y;
    
    
    // stop dragging drawer
    if( Math.abs(mouseDelta.y) > 40 && Math.abs(mouseDelta.x) < 50 ) {
      isDragging = false;
      clearDrawerStyle();
      resetDrawer();
    }
    else {
      //e.preventDefault();
      //body.addClass('noscroll');
    }
    
    if(isDragging) {
      drawer.removeClass(prevState);
      drawerCloak.removeClass(prevState);
      if(e.cancelable){
        e.preventDefault();
      }
      updateDrawer();
    }
  }, { passive: false });
  
  // as touch ends
  
  body.on("touchend", (e) => {
    clearDrawerStyle();
    
    // average distance travelled in prevXPos frames
    let flick = prevXPos.reduce((avg, i) => avg + i, 0) / prevXPos.length || 0;
    prevXPos = [];
    
    if(isDragging) {
      if(mouseDelta.x > 200 || flick > 8) {
        openDrawer();
      }
      else if(mouseDelta.x < -200 || flick < -8) {
        closeDrawer();
      } 
      else {
        resetDrawer();
      }
    }
  });
  
  drawer.on('scroll', (e) => {
    let lambda = 5;
    if(drawer[0].scrollTop <= lambda){
      drawer[0].scrollTop = lambda + 1;
    } else if(drawer[0].scrollTop >= (drawer[0].scrollHeight - drawer[0].clientHeight) - lambda){
      drawer[0].scrollTop = (drawer[0].scrollHeight - drawer[0].clientHeight) - (lambda + 1);
    }
  });
});