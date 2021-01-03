var keys = [];

//movement controls
var wKey = keys[87];
var upArrow = keys[38];

var sKey = keys[83];
var downArrow = keys[40];

var aKey = keys[65];
var leftArrow = keys[37];

var dKey = keys[68];
var rightArrow = keys[39];

var spaceKey = keys[32];

//For preventing zooming in and out on browser
var ctrlKey = keys[17];

var minusKey = keys[189];
var plusKey = keys[187];
var mozMinusKey = keys[173];
var mozPlusKey = keys[61];

function keyIsDown(key) {
  console.log("key: " + key + " isDown: " + keys[key.charCodeAt(0)]);
  return keys[key.charCodeAt(0)];
}

function keyHandle(code, isDown) {
  console.log("key: " + code, "isDown: " + isDown);
  keys[code] = isDown;

  //Prevents zooming
  if(ctrlKey && (minusKey || plusKey) || (mozMinusKey || mozPlusKey)) {
    event.preventDefault();
  }

  return ySpeed;

}
