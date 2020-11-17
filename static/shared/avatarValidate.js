(function(window){
  function validate(form, required){
    var all = false;
    if(!required){
      all = true
    }
    
    if(form.avatar && form.avatar.type){
      form.avatar.mimetype = form.avatar.type
    }
    if(form.avatar && form.avatar.buffer){
      form.avatar.size = form.avatar.buffer.toString().length; //length in bytes
    }
    
    if((all || required.avatar) && !form.avatar){
      return({content: "Please include an image", type: "warning"});
    }
    if((all || required.avatar) && (!form.avatar.mimetype || !form.avatar.size)){
      return({content: "Invalid image", type: "danger"});
    }
    
    if((all || required.avatar) && (!form.avatar.mimetype || !/^image\/.*/.test(form.avatar.mimetype))){
      return({content: "Please upload a valid image file (such as .png or .jpg)", type: "danger"});
    }
    if((all || required.avatar) && (!form.avatar.size || form.avatar.size > 2*(2**20))){ //2 megabytes
      return({content: "Image too large (must be smaller than 2MB)", type: "danger"});
    }
    
    //validation successful
    return true;
  };
  
  if ( typeof module === 'object' && module && typeof module.exports === 'object' ) {
    module.exports = validate;
  } else {
    window.avatarValidate = validate;
  }
})( this );