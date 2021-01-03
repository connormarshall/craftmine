
      //Choose a random seed on initialisation
      var seed = Math.random();
      noise.seed(seed);

      //Three.js scene object
      var scene = new THREE.Scene();
      //Three.js renderer object
      var renderer = new THREE.WebGLRenderer();
      //Size of the rendered area
      renderer.setSize(window.innerWidth, window.innerHeight);
      //Add renderer to document
      document.body.appendChild(renderer.domElement);

      // Camera object
      var camera = new THREE.PerspectiveCamera(
        75,                                      //Field of View (FOV)
        window.innerWidth / window.innerHeight,  //Aspect Ratio of render area
        0.1,                                     //Near clipping plane
        1000                                     //Far clipping plane
      );

      /*
       * Defines a block object and how it should be rendered
       * x, y, z : 3D position
       */
      function Block(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        //Function defining what to do when a Block object is displayed
        this.display = function() {
          /* NOTE: BufferGeometry stores geometry as raw data in an array rather
           * than as instances of Vector and Face classes. This makes them more
           * efficient but more difficult to manipulate. This is good for blocks,
           * as we need to render a lot of them and won't manipulate their geometry.
           */

          //Create a buffer object of box geometry, a cube with the dimension 5
          var blockBox = new THREE.BoxBufferGeometry(5, 5, 5); //width, height, depth
          //Create a mesh material object with a hex colour
          var blockMeshMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
          //Create a mesh out of the box buffer geometry, with the mesh material
          var block = new THREE.Mesh(blockBox, blockMeshMat);
          //Add the block to the scene
          scene.add(block);
          //Position the block in the scene
          block.position.x = this.x;
          block.position.y = this.y - 10;
          block.position.z = this.z;

          //Edges of the block
          var edges = new THREE.EdgesGeometry(blockBox);
          //Line segments according to the edges of the block
          var line = new THREE.LineSegments(edges, new THREE
            .LineBasicMaterial({color: 0xffffff})
          );
          //Add the lines to the scene and position them according to the block
          scene.add(line);
          line.position.x = this.x;
          line.position.y = this.y - 10;
          line.position.z = this.z;

        }
      }

      //Array containing blocks
      var blocks = [];

      //The offsetting of the block positions as per the noise function
      var xOff = 0;
      var zOff = 0;

      var inc = 0.05; //Smoothness
      var amplitude = 50; //height (variation)

      //Looping over x and z axis to create a flat 20x20 plane of blocks
      for(var x = 0; x < 20; x++) {
        //Reset x to 0 each time for a new row of blocks, so the value does not accumulate
        xOff = 0;
        for(var z = 0; z < 20; z++) {
          /* Get a whole number Math.round()
           * of the output of a noise function noise.perlin2()
           * with the parameters x offset and z offset
           * multiplied by amplitude, divided by 5 to get a height displacement
           * multiply it by 5 to bring it into the space of blocks
           */
          var v = Math.round(noise.perlin2(xOff, zOff) * amplitude / 5) * 5;
          //Add a block to the array, with the noise displaced height v.
          blocks.push(new Block(x * 5, v, z * 5));
          //Increment the x offset
          xOff += inc;

        }
        //Increment the z offset
        zOff += inc;

      }

      //Display each block
      for(var i = 0; i < blocks.length; i++) {
        blocks[i].display();
      }


      var canJump = true;
      document.addEventListener("keydown", (e) => {
        var code = event.which || event.keyCode;
        keyHandle(code, true);

        if (keys[32] && canJump) {
          ySpeed = -1.3;
          canJump = false;
        }

      });

      document.addEventListener("keyup", (e) => {
        var code = event.which || event.keyCode;
        keyHandle(code, false);
      });

      //First person camera controls
      var controls = new THREE.PointerLockControls(camera, document.body);

      //Event listeners to lock the cursor to the middle of the screen
      document.addEventListener("click", () => {
        controls.lock();
      });
      document.addEventListener("lock", () => {});
      document.addEventListener("unlock", () => {});


      function updateMovement() {
        //W key
        if(keys[87]) {
          controls.moveForward(forward * movementSpeed);
          movementCollision();
        }
        //A key
        if(keys[65]) {
          controls.moveRight(back * movementSpeed);
          movementCollision();
        }
        //S key
        if(keys[83]) {
          controls.moveForward(back * movementSpeed);
          movementCollision();
        }
        //D key
        if(keys[68]) {
          controls.moveRight(forward * movementSpeed);
          movementCollision();
        }

      }

      function movementCollision() {
        for(var i = 0; i < blocks.length; i++) {

          if(camera.position.x <= blocks[i].x + 2.5 &&
             camera.position.x >= blocks[i].x - 2.5 &&
             camera.position.z <= blocks[i].z + 2.5 &&
             camera.position.z >= blocks[i].z - 2.5) {

            if(camera.position.y == blocks[i].y - 2.5 &&
               !autoJumpEnabled) {
              console.log("colliding! cameraY: " + camera.position.y + "\n"
                          + " blockPos: x: " + blocks[i].x + "\n"
                          + " blockPos: y: " + blocks[i].y + "\n"
                          + " blockPos: z: " + blocks[i].z + "\n");
              forward = -1;
              back = 1;

              //W key
              if(keys[87]) {
                controls.moveForward(forward * movementSpeed);
              }
              //A key
              if(keys[65]) {
                controls.moveRight(back * movementSpeed);
              }
              //S key
              if(keys[83]) {
                controls.moveForward(back * movementSpeed);
              }
              //D key
              if(keys[68]) {
                controls.moveRight(forward * movementSpeed);
              }


            }

          }
        }
      }

      var movementSpeed = 0.7;
      var ySpeed = 0;
      var acc = 0.06;
      var jumping = false;
      var autoJumpEnabled = false;
      var forward = 1;
      var back = -1;

      //Update function: Update game each frams
      function update() {

        updateMovement();

        camera.position.y -= ySpeed;
        ySpeed += acc;

        for(var i = 0; i < blocks.length; i++) {
          if(camera.position.x <= blocks[i].x + 2.5 &&
             camera.position.x >= blocks[i].x - 2.5 &&
             camera.position.z <= blocks[i].z + 2.5 &&
             camera.position.z >= blocks[i].z - 2.5) {

            if(camera.position.y <= blocks[i].y + 2.5 &&
               camera.position.y >= blocks[i].y - 2.5) {

              camera.position.y = blocks[i].y + 2.5;
              ySpeed = 0;
              canJump = true;
            }

          }
        }

        forward = 1;
        back = -1;

      }

      //Event listener to handle resizing of browser window
      window.addEventListener("resize", () => {
        //Setting the size of the renderer and updating camera aspect ratio
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        /*
         * Updates the projection matrix so that 3D objects are projected to
         * the camera according to the new aspect ratio when render() is called
         */
        camera.updateProjectionMatrix();
      });

      //Render function: render the game after an update() each frame
      function render() {
        //Render the scene of 3D objects to the 2D camera frame
        renderer.render(scene, camera);
      }


      //Recursive game loop
      function GameLoop() {
        /*
         * Executes the callback function on the next available screen repaint.
         * requestAnimationFrame() more handles things internally,
         * so it is good to use instead of setTimeout() calls
         */
        requestAnimationFrame(GameLoop);

        //FOR EACH FRAME:

        //Update objects
        update();
        //Render the frame to the camera
        render();

      }
