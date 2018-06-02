
// object of all islands
let worldmap = {
  unlit: {
    image: "https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2Fimage.png?1527557250917",
    hover: false
  },
  grassland: {
    image: "https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2FgrassLitTest.png?1527640898295",
    link: "https://pawbin.glitch.me/biome/grasslands",
    outline: [
      175,351,102,337,122,312,36,315,71,264,110,240,98,209,14,199,50,160,60,135,128,134,71,92,146,95,125,49,178,74,200,19,225,58,248,17,253,73,317,43,300,98,368,67,388,86,358,124,436,122,400,155,495,177,437,190,493,232,356,258,401,280,341,298,320,351,200,368     
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
  let canvas = $("#worldmap-canvas");
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