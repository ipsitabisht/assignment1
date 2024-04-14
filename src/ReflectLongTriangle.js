class ReflectLongTriangle {
    constructor() {
      this.type = 'triangle';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.base = 0.3; // Base length in x direction
      this.height = 0.5; // Height in y direction
    }
  
    render() {
      var xy = this.position;
      var rgba = this.color;
      var base = this.base;
      var height = this.height;
  
      // Calculate vertices for the right triangle
      var vertices = [
        xy[0], xy[1],               // Bottom left corner
        xy[0] - base, xy[1],        // Bottom right corner
        xy[0], xy[1] - height       // Top left corner
      ];
  
      // Pass color to fragment shader
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
      // Draw the right triangle
      drawTriangle(vertices);
    }
  }
  
  function drawTriangle(vertices) {
    var n = vertices.length / 2; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, n);
  }