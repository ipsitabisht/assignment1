// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform float u_Size;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }
`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform sampler2D u_Sampler2;
    uniform int u_whichTexture;
    void main() {

      if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
      } else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0,1.0);
      } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
      } else if (u_whichTexture == 1){
        gl_FragColor = texture2D(u_Sampler1, v_UV);
      } else if (u_whichTexture == 2){
        gl_FragColor = texture2D(u_Sampler2, v_UV);
      } else { 
        gl_FragColor = vec4(1,.2,.2,1);
      }
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
let u_whichTexture;
// rotation
let g_rotateX = 0 
let g_rotateY = 0 
let mouseDown = false;
let lastX = null;
let lastY = null;

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

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_Sampler0');
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
  image.onload = function(){ sendToTEXTURE0(image); console.log("hi")};
  // Tell the browser to load an image
  image.src = 'sky.jpg';


  var flowerImage = new Image();
  flowerImage.onload = function() {
      sendToTEXTURE1(flowerImage);
      console.log("hi2") // Function to handle loading the texture
  };
  flowerImage.src = 'flower.jpg';

  var brickImage = new Image();
  brickImage.onload = function() {
      sendToTEXTURE2(brickImage);
      console.log("hi3") // Function to handle loading the texture
  };
  brickImage.src = 'brick.jpg';


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

  console.log("finished loading")
  
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

  console.log("finished loading 2")
  
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

  console.log("finished loading 3")
  
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
function addActionsForHTMLUI(){


    document.getElementById('animationYellowOnButton').onclick= function() {g_yellowAnimation = true};
    document.getElementById('animationYellowOffButton').onclick= function() {g_yellowAnimation = false};
    document.getElementById('yellowSlider').addEventListener('mousemove', function(){ g_yellowAngle = this.value, renderAllShapes()})

    document.getElementById('animationMagentaOnButton').onclick= function() {g_magentaAnimation = true};
    document.getElementById('animationMagentaOffButton').onclick= function() {g_magentaAnimation = false};
    document.getElementById('magentaSlider').addEventListener('mousemove', function(){ g_magentaAngle = this.value, renderAllShapes()})


    document.getElementById('animationTailOnButton').onclick= function() {g_tailAnimation = true};
    document.getElementById('animationTailOffButton').onclick= function() {g_tailAnimation = false};
    document.getElementById('tailSlider').addEventListener('mousemove', function(){ g_tailAngle = this.value, renderAllShapes()})

    document.getElementById('animationmidTailOnButton').onclick= function() {g_midtailAnimation = true};
    document.getElementById('animationmidTailOffButton').onclick= function() {g_midtailAnimation = false};
    document.getElementById('midtailSlider').addEventListener('mousemove', function(){ g_midtailAngle = this.value, renderAllShapes()})

    document.getElementById('animationTailFinOnButton').onclick= function() {g_tailFinAnimation = true};
    document.getElementById('animationTailFinOffButton').onclick= function() {g_tailFinAnimation = false};
    document.getElementById('tailFinSlider').addEventListener('mousemove', function(){ g_tailFinAngle = this.value, renderAllShapes()})

    document.getElementById('animationfin1OnButton').onclick= function() {g_fin1Animation = true};
    document.getElementById('animationfin1OffButton').onclick= function() {g_fin1Animation = false};
    document.getElementById('fin1Slider').addEventListener('mousemove', function(){ g_fin1Angle = this.value, renderAllShapes()})

    document.getElementById('animationfin2OnButton').onclick= function() {g_fin2Animation = true};
    document.getElementById('animationfin2OffButton').onclick= function() {g_fin2Animation = false};
    document.getElementById('fin2Slider').addEventListener('mousemove', function(){ g_fin2Angle = this.value, renderAllShapes()})

    document.getElementById('animationOn').onclick= function() {g_animation = true};
    document.getElementById('animationOff').onclick= function() {g_animation = false};

    document.getElementById('angleSlider').addEventListener('mousemove', function(){ g_globalAngle = this.value, renderAllShapes()})

    //document.getElementById('sizeSlider').addEventListener('mouseup', function(){ g_selectedSize = this.value})
}
 
function main() {

    setupWebGL()
    connectVariablesToGLSL()


    // set up for ui 
    addActionsForHTMLUI()

    initTextures()

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
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
    console.log("Poking")
    g_fin2Angle = (8*Math.cos(3*g_seconds));
    g_yellowAngle = (6*Math.cos(2*g_seconds))
    g_magentaAngle = (6*Math.cos(2*g_seconds))
    // g_tailFinAngle = -30*Math.sin(g_seconds*10)+30
    

  }
}



var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []


function click(ev) {
    let [x,y] = convertCoordinatesEventToGL(ev);
    if(ev.shiftKey && !poke){
      console.log("poke")
      poke = true;
      return;
    } else if(ev.shiftKey && poke){
      console.log("unpoke")
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
      g_rotateY += deltaX * 0.1;
      g_rotateX = Math.max(-90, Math.min(90, g_rotateX + deltaY * 0.1));
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


  var g_eye = [0,0,3];
  var g_at = [0,0,-100];
  var g_up = [0,1,0]

  function renderAllShapes(){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var startTime = performance.now();


    var slideGlobalMatrix = new Matrix4().rotate(g_globalAngle,0,1,0);

    //var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    var globalRotMat = new Matrix4()
    globalRotMat.rotate(g_rotateX,1,0,0);
    globalRotMat.rotate(g_rotateY,0,1,0);
    //gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    var finalRotMat = slideGlobalMatrix.multiply(globalRotMat);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, finalRotMat.elements);


    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0,0,1.55, 0,0,-100, 0,1,0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    var projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(90, canvas.width/canvas.height, .1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMatrix.elements);



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.clear(gl.COLOR_BUFFER_BIT)



    var ground = new Cube();
    ground.color = [0.1,0.6,0.2,1.0];
    ground.textureNum = -2;
    ground.matrix.translate(0, -.75, 0.0);
    ground.matrix.scale(10,0,10);
    ground.matrix.translate(-.5, 0, -.5);
    ground.render();

    var sky = new Cube();
    sky.color = [1.0,0.0,0.0,1.0];
    sky.textureNum=0;
    sky.matrix.scale(3,3,3);
    // sky.matrix.translate(-0.5, 0, 0);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

    var obj = new Cube();
    obj.color = [1.0,0.0,0.0,1.0];
    obj.textureNum=1;
    obj.matrix.scale(0.5,0.5,0.5);
    obj.matrix.translate(-0.5, 1, 1);
    obj.render();

    var obj2 = new Cube();
    obj2.color = [1.0,0.7,0.0,1.0];
    obj2.textureNum=-2;
    obj2.matrix.scale(0.5,0.5,0.5);
    obj2.matrix.translate(-0.5, -1.5, -1.5);
    obj2.render();

    var obj3 = new Cube();
    obj3.color = [1.0,0.7,0.0,1.0];
    obj3.textureNum=2;
    obj3.matrix.scale(0.5,0.5,0.5);
    obj3.matrix.translate(1.5, -1, -1);
    obj3.render();

    // seal body
    var leftArm = new Cube();
    leftArm.color = [0.6,0.9,0.9,1];
    //leftArm.matrix = tailCoords;
    // leftArm.matrix.setTranslate(0, -.5, 0);
    leftArm.matrix.rotate(-90, 9, 0, 0);
    if(poke){
      leftArm.matrix.rotate(g_yellowAngle,0,0,1)

    }
    leftArm.matrix.rotate(g_yellowAngle,1,0,0)
    var yellowCoordinates = new Matrix4(leftArm.matrix);
    var bodyCoordinates = new Matrix4(leftArm.matrix)
    var bodyCoordinates2 = new Matrix4(leftArm.matrix)
    var tailCoords = new Matrix4(leftArm.matrix)
    leftArm.matrix.scale(0.5, 0.6, 0.4);
    leftArm.matrix.translate(-0.5, 0.0, 0.0);
    leftArm.render();


    var fin1 = new Cube();
    fin1.color = [0.7,1,1,1];
    fin1.matrix = bodyCoordinates;
    fin1.matrix.rotate(g_fin1Angle, 0, 1,0 );
    fin1.matrix.scale(0.23, 0.2,0.03);
    fin1.matrix.translate(-2, 1.5, 1) // x, shift left or right  y: shift forward or back, z shift up or down 

    fin1.render();

    var fin2 = new Cube();
    fin2.color = [0.7,1,1,1];
    fin2.matrix = bodyCoordinates2
    fin2.matrix.rotate(g_fin2Angle, 0, 1,0);
    fin2.matrix.scale(0.2, 0.2, 0.03);
    fin2.matrix.translate(1.2, 1.3, 1);

    fin2.render();
    // head

    var box = new Cube();
    box.color = [0.7,1,1,1];
    box.matrix = yellowCoordinates
    box.matrix.translate(0, 0.65, 0)
    if(poke){
      leftArm.matrix.rotate(g_magentaAngle,1,0,0)

    }
    box.matrix.rotate(g_magentaAngle, 0, 0, 1);
    var headCoordinates = new Matrix4(box.matrix);
    var eye1coord = new Matrix4(box.matrix);
    var eye2coord = new Matrix4(box.matrix);
    box.matrix.scale(.3, .3, .3);
    box.matrix.translate(-.5,-0.5, 0.2);
    box.render();


    // nose
    var prism = new TrianglePrism();
    prism.color =  [0.7,0.7,0,1];
    prism.matrix = headCoordinates;
    prism.matrix.scale(0.2, 0.8, 0.2);
    prism.matrix.translate(0.5, 0, 0.7);
    prism.matrix.rotate(180,0,1,0)
    prism.matrix.rotate(-90,1,0,0)
    prism.render();

      // eyes
      var lefteye = new Cube();
      lefteye.color = [0,0,0,1]
      lefteye.matrix = eye1coord
      lefteye.matrix.translate(0, 0, 0.1)
      lefteye.matrix.rotate(0, 0, 0, 1);
      lefteye.matrix.scale(0.05, 0.05, 0.05);
      lefteye. matrix.translate(-2.5, 2.4, 1);
      lefteye.render();
  
      var righteye = new Cube();
  
      righteye.color = [0,0,0,1]
      righteye.matrix = eye2coord
      righteye.matrix.translate(0.08,0.12,0.153)
      righteye.matrix.scale(0.047, 0.047, 0.047);
      righteye.render();

    var tail = new Cube();
    tail.color = [0.5,0.8,0.8,1];
    // tail.matrix =tail2Coords;
    tail.matrix = tailCoords;
    // tail.matrix.rotate(0, 1, 0, 0);
    tail.matrix.rotate(-g_tailAngle,1,0,0)
    var tail2coords = new Matrix4(tail.matrix);
    //var tailCoords = new Matrix4(tail.matrix);
    tail.matrix.scale(0.42, 0.38, 0.38);
    tail.matrix.translate(-0.5, -0.5, 0); // x moves l r , y moves back and forward, z moves up and down 
    tail.render();


    var tail2 = new Cube();
    tail2.color = [0.5,0.7,0.8,1];
    tail2.matrix = tail2coords;
    tail2.matrix.rotate(-g_midtailAngle,1,0,0)
    var tail3coords = new Matrix4(tail2.matrix);
    tail2.matrix.scale(0.40, 0.35, 0.3);
    tail2.matrix.translate(-0.5, -1, 0.0);
    tail2.render();


    var tail3 = new Cube();
    tail3.color = [0.5,0.6,0.8,1];
    tail3.matrix = tail3coords;
    // tail3.matrix.rotate(-g_tailAngle,1,0,0)
    tail3.matrix.rotate(-g_tailFinAngle, 0, 1, 0);
    var tail4Coords = new Matrix4(tail3.matrix);
    var tail5Coords = new Matrix4(tail3.matrix);

    tail3.matrix.scale(0.3, 0.2, 0.2);
    tail3.matrix.translate(-0.5, -2.5 , 0.0);
    tail3.render();


    var tail4 = new Cube();
    tail4.color = [0.4,0.5,0.7,1];
    tail4.matrix = tail4Coords;
    tail4.matrix.rotate(20,0,0,1)
    tail4.matrix.rotate(-g_tailAngle,1,0,0)
    tail4.matrix.scale(0.12, 0.32, 0.06);
    tail4.matrix.translate(-1.4, -2.3, 0.7);
    tail4.render();

    var tail5 = new Cube();
    tail5.color = [0.4,0.5,0.7,1];
    tail5.matrix = tail5Coords;
    tail5.matrix.rotate(-20,0,0,1)
    tail5.matrix.rotate(-g_tailAngle,1,0,0)
    tail5.matrix.scale(0.12, 0.32, 0.06);
    tail5.matrix.translate(0.3, -2.3, 0.7);

    tail5.render();










 
    
    








    
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot")
}


function createHouse() {
  // Clear existing shapes
  g_shapesList = [];


  // chimney

  let chimney = new ReflectLongTriangle(); 
  chimney.position = [-0.15, 0.5]; 
  chimney.base = 0.2;
  chimney.height = 0.5;
  chimney.color = [0.2, 0.15, 0.2, 0.7]; 
  chimney.size = 30.0;
  g_shapesList.push(chimney);

  let chimney2 = new LongTriangle(); 
  chimney2.position = [-0.35, 0.0]; 
  chimney2.base = 0.2;
  chimney2.height = 0.5;
  chimney2.color = [0.2, 0.15, 0.2, 0.8]; 
  chimney2.size = 30.0;
  g_shapesList.push(chimney2);

  // Roof 
  let roof = new Triangle();
  roof.position = [0.0,0.1]; 
  roof.color = [0.8, 0.2, 0.2, 1.0]; 
  roof.size = 95.0; 
  g_shapesList.push(roof);

  let roof1 = new ReflectTriangle();
  roof1.position = [0.0, 0.1]; 
  roof1.color = [0.8, 0.2, 0.2, 1.0]; 
  roof1.size = 95.0; 
  g_shapesList.push(roof1);

  // Walls 
  let leftWall = new Triangle();
  leftWall.position = [-0.4, -0.7]; 
  leftWall.color = [0.7, 0.5, 0.3, 1.0];
  leftWall.size = 160.0; 
  g_shapesList.push(leftWall);

  

  let rightWall = new FlipTriangle();
  rightWall.position = [0.4, 0.1];
  rightWall.color = [0.7, 0.5, 0.3, 1.0]; 
  rightWall.size = 160.0; 
  g_shapesList.push(rightWall);


  //windows
  // Walls (rectangles)
  let window1 = new Triangle();
  window1.position = [-0.095, -0.15];
  window1.color = [0.1, 0.1, 0.4, 0.7]; 
  window1.size = 39; 
  g_shapesList.push(window1);

  

  let window2 = new FlipTriangle();
  window2.position = [0.095, 0.05]; 
  window2.color = [0.1, 0.1, 0.4, 0.5];
  window2.size = 39;
  g_shapesList.push(window2);


  // Door (long rectangle)
  let door1 = new ReflectLongTriangle();
  door1.position = [0.15, -0.2]; 
  door1.base = 0.3;
  door1.height = 0.5;
  door1.color = [0.3, 0.2, 0.1, 1.0]; 
  door1.size = 50.0; 
  g_shapesList.push(door1);

  let door2 = new LongTriangle(); 
  door2.position = [-0.15, -0.7]; 
  door2.base = 0.3;
  door2.height = 0.5;
  door2.color = [0.1, 0.1, 0.1, 1.0]; 
  door2.size = 50.0; 
  g_shapesList.push(door2);


  // lawn 
  let lawn = new ReflectLongTriangle();
  lawn.position = [1, -0.7];
  lawn.base = 2;
  lawn.height = 0.3;
  lawn.color = [0.1, 0.5, 0.1, 1.0]; 
  lawn.size = 50.0; 
  g_shapesList.push(lawn);

  let lawn2 = new LongTriangle(); 
  lawn2.position = [-1, -1.0];
  lawn2.base = 2;
  lawn2.height = 0.3;
  lawn2.color = [0.1, 0.4, 0.1, 1.0]; 
  lawn2.size = 50.0; 
  g_shapesList.push(lawn2);


  // grass 
  var blades = 30;

  for (var i = 0; i <= blades; i ++){

      let grass = new Triangle();
      grass.position = [-1 + (i /10), -0.7]; 
      grass.color = [0.1, 0.5, 0.1, 1.0]; 
      grass.size = 20; 
      g_shapesList.push(grass);

  }
}



function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElm.innerHTML = text;
}