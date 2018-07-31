
// object of all islands
let worldmap = {
  unlit: {
    image: "https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2FfrizbeeSilhouette.png?1528414189509",
    hover: false
  },
  grassland: {
    image: "https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2FfrizbeeSilhouetteLit.png?1528414189771",
    link: "https://pawbin.glitch.me/catch",
    outline: [
      189,137,148,121,122,118,128,105,164,108,161,102,170,101,156,86,163,79,176,83,172,69,184,64,208,74,247,104,265,132,280,141,277,117,296,116,308,132,309,119,326,114,332,130,375,61,415,27,444,15,471,16,483,43,473,95,434,140,373,167,362,214,388,216,392,232,362,247,367,258,320,274,307,288,270,281,268,300,255,302,238,277,227,276,218,251,200,242,189,206,96,202,47,194,14,168,9,147,83,144,163,153,208,171,224,162
    ],
    hover: false
  }
};


// loops through all islands in the worldmap
for (let islandName in worldmap) {
  // fetch the island from the list of all islands
  let island = worldmap[islandName];
  
  // if this island has an image
  if(island.image){
    // make a new Image, set the source to the island's image, push the Image object to the images array
    let image = new Image();
    image.src = island.image;
    island.image = image;
  }
  
  // if this island has an outline
  if(island.outline){
    // for every other number in the outline array, treat as a pair of x and y coordinates and draw a path
    for( let i = 0; i < island.outline.length; i+=2 ) {
      // if this is the first point
      if(i === 0){
        island.path = new Path2D;
        island.path.moveTo(island.outline[i], island.outline[i+1]);
        // if this is any other point
      } else {
        island.path.lineTo(island.outline[i], island.outline[i+1]);
      }
    }
    island.path.closePath();
  }
}


window.onload = function() {
  let canvas = $("#grasslands-canvas");
  let c = canvas[0].getContext('2d', {
    alpha: true
  });
  
  // set the canvas to a size of 500x500 pixels
  canvas.attr("width", "500px").attr("height", "500px");
  // reset the canvas image
  resetImage();
  
  // whenever the canvas is clicked
  canvas.on("pointerup", function(e) {
    // loop through every island in the worldmap
    for(let islandName in worldmap) {
      let island = worldmap[islandName];
      // if this island has a link and the click point is within this island's path
      if(island.link && c.isPointInPath(island.path, e.pageX - canvas.offset().left, e.pageY - canvas.offset().top, "nonzero")) {
        // travel to island.link
        if(e.button === 0){
          window.location.href = island.link;
        } else if(e.button === 1){
          window.open(island.link, '_blank'); 
        }
      }
    }
  });
  
  // whenever the user moves their mouse over the canvas
  canvas.on("pointermove", function(e) {
    // loop through every island in the worldmap
    for(let islandName in worldmap) {
      let island = worldmap[islandName];
      // if the cursor is within this island's path
      if(island.path && c.isPointInPath(island.path, e.pageX - canvas.offset().left, e.pageY - canvas.offset().top, "nonzero")) {
        // if the island wasn't hovered over before this moment, then we need to load the island's image
        if(!island.hover) loadImage(island);
        // now the island is hovered over
        island.hover = true;
        // set the cursor to a pointer
        canvas.css("cursor", "pointer");
      // if the cursor is not within the island's path
      } else {
        if(island.hover) resetImage();
        island.hover = false;
        canvas.css("cursor", "auto");
      }
    }
    
    // runs whenever the mouse leaves the canvas (in case the pointer leaves really quickly)
    canvas.on("pointerleave", function() {
      // set all island hovers to false
      for(let islandName in worldmap) {
        worldmap[islandName].hover = false;
      }
      
      // and reset the image, of course
      resetImage();
    });
  });
  
  /*
    Runs the moment an island needs to be loaded into the image.
    Draws the lit island, assuming the unlit island is already drawn below it.
  */
  function loadImage(island) {
    c.drawImage(island.image, 0, 0);
    
    c.lineWidth = 3;
    c.strokeStyle = "#fff";
    if(island.path){
      c.stroke(island.path);
    }
  }
  
  /*
    Runs when no islands need to be loaded into the image.
    Erases everything on the canvas and draws only the unlit island.
  */
  function resetImage() {
    c.clearRect(0, 0, canvas.width(), canvas.height());
    c.drawImage(worldmap["unlit"].image, 0, 0);
  }
  
};