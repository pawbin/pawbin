$(document).ready(function(){
  
  $('.validate').on('submit',function (e) {
    e.preventDefault();
    let validated = signupValidate(objectifyForm($(this).serializeArray()));
    if(validated !== true){
      //notify({form: this.name, ...validated});
      return false;
    }
    this.submit();
    /*$.ajax({
      type: 'post',
      url: 'signup2',
      data: $('#signup').serialize(),
      success: function () {
       //alert("Email has been sent!");
      }
    });*/
  });
  
})

function objectifyForm(formArray) {//serialize data function
  
  var returnArray = {};
  for (var i = 0; i < formArray.length; i++){
    returnArray[formArray[i]['name']] = formArray[i]['value'];
  }
  return returnArray;
}