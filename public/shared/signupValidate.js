(function(window){
  function validate(form, required){
    var all = false;
    if(!required){
      all = true
    }
    
    if((required.email || all) && form.email === ""){
      return({content: "Please include an email", type: "warn"})
    }
    if((required.username || all) && form.username === ""){
      return({content: "Please include a username", type: "warn"})
    }
    if((required.password || all) && form.password === ""){
      return({content: "Please include a password", type: "warn"})
    }
    if((required.confirmPassword || all) && form.confirmPassword === ""){
      return({content: "Please confirm password", type: "warn"})
    }
    

    if(form.password !== form.confirmPassword){
      return({content: "Passwords do not match", type: "warn"})
    }
    

    if((required.email || all) && !/\S+@\S+\.\S+/.test(form.email)){
      return({content: "That is not a valid email", type: "warn"})
    }
    if((required.username || all) && !/^\s*[^\s'"]{2,20}\s*$/.test(form.username)){
      return({content: "That username is invalid. Usernames must be at least 2 characters and cannot contain single or double quotes", type: "warn"})
    }
    if((required.password || all) && form.password.length < 6){
      return({content: "Password must be at least 6 characters", type: "warn"})
    }

    //validation successful
    return true;
  };
  
  if ( typeof module === 'object' && module && typeof module.exports === 'object' ) {
    module.exports = validate;
  } else {
    window.signupValidate = validate;
  }
})( this );