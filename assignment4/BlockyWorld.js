// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    attribute vec3 a_Normal;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    varying vec4 v_vertPos;
    uniform float u_Size;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
        v_Normal = a_Normal;
        v_vertPos = u_ModelMatrix * a_Position;
    }
`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform sampler2D u_Sampler3;
    uniform sampler2D u_Sampler4;
    uniform sampler2D u_Sampler5;
    uniform sampler2D u_Sampler6;
    uniform vec3 u_lightPos;
    varying vec4 v_vertPos;

    uniform int u_whichTexture;
    void main() {

      if (u_whichTexture == -3){
        gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
      } else if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
      } else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0,1.0);
      } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      } else if (u_whichTexture == 1){
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      } else if (u_whichTexture == 2){
        gl_FragColor = texture2D(u_Sampler2, v_UV);
      } else if (u_whichTexture == 3){
        gl_FragColor = texture2D(u_Sampler3, v_UV);
      } else if (u_whichTexture == 4){
        gl_FragColor = texture2D(u_Sampler4, v_UV);
      } else if (u_whichTexture == 5){
        gl_FragColor = texture2D(u_Sampler5, v_UV);
      } else if (u_whichTexture == 6){
        gl_FragColor = texture2D(u_Sampler6, v_UV);
      } else { 
        gl_FragColor = vec4(1,.2,.2,1);
      }

      vec3 lightVector = u_lightPos - vec3(v_vertPos);
      float r = length(lightVector);
      // if(r<1.0){
      //   gl_FragColor = vec4(1,0,0,1);
      // }else if (r<2.0){
      //   gl_FragColor = vec4(0,1,0,1);
      // }
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL  = max(dot(N,L), 0.0);
      // gl_FragColor = gl_FragColor * nDotL;
      // gl_FragColor.a  = 1.0;

      vec3 diffuse = vec3(gl_FragColor)* nDotL;
      vec3 ambient = vec3(gl_FragColor) * 0.3;
      gl_FragColor = vec4(diffuse + ambient, 1.0);


    }
`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler3;
let u_Sampler2;
let u_Sampler4
let u_Sampler5;
let u_Sampler6;
let u_whichTexture;
let a_Normal;
let u_lightPos;
// rotation
let g_rotateX = 0 
let g_rotateY = 0 
let mouseDown = false;
let lastX = null;
let lastY = null;

let gl_camera;

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }  



    gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log("Failed to get the storage location of a_UV");
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  if (a_Normal < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return; 
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return; 
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return; 
  }
    // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }
  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
    return false;
  }

  u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler6');
    return false;
  }


  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return false;
  }
 
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements)


    
}

function initTextures() {


  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendToTEXTURE0(image); };
  // Tell the browser to load an image
  image.src = 'sky1.jpg';


  var flowerImage = new Image();
  flowerImage.onload = function() {
      sendToTEXTURE1(flowerImage);
  
  };
  flowerImage.src = 'flower.jpg';

  var brickImage = new Image();
  brickImage.onload = function() {
      sendToTEXTURE2(brickImage);
     
  };
  brickImage.src = 'brick.jpg';

  var grass = new Image();
  grass.onload = function() {
      sendToTEXTURE3(grass);

  };
  grass.src = 'grass.jpg';


  var leaves2 = new Image();
  leaves2.onload = function() {
      sendToTEXTURE4(leaves2);

  };
  leaves2.src = 'leaves2.jpg';
  var bread = new Image();
  bread.onload = function() {
      sendToTEXTURE5(bread);

  };
  bread.src = 'bread.jpg';

  var lava = new Image();
  lava.onload = function() {
      sendToTEXTURE6(lava);

  };
  lava.src = 'lava.jpg';



  return true; 
}

function sendToTEXTURE0( image){
  var texture = gl.createTexture();
  if(!texture){
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler


  gl.uniform1i(u_Sampler0, 0);


  
  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

 
}


function sendToTEXTURE1( image){
  var texture = gl.createTexture();
  if(!texture){
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler


  gl.uniform1i(u_Sampler1, 1);


  
  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

 
}

function sendToTEXTURE2( image){
  var texture = gl.createTexture();
  if(!texture){
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler


  gl.uniform1i(u_Sampler2, 2);


  
  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

 
}

function sendToTEXTURE3( image){
  var texture = gl.createTexture();
  if(!texture){
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE3);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler


  gl.uniform1i(u_Sampler3, 3);


  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

}


function sendToTEXTURE4( image){
  var texture = gl.createTexture();
  if(!texture){
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE4);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler


  gl.uniform1i(u_Sampler4, 4);

  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

}

function sendToTEXTURE5( image){
  var texture = gl.createTexture();
  if(!texture){
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE5);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler


  gl.uniform1i(u_Sampler5, 5);


  
  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

}


function sendToTEXTURE6( image){
  var texture = gl.createTexture();
  if(!texture){
    console.log("Failed to create the texture object");
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE6);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler


  gl.uniform1i(u_Sampler6, 6);


  
  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

}




const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 10;
let g_globalAngle = 0; 
let g_yellowAngle = 0; 
let g_magentaAngle = 0;
let g_tailAngle = 0
let g_tailAnimation = false; 
let g_yellowAnimation = false;
let g_magentaAnimation = false;

let g_fin1Angle= 0
let g_fin2Angle = 0
let g_fin1Animation = false;
let g_fin2Animation = false ;

let g_midtailAngle = 0
let g_midtailAnimation = false; 

let g_tailFinAngle = 0
let g_tailFinAnimation = false; 
let poke = false;

let g_animation = false;

let g_normalOn = false; 
let g_normalOff = false; 

let g_lightPos = [0,1, -2]

function addActionsForHTMLUI(){

    document.getElementById('normalOn').onclick = function() {g_normalOn = true};
    document.getElementById('normalOff').onclick = function() {g_normalOff = false}
    document.getElementById('animationOn').onclick= function() {g_animation = true};
    document.getElementById('animationOff').onclick= function() {g_animation = false};

    document.getElementById('angleSlider').addEventListener('mousemove', function(){ g_globalAngle = this.value, renderAllShapes()})
    document.getElementById('lightSliderX').addEventListener('mousemove', function(ev){if(ev.buttons ==1 ) {g_lightPos[0] = this.value/100; renderAllShapes()}})
    document.getElementById('lightSliderY').addEventListener('mousemove', function(ev){if(ev.buttons ==1 ) {g_lightPos[1] = this.value/100; renderAllShapes()}})
    document.getElementById('lightSliderZ').addEventListener('mousemove', function(ev){if(ev.buttons ==1 ) {g_lightPos[2] = this.value/100; renderAllShapes()}})
    //document.getElementById('sizeSlider').addEventListener('mouseup', function(){ g_selectedSize = this.value})
}
 
function main() {

    setupWebGL()
    connectVariablesToGLSL()


    // set up for ui 
    addActionsForHTMLUI()
    document.onkeydown = keydown;

    gl_camera  = new Camera(canvas.width/canvas.height, 0.1, 1000);

    initTextures()

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    // canvas.addEventListener('mousemove', function(ev) {rotateView(ev)});
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev) }}; 
    

  


    // Specify the color for clearing <canvas>
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearColor(0.0, 0.25, 0.5, 1.0); 

    requestAnimationFrame(tick)
}

var g_startTime = performance.now()/1000.0
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {

  g_seconds=performance.now()/1000.0-g_startTime;
  // console.log(performance.now());

  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

function keydown(ev){
  const speed = 0.02; // Adjust speed as needed

  switch(ev.keyCode) {
      case 87: // W
          gl_camera.moveForward(speed);
          break;
      case 83: // S
          gl_camera.moveBackwards(speed);
          break;
      case 68: // D
          gl_camera.moveRight(speed);
          break;
      case 65: // A
          gl_camera.moveLeft(speed);
          break;
      case 69: // E
          gl_camera.panRight(1); 
          break;
      case 81: // Q
          gl_camera.panLeft(1);
          break;
  }

  gl_camera.updateView();
  renderAllShapes();
  //   //gl_camera.updateView();
  // }


  // gl_camera.updateView();

  // // switch(ev.key) {



  // renderAllShapes();
  // console.log(ev.keyCode);
}



function updateAnimationAngles() {

  if (g_animation){
    g_yellowAngle = (6*Math.sin(g_seconds))
    g_magentaAngle = (20*Math.sin(g_seconds));
    g_tailAngle = (8*Math.sin(g_seconds));
    g_fin1Angle = (8*Math.sin(3*g_seconds));
    g_fin2Angle = (8*Math.sin(3*g_seconds));
    g_tailFinAngle = (8*Math.cos(g_seconds));
    g_midtailAngle = (8*Math.sin(g_seconds));

  }
  if (g_yellowAnimation){
    g_yellowAngle = (6*Math.sin(g_seconds))
  }

  if (g_magentaAnimation){
    g_magentaAngle = (20*Math.sin(g_seconds));
  }
  if (g_tailAnimation){
    g_tailAngle = (8*Math.sin(g_seconds));
  }
  if (g_fin1Animation){
    g_fin1Angle = (8*Math.sin(3*g_seconds));
  }
  if (g_fin2Animation){
    g_fin2Angle = (8*Math.sin(3*g_seconds));
  }
  if (g_tailFinAnimation){
    g_tailFinAngle = (8*Math.cos(g_seconds));
  }
  if (g_midtailAnimation){
    g_midtailAngle = (8*Math.sin(g_seconds));
  }

  if (poke){

    g_fin2Angle = (8*Math.cos(3*g_seconds));
    g_yellowAngle = (6*Math.cos(2*g_seconds))
    g_magentaAngle = (6*Math.cos(2*g_seconds))
    // g_tailFinAngle = -30*Math.sin(g_seconds*10)+30
    

  }

  g_lightPos[0] = Math.cos(g_seconds);
}



var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []


function click(ev) {
    let [x,y] = convertCoordinatesEventToGL(ev);
    if(ev.shiftKey && !poke){

      poke = true;
      return;
    } else if(ev.shiftKey && poke){

        poke = false;
        return;
    }

    canvas.onmousedown = function (event){
      
      
      mouseDown = true;
      lastX = event.clientX;
      lastY = event.clientY


    }

    
    canvas.onmouseup = function() {
      mouseDown = false;
    }

    canvas.onmousemove = function(event) {
      if (!mouseDown){
        return
      }
      let deltaX = event.clientX - lastX;
      let deltaY = event.clientY - lastY;
      g_rotateY += deltaX * 0.35;
      g_rotateX = Math.max(-90, Math.min(90, g_rotateX + deltaY * 0.35));
      lastX = event.clientX;
      lastY = event.clientY;
      renderAllShapes()

    }



  }

  function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x,y])

  }

  var g_map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,0,4,0,0,0,4,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,0,4,0,0,0,4,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,0,0,4,4,4,4,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,0,0,0,4,4,4,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,0,0,4,4,4,4,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,3,0,1,1,1,1,0,0,4,4,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,3,0,3,0,3,0,3,0,3,0,3,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,4,1,1,1,1,0,3,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,4,4,4,4,1,4,4,4,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,4,4,4,1,4,4,0,0,3,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,4,4,4,4,1,4,4,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,4,4,4,4,4,1,4,4,0,0,3,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
  ];

  function drawMap(){
    
    var body = new Cube();
    var body2 = new Cube();
    var body3 = new Cube();
    
    for(x=0;x<32;x++){
      for(y=0;y<32;y++){
        if (g_map[x][y]==1){
          // for(z = 0; z < 5; z++){ 
            // var body = new Cube();
            body.color = [0.8, 1.0, 1.0, 1.0];
            body.matrix.setTranslate(-0.5,-0.75, 0);
            body.matrix.scale(0.5, 3.5, 0.4)
            body.textureNum=4;
            body.matrix.translate(x-4,0, y-4);
            // body.matrix.translate(x - 4, z * 0.5, y - 4);
            body.render();
          // }
        }
        if (g_map[x][y]==3){



          body2.color = [0.8, 0.8, 0.0, 1.0];
          body2.matrix.setTranslate(-0.5,-0.75, 0);
          body2.matrix.scale(0.4, 0.4, 0.4)
          body2.textureNum=5;
  
          body2.matrix.translate(x-4,0, y-4);
          body2.render();
        }

        if (g_map[x][y]==4){



          body3.color = [0.8, 0.8, 0.0, 1.0];
          body3.matrix.setTranslate(-0.5,-0.75, 0);
          body3.matrix.scale(0.5, 0.5, 0.5)
          body3.textureNum=6;
  
          body3.matrix.translate(x-4,0, y-4);
          body3.render();
        }

      }
    }
  }


 



  function renderAllShapes(){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var startTime = performance.now();




    var slideGlobalMatrix = new Matrix4().rotate(g_globalAngle,0,1,0);

    //var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    var globalRotMat = new Matrix4()
    globalRotMat.rotate(g_rotateX,1,0,0);
    globalRotMat.rotate(g_rotateY,0,1,0);
    //gl. uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    var finalRotMat = slideGlobalMatrix.multiply(globalRotMat);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, finalRotMat.elements);


    // var viewMatrix = new Matrix4();
    // viewMatrix.setLookAt(0,0,1.55, 0,0,-100, 0,1,0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, gl_camera.viewMatrix.elements);
    // var projectionMatrix = new Matrix4();
    // projectionMatrix.setPerspective(90, canvas.width/canvas.height, .1, 100); // near plane
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, gl_camera.projectionMatrix.elements);



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.clear(gl.COLOR_BUFFER_BIT)

    // drawMap();




    var ground = new Cube();
    ground.color = [0.1,0.6,0.2,1.0];
    ground.textureNum = 3;
    ground.matrix.translate(0, -.75, 0.0);
    ground.matrix.scale(32,0,32);
    ground.matrix.translate(-.5, 0, -.5);
    ground.render();

    var sky = new Cube();
    sky.color = [0.0,0.0,5,1.0];

    if (g_normalOn){
      sky.textureNum=-3;
    }
    sky.matrix.scale(-5,-5,-5);
    // sky.matrix.translate(-0.5, 0, 0);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

    var light = new Cube();
    light.color = [2,2,0,1];
    light.matrix.translate(g_lightPos[0],g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(.1,.1,.1);
    light.matrix.translate(-.5,-.5,-.5);
    light.render();
    // seal body
    var leftArm = new Cube();
    leftArm.color = [0.6,0.9,0.9,1];
    if (g_normalOn){
      leftArm.textureNum=-3;
    }
    //leftArm.matrix = tailCoords;
    // leftArm.matrix.setTranslate(0, -.5, 0);
    leftArm.matrix.rotate(-90, 9, 0, 0);
    if(poke){
      leftArm.matrix.rotate(g_yellowAngle,0,0,1)

    }
    leftArm.matrix.rotate(45,0,0,1)
    var yellowCoordinates = new Matrix4(leftArm.matrix);
    var bodyCoordinates = new Matrix4(leftArm.matrix)
    var bodyCoordinates2 = new Matrix4(leftArm.matrix)
    var tailCoords = new Matrix4(leftArm.matrix)
    leftArm.matrix.scale(0.5, 0.5, 0.5);
    leftArm.matrix.translate(-0.5, 0.0, 0.0);
    leftArm.render();

    var ball = new Sphere();
    if (g_normalOn){
      ball.textureNum=-3;
    }
    ball.matrix.translate(0.5, 0.5, 0.5);
    ball.matrix.scale(0.2, 0.2, 0.2)
    ball.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot")
}




function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElm.innerHTML = text;
}