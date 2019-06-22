//main();

var gearData, vertices = [], colors = [], normals = [], verticesList = [], colorsList = [], normalsList = [];
var outerGearVertices = [], outerGearColors = []; outerGearNormals = [];
var middleGearVertices = [], middleGearColors = []; middleGearNormals = [];
var innerGearVertices = [], innerGearColors = []; innerGearNormals = [];
var light = 0;
function makeGear(numTeeth, numSpokes, gearType) {

  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl', { antialias: true });

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }


  var angle_x = 0;
  var angle_y = 0;
  var angle_z = 0;


  // Vertex shader program, runs on GPU, once per vertex

  const vsSource = `
  // Vertex Shader
  precision mediump int;
  precision mediump float;

  // Scene transformations
  uniform mat4 u_PVM_transform; // Projection, view, model transform
  uniform mat4 u_VM_transform;  // View, model transform

  // Light model
  uniform vec3 u_Light_position;
  uniform vec3 u_Light_color;
  uniform float u_Shininess;
  uniform vec3 u_Ambient_color;

  // Original model data
  attribute vec3 a_Vertex;
  attribute vec3 a_Color;
  attribute vec3 a_Vertex_normal;

  // Data (to be interpolated) that is passed on to the fragment shader
  varying vec3 v_Vertex;
  varying vec4 v_Color;
  varying vec3 v_Normal;

  void main() {

    // Perform the model and view transformations on the vertex and pass this
    // location to the fragment shader.
    v_Vertex = vec3( u_VM_transform * vec4(a_Vertex, 1.0) );

    // Perform the model and view transformations on the vertex's normal vector
    // and pass this normal vector to the fragment shader.
    v_Normal = vec3( u_VM_transform * vec4(a_Vertex_normal, 0.0) );

    // Pass the vertex's color to the fragment shader.
    v_Color = vec4(a_Color, 1.0);

    // Transform the location of the vertex for the rest of the graphics pipeline
    gl_Position = u_PVM_transform * vec4(a_Vertex, 1.0);
  }
  `;

  // Fragment shader program, runs on GPU, once per potential pixel

  const fsSource = `
  // Fragment shader program
  precision mediump int;
  precision mediump float;

  // Light model
  uniform vec3 u_Light_position;
  uniform vec3 u_Light_color;
  uniform float u_Shininess;
  uniform vec3 u_Ambient_color;

  // Data coming from the vertex shader
  varying vec3 v_Vertex;
  varying vec4 v_Color;
  varying vec3 v_Normal;

  void main() {

    vec3 to_light;
    vec3 vertex_normal;
    vec3 reflection;
    vec3 to_camera;
    float cos_angle;
    vec3 diffuse_color;
    vec3 specular_color;
    vec3 ambient_color;
    vec3 color;

    // Calculate the ambient color as a percentage of the surface color
    ambient_color = u_Ambient_color * vec3(v_Color);

    // Calculate a vector from the fragment location to the light source
    to_light = u_Light_position - v_Vertex;
    to_light = normalize( to_light );

    // The vertex's normal vector is being interpolated across the primitive
    // which can make it un-normalized. So normalize the vertex's normal vector.
    vertex_normal = normalize( v_Normal );

    // Calculate the cosine of the angle between the vertex's normal vector
    // and the vector going to the light.
    cos_angle = dot(vertex_normal, to_light);
    cos_angle = clamp(cos_angle, 0.0, 1.0);

    // Scale the color of this fragment based on its angle to the light.
    diffuse_color = vec3(v_Color) * cos_angle;

    // Calculate the reflection vector
    reflection = 2.0 * dot(vertex_normal,to_light) * vertex_normal - to_light;

    // Calculate a vector from the fragment location to the camera.
    // The camera is at the origin, so negating the vertex location gives the vector
    to_camera = -1.0 * v_Vertex;

    // Calculate the cosine of the angle between the reflection vector
    // and the vector going to the camera.
    reflection = normalize( reflection );
    to_camera = normalize( to_camera );
    cos_angle = dot(reflection, to_camera);
    cos_angle = clamp(cos_angle, 0.0, 1.0);
    cos_angle = pow(cos_angle, u_Shininess);

    // The specular color is from the light source, not the object
    if (cos_angle > 0.0) {
      specular_color = u_Light_color * cos_angle;
      diffuse_color = diffuse_color * (1.0 - cos_angle);
    } else {
      specular_color = vec3(0.0, 0.0, 0.0);
    }

    color = ambient_color + diffuse_color + specular_color;

    gl_FragColor = vec4(color, v_Color.a);
  }
  `;

  // Initialize a shader program; this is where all 
  // the lighting for the objects, if any, is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Tell WebGL to use our program when drawing
  gl.useProgram(shaderProgram);

  // Collect all the info needed to use the shader program.
  // Look up locations of attributes and uniforms used by
  // our shader program  
  const programInfo = {
    program: shaderProgram,
    locations: {
      a_vertex: gl.getAttribLocation(shaderProgram, 'a_Vertex'),
      a_color: gl.getAttribLocation(shaderProgram, 'a_Color'),
      a_normal: gl.getAttribLocation(shaderProgram, 'a_Vertex_normal'),
      u_light_dir: gl.getUniformLocation(shaderProgram, 'u_Light_position'),
      u_light_color: gl.getUniformLocation(shaderProgram, 'u_Light_color'),
      u_shininess: gl.getUniformLocation(shaderProgram, 'u_Shininess'),
      u_ambient_color: gl.getUniformLocation(shaderProgram, 'u_Ambient_color'),
      u_PVM_transform: gl.getUniformLocation(shaderProgram, 'u_PVM_transform'),
      u_VM_transform: gl.getUniformLocation(shaderProgram, 'u_VM_transform'),
    },
  };


  var gearX = 0, gearY = 0, gearZ = 0;
  var gearZ2 = 0;

  var gear5X = 0, gear5Y = 0, gear5Z = -2;
  var connecterX = 0, connecterY = 0, connecterZ = -1;
  var outerX = 0, outerY = 0, outerZ = 0;
  var middleX = 0, middleY = 0, middleZ = 1;
  var innerX = 0, innerY = 0, innerZ = 2;

  var tovarX = 0, tovarY = 0;
  var yuenX = 0, yuenY = 0;
  var beveridgeX = 0, beveridgeY = 0;
  var cannonX = 0, cannonY;
  var lindsayX = 0, lindsayY = 0;

  var buffers = initBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);//
  var midBuffers = initMiddleBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);//
  var innerBuffers = initInnerBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);//
  var connecterBuffers = initConnecterBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);
  //var gear5Buffers = initGear5Buffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);
  var tovarBuffers = initTovarBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);
  var yuenBuffers = initYuenBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);
  var beveridgeBuffers = initBeveridgeBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);
  var cannonBuffers = initCannonBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);



  //var lindsayBuffers = initLindsayBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z);
  var t = 0;
  var tIncrease = 0.15;
  var zIncrease = 1;
  var depthIncrease = 0.01;
  var tovarAngle = 0, tovarAngleIncrease = 1;
  var switchDone = true;
  // add an event handler so we can interactively rotate the model
  document.addEventListener('keydown',

    function key_event(event) {

      if (event.keyCode == 37) {   //left
        angle_y -= 3;
      } else if (event.keyCode == 38) {  //top
        angle_x -= 3;
      } else if (event.keyCode == 39) {  //right
        angle_y += 3;
      } else if (event.keyCode == 40) {  //bottom
        angle_x += 3;
      } else if (event.keyCode == 83) {//s
        if (tIncrease > 0)
          tIncrease -= 0.03;

        if (zIncrease > 0.0000000000000001)
          zIncrease -= 0.2;
        if (depthIncrease > 0) 
          depthIncrease -= 0.002;

        if (tovarAngleIncrease > 0) {
          tovarAngleIncrease -= 0.2;
        } else {
          tovarAngleIncrease += 0.2;
        }
        
      } else if (event.keyCode == 70) {
        tIncrease += 0.03;
        zIncrease += 0.2;
        depthIncrease += 0.002;
        if (tovarAngleIncrease > 0) {
          tovarAngleIncrease += 0.2;
        } else {
          tovarAngleIncrease -= 0.2;
        }
      }
      return false;
    })



  //have the gears connected to other gears at different z values
  //rotate the camera to the side following the largest gear
  //have the other inner gears align on the z axis
  //once they are start doing a gyroscope type animation
  var GearsCounter = 0, innerGearsCounter = 0;
  var gear5XAngle = 0, gear5YAngle = 0;
  var connecterXAngle = 0, connecterYAngle = 0;
  var outerXAngle = 0, outerYAngle = 0;
  var middleXAngle = 0, middleYAngle = 0;
  var innerXAngle = 0, innerYAngle = 0;
  var tovarIncrease = 0, yuenIncrease = 0, beveridgeIncrease = 0;
  var cannonIncrease1 = 0; var cannonIncrease2 = 0;
  
  gearZ = 1;
  self.animate = function () {
    gl.clearColor(0.1, 0.1, 0.1, 0.1);   // Clear to white, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    


    angle_z += zIncrease;
    tovarAngle += tovarAngleIncrease;
    if (t > 90) {
      if (GearsCounter <= 2) {
        GearsCounter += depthIncrease;
        innerZ -= depthIncrease;
        connecterZ += depthIncrease / 2;
        middleZ -= depthIncrease / 2;
        tovarX += depthIncrease;
        tovarY += depthIncrease;
        yuenX += depthIncrease;
        yuenY += depthIncrease;

        if(switchDone) {
          switchDone = false;
          tovarAngleIncrease = -tovarAngleIncrease;
        }
        if (tovarIncrease < 0.2) {
          tovarIncrease += depthIncrease;
        }

        if (beveridgeIncrease < 0.90) {
          beveridgeIncrease += depthIncrease;
        }
        if (yuenIncrease < 0.90) {
          yuenIncrease += depthIncrease;
        }
        if (cannonIncrease1 < 0.03) {
          cannonIncrease1 += depthIncrease;
        }
        if (cannonIncrease2 < 0.30) {
          cannonIncrease2 += depthIncrease;
        }


      } else {
        connecterXAngle += zIncrease;
        connecterYAngle += zIncrease;
        if (connecterXAngle >= 300) {
          outerXAngle += zIncrease;
          outerYAngle += zIncrease;
        }
        if (outerXAngle >= 300) {
          middleXAngle += zIncrease;
          middleYAngle += zIncrease;
          if (middleYAngle >= 300) {
            innerXAngle += zIncrease;
            innerYAngle += zIncrease;
            if (innerXAngle > 250) {
              //restart
              if (innerXAngle > 250) {
                t = 0;
                connecterZ = -1;
                outerZ = 0;
                middleZ = 1;
                innerZ = 2;

                tovarX = 0;
                tovarY = 0;

                GearsCounter = 0;
                connecterXAngle = 0;
                connecterYAngle = 0;
                outerXAngle = 0;
                middleXAngle = 0;
                middleYAngle = 0;
                innerXAngle = 0;
                innerYAngle = 0;
                tovarIncrease = 0;
                yuenIncrease = 0;
                beveridgeIncrease = 0;
                cannonIncrease1 = 0;
                cannonIncrease2 = 0;

                tovarAngle = 0;
                tovarAngleIncrease = 1;

                switchDone = true;
              }
            }
          }
        }
      }
    } else {
      t += tIncrease;
    }


    //radius of 0.78
    //all outer gears should end up 2.0 units away from the origin
    enableAttributes(gl, innerBuffers, programInfo);
    drawScene(gl, programInfo, innerBuffers, innerXAngle, innerYAngle, angle_z, light, 0, 0, innerZ, t);//front most gear
    enableAttributes(gl, tovarBuffers, programInfo);
    drawScene(gl, programInfo, tovarBuffers, tovarX, tovarY, -tovarAngle, light, 1.09 + tovarIncrease, 1.09 + tovarIncrease, innerZ, t);
    enableAttributes(gl, tovarBuffers, programInfo);
    drawScene(gl, programInfo, tovarBuffers, -tovarX, -tovarY, -tovarAngle, light, -1.09 - tovarIncrease, -1.09 - tovarIncrease, innerZ, t);



    //when changing location need to take into account that their starting positions are slightly off from one another because of the sizes of the inner gears

    //radius of 0.9
    enableAttributes(gl, midBuffers, programInfo);
    drawScene(gl, programInfo, midBuffers, middleXAngle, middleYAngle, angle_z, light, 0, 0, middleZ, t);//2nd front most gear

    enableAttributes(gl, yuenBuffers, programInfo);
    drawScene(gl, programInfo, yuenBuffers, 0, 0, -angle_z, light, 0, 1.65 + yuenIncrease, middleZ, t);
    enableAttributes(gl, yuenBuffers, programInfo);
    drawScene(gl, programInfo, yuenBuffers, 0, 0, -angle_z, light, 0, -1.65 - yuenIncrease, middleZ, t);


    //radius of 1.02
    enableAttributes(gl, buffers, programInfo);
    drawScene(gl, programInfo, buffers, -outerXAngle, 0, angle_z, light, 0, 0, outerZ, t);//center gear
    enableAttributes(gl, beveridgeBuffers, programInfo);
    drawScene(gl, programInfo, beveridgeBuffers, 0, 0, -angle_z, light, 1.75 + beveridgeIncrease, 0, outerZ, t);
    enableAttributes(gl, beveridgeBuffers, programInfo);
    drawScene(gl, programInfo, beveridgeBuffers, 0, 0, -angle_z, light, -1.75 - beveridgeIncrease, 0, outerZ, t);


    //radius of 1.12

    //side
    enableAttributes(gl, connecterBuffers, programInfo);
    drawScene(gl, programInfo, connecterBuffers, 0, connecterYAngle, angle_z, light, 0, 0, connecterZ, t);//second to last gear
    enableAttributes(gl, cannonBuffers, programInfo);
    drawScene(gl, programInfo, cannonBuffers, 0, 0, -tovarAngle, light, 1.3 + cannonIncrease1, -1.3 - cannonIncrease1, connecterZ, t);
    enableAttributes(gl, cannonBuffers, programInfo);
    drawScene(gl, programInfo, cannonBuffers, 0, 0, -tovarAngle, light, -1.3 - cannonIncrease1, 1.3 + cannonIncrease1, connecterZ, t);

    requestAnimationFrame(self.animate);

  };


  animate();

}

function toRad(angle) {
  return angle * (Math.PI / 180);
}


//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple two-dimensional square.
//
function initBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = createOuterGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}

function initTovarBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = tovarGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}

function initYuenBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = yuenGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}

function initBeveridgeBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = beveridgeGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}

function initLindsayBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = evandlGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}

function initCannonBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = cannonGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}

function initMiddleBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = createMiddleGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}

function initInnerBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = createInnerGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}


function initConnecterBuffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = createConnecterGear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}


function initGear5Buffers(gl, programInfo, numTeeth, numSpokes, gearType, angle_z) {

  gearData = create5Gear(numTeeth, numSpokes);
  vertices = gearData[0];
  colors = gearData[1];
  normals = gearData[2];

  // Create  buffers for the object's vertex positions
  const vertexBuffer = gl.createBuffer();

  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Now pass the list of vertices to the GPU to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(vertices),
    gl.STATIC_DRAW);
  // do likewise for colors
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(colors),
    gl.STATIC_DRAW);
  const normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(normals),
    gl.STATIC_DRAW);

  return {
    // each vertex in buffer has 3 floats
    num_vertices: vertices.length / 3,
    vertex: vertexBuffer,
    color: colorBuffer,
    normal: normalBuffer,
  };

}

function enableAttributes(gl, buffers, programInfo) {

  const numComponents = 3;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;

  // Tell WebGL how to pull vertex positions from the vertex
  // buffer. These positions will be fed into the shader program's
  // "a_vertex" attribute.

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertex);

  gl.vertexAttribPointer(
    programInfo.locations.a_vertex,
    numComponents,
    type,
    normalize,
    stride,
    offset);
  gl.enableVertexAttribArray(
    programInfo.locations.a_vertex);


  // likewise connect the colors buffer to the "a_color" attribute
  // in the shader program
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.locations.a_color,
    numComponents,
    type,
    normalize,
    stride,
    offset);
  gl.enableVertexAttribArray(
    programInfo.locations.a_color);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
  gl.vertexAttribPointer(
    programInfo.locations.a_normal,
    numComponents,
    type,
    normalize,
    stride,
    offset);
  gl.enableVertexAttribArray(
    programInfo.locations.a_normal);

}


//
// Draw the scene.
//



//create a draw 
function drawScene(gl, programInfo, buffers, angle_x, angle_y, angle_z, lightColor, translationX, translationY, translationZ, t) {
  //make transform to implement interactive rotation

  var matrix = new Learn_webgl_matrix();

  var rotate_x_matrix = matrix.create();
  var rotate_y_matrix = matrix.create();
  var rotate_z_matrix = matrix.create();
  var lookat = matrix.create();
  var u_PVMtransform = matrix.create();
  var u_VMtransform = matrix.create();
  var scale = matrix.create();

  var camera_location = [0, 0, 0];

  var control_points = [
    [3, 3, 3],//start
    [2, 2, 5],
    [3, 2, 5],
    [-1, -1, 4],//end                                                                           
  ];

  // t/100.0
  var cp;

  //y = (1 − t)3, green: y= 3(1 − t)2 t, red: y= 3(1 − t) t2, and cyan: y = t3

  function weight(t) {
    return [Math.pow(1 - t, 3), 3 * Math.pow(1 - t, 2) * t, 3 * (1 - t) * Math.pow(t, 2), Math.pow(t, 3)];
  }

  weights = weight(t / 100);

  for (cp = 0; cp < 4; cp++) {

    camera_location[0] += weights[cp] * control_points[cp][0];
    camera_location[1] += weights[cp] * control_points[cp][1];
    camera_location[2] += weights[cp] * control_points[cp][2];

  }




  //y = (1 − t)3, green: y= 3(1 − t)2 t, red: y= 3(1 − t) t2, and cyan: y = t3

  //matrix.lookAt(lookat,0,0,5, 0,0,0, 0,1,0);

  matrix.lookAt(lookat,
    // 5*Math.cos( t*Math.PI/180),0,5*Math.sin( t*Math.PI/180), 
    camera_location[0], camera_location[1], camera_location[2],
    0, 0, 0,
    0, 1, 0);


  //var proj = matrix.createOrthographic(-1, 1, -1, 1, 3, 7);
  var proj = matrix.createFrustum(-3, 3, -3, 3, 2, 1000);
  matrix.scale(scale, 0.8, 0.8, 0.8);
  //matrix.lookAt(lookat, 0, 0, 5, 0, 0, 0, 0, 1, 0);
  matrix.rotate(rotate_x_matrix, angle_x, 1, 0, 0);
  matrix.rotate(rotate_y_matrix, angle_y, 0, 1, 0);
  matrix.rotate(rotate_z_matrix, angle_z, 0, 0, 1);


  var translateMatrix = matrix.create();
  matrix.translate(translateMatrix, translationX, translationY, translationZ);//use to move the gear


  //keep the different objects split

  //then rotate their individual matrices 

  //then combine them into a single array
  // Combine the two rotations into a single transformation

  matrix.multiplySeries(u_PVMtransform, proj, lookat,
    rotate_x_matrix, rotate_y_matrix, translateMatrix, rotate_z_matrix, scale);
  matrix.multiplySeries(u_VMtransform, lookat,
    rotate_x_matrix, rotate_y_matrix, translateMatrix, rotate_z_matrix, scale);


  // Set the shader program's uniform
  gl.uniformMatrix4fv(programInfo.locations.u_VM_transform, false, u_VMtransform);
  gl.uniformMatrix4fv(programInfo.locations.u_PVM_transform, false, u_PVMtransform);


  gl.uniform3f(programInfo.locations.u_light_dir, 3, 3, 3);

  gl.uniform3f(programInfo.locations.u_light_color, 1, 1, 1);
  gl.uniform1f(programInfo.locations.u_shininess, 85);
  gl.uniform3f(programInfo.locations.u_ambient_color, 0.2, 0.2, 0.2);


  { // now tell the shader (GPU program) to draw some triangles
    const offset = 0;
    gl.drawArrays(gl.TRIANGLES, offset, buffers.num_vertices);
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
// BOILERPLATE CODE, COPY AND PASTE
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.  BOILERPLATE CODE, COPY AND PASTE
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
