
$(document).ready( function() {
  let drawer = $("#drawer");
  let drawerCloak = $("#drawer-cloak");
  let openButton = $("#drawer-open-button");
  let closeButton = $("#drawer-close-button");
  
  let openDrawer = function() {
    drawer.css({ 
      "width": "75%",
    });
    
    drawerCloak.css({ 
      "opacity": "1",
      "pointer-events": "all"
    });
  }
  
  let closeDrawer = function(event) {

    drawer.css({ 
      "width": "0",
    });
    
    drawerCloak.css({ 
      "opacity": "0",
      "pointer-events": "none"
    });    
  }

  openButton.on("pointerup", openDrawer);
  closeButton.on("pointerup", closeDrawer);
  drawerCloak.on("pointerup", closeDrawer);
});