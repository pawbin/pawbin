(function(window){
  function validate(form, required){
    var all = false;
    if(!required){
      all = true
    }
    
    if((all || required.email) && !form.email){
      return({content: "Please include an email", type: "warn"})
    }
    if((all || required.username) && !form.username){
      return({content: "Please include a username", type: "warn"})
    }
    if((all || required.password) && !form.password){
      return({content: "Please include a password", type: "warn"})
    }
    if((all || required.confirmPassword) && !form.confirmPassword){
      return({content: "Please confirm password", type: "warn"})
    }
    
    if(form.password !== form.confirmPassword){
      return({content: "Passwords do not match", type: "warn"})
    }
    
    if((all || required.email) && !/\S+@\S+\.\S+/.test(form.email)){
      return({content: "That is not a valid email", type: "warn"})
    }
    if((all || required.username) && !/^\s*[^\s'"]{2,20}\s*$/.test(form.username)){
      return({content: "That username is invalid. Usernames must be at least 2 characters and cannot contain single or double quotes", type: "warn"})
    }
    if((all || required.password) && form.password.length < 5){
      return({content: "Password must be at least 5 characters", type: "warn"})
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