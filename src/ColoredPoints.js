// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        //gl_PointSize = 10.0;
        gl_PointSize = u_Size;

    }
`

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';
// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

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

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

    // Get the storage location of u_FragColor
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
    
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 10;
function addActionsForHTMLUI(){

    document.getElementById('green').onclick = function() { g_selectedColor= [0.0,1.0,0.0,1.0]}
    document.getElementById('red').onclick = function() { g_selectedColor= [1.0,0.0,0.0,1.0]}
    document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes()}
    document.getElementById('imageButton').addEventListener('click', function() {
        createHouse(); 
        renderAllShapes(); 
    });


    document.getElementById('pointButton').onclick= function() {g_selectedType=POINT};
    document.getElementById('triangleButton').onclick= function() {g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick= function() {g_selectedType=CIRCLE };

    document.getElementById('greenSlide').addEventListener('mouseup', function(){ g_selectedColor[1] = this.value/100})
    document.getElementById('redSlide').addEventListener('mouseup', function(){ g_selectedColor[0] = this.value/100})
    document.getElementById('blueSlide').addEventListener('mouseup', function(){ g_selectedColor[2] = this.value/100})
    
    document.getElementById('segmentSlider').addEventListener('mouseup', function(){ g_selectedSegment = this.value})

    document.getElementById('sizeSlider').addEventListener('mouseup', function(){ g_selectedSize = this.value})
}
 
function main() {

    setupWebGL()
    connectVariablesToGLSL()


    // set up for ui 
    addActionsForHTMLUI()

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev) }}; 



    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}



var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []

function createHouse() {
    let house = new Triangle();
    house.position = [0.0, 0.0]; // Starting position for the house

    // Roof (triangle)
    let roof = new Triangle();
    roof.position = [0.0, 0.5]; // Position the roof on top of the house
    roof.color = [1.0, 1.0, 0.0, 1.0]; // Yellow color
    g_shapesList.push(roof);

    // Walls (rectangles)
    let wall1 = new Triangle();
    wall1.position = [-0.5, 0.5]; // Position the left wall
    wall1.color = [0.0, 0.0, 1.0, 1.0]; // Blue color
    g_shapesList.push(wall1);

    let wall2 = new Triangle();
    wall2.position = [-0.5, -0.5]; // Position the bottom wall
    wall2.color = [0.0, 0.0, 1.0, 1.0]; // Blue color
    g_shapesList.push(wall2);

    let wall3 = new Triangle();
    wall3.position = [0.5, -0.5]; // Position the right wall
    wall3.color = [0.0, 0.0, 1.0, 1.0]; // Blue color
    g_shapesList.push(wall3);

    // Door (rectangle)
    let door = new Triangle();
    door.position = [-0.1, -0.5]; // Position the door
    door.color = [0.5, 0.2, 0.0, 1.0]; // Brown color
    g_shapesList.push(door);
}

function click(ev) {
    let [x,y] = convertCoordinatesEventToGL(ev);

    // create and store the new point
    // let point = new Point();
    // point.position=[x,y];
    // point.color=g_selectedColor.slice();
    // point.size=g_selectedSize;
    // g_shapesList.push(point);


    let point;

    if (g_selectedType==POINT){
        point = new Point();

    } else if (g_selectedType==TRIANGLE){
        point = new Triangle();
    } else{
        point = new Circle();
        point.segments=g_selectedSegment;
    }
    point.position=[x,y];
    point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);



    renderAllShapes()


  }

  function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return ([x,y])

  }



  function renderAllShapes(){
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var startTime = performance.now();

    // var len = g_points.length;
    var len = g_shapesList.length;
    
    for(var i = 0; i < len; i++) {


        g_shapesList[i].render()

    }

    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot")
}


function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElm.innerHTML = text;
}