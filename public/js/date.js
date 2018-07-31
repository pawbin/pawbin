$(document).ready( function() {
  updateTime();
  setInterval( function(){
    updateTime();
  }, 1000);
});
  
function updateTime(){
  let $dateLocation = $("#header-date");
  let $timeLocation = $("#header-time");
  let offset = -8,
      globalDate = Date.now() + (offset*1000*60*60),
      date = moment.utc(globalDate);
  
  $dateLocation.text(date.format("MMMM D YYYY"));
  $timeLocation.text(date.format("hh:mm a"));
  
  if(((globalDate / (60 * 60 * 1000)) % 48) < 24){
    $("#nychthemericon").attr("src", 'https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2Fsun.svg');
  } else {
    $("#nychthemericon").attr("src", 'https://cdn.glitch.com/5dce4cb1-f48b-44b6-92cc-e338cf68eb7f%2Fmoon.svg');
  }
}