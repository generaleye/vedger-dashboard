// Set the date we're counting up to
var countUpDate = new Date().getTime();

// Update the count up every 1 second
var x = setInterval(function() {

// Get today's date and time
var now = new Date().getTime();

// Find the distance between now and the count up datetime
var distance = now - countUpDate;

// Time calculations for days, hours, minutes and seconds
var days = Math.floor(distance / (1000 * 60 * 60 * 24));
var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
var seconds = Math.floor((distance % (1000 * 60)) / 1000);

// Output the result in an element with id
document.getElementById("countUpTimer").innerHTML = days + "d " + hours + "h "
+ minutes + "m " + seconds + "s ";

}, 1000);
