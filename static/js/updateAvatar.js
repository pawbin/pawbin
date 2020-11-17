let $dropArea = $('#updateAvatar');

$dropArea.on('dragenter dragover dragleave drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

let counter = 0;
$dropArea.on('dragenter', () => {
  if(counter === 0){
    $dropArea.addClass('highlight');
  }
  counter++;
});

$dropArea.on('dragleave', () => {
  counter--;
  if(counter <= 0){
    $dropArea.removeClass('highlight');
  }
});

let selectedFile = false,
    droppedFile = false;

$dropArea.on('drop', (e) => {
  counter = 0;
  $dropArea.removeClass('highlight');
  
  droppedFile = [...e.originalEvent.dataTransfer.files].pop();
  if(droppedFile){
    selectedFile = false;
    handleFile(droppedFile);
  }
});

let $formInput = $('#updateAvatar input').eq(0);

$formInput.on('change', (e) => {
  selectedFile = [...e.target.files].pop();
  droppedFile = false;
  handleFile(selectedFile);
});

function handleFile(imageFile) {
  $('#updateAvatar label span').text(imageFile.name);
  previewImage(imageFile);
}

function previewImage(imageFile) {
  let fr = new FileReader();
  fr.readAsDataURL(imageFile);
  
  fr.onloadend = () => {
    let previewText = $('#updateAvatar .preview-changes .new-avatar p')[0];
    let previewDiv = ($(previewText).parent())[0];
    let previewImage = $('#updateAvatar .preview-changes .new-avatar img')[0];
    
    if(previewText) {
      previewText.remove();
    }
    if(!previewImage) {
      previewImage = document.createElement('img');
      previewDiv.appendChild(previewImage);
    }
    previewImage.src = fr.result;
  }
}

$('#updateAvatar').on('submit', function(e) {
  if(!selectedFile && !droppedFile){
    e.preventDefault();
    //FLASH ERROR
  } else if(!selectedFile && droppedFile){
    e.preventDefault();
    
    let validated = avatarValidate({avatar:droppedFile});
    if(validated !== true){
      notify({form: this.name, ...validated});
      return false;
    }
    
    let formData = new FormData();
    
    formData.append("avatar", droppedFile);
    
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        window.location.reload(true); 
      }
    }
    request.open("POST", "/updateavatar");
    request.send(formData);
  }
})
