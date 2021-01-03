
      //Choose a random seed on initialisation
      var seed = Math.random();
      noise.seed(seed);

      //Three.js scene object
      var scene = new THREE.Scene();
      //Skybox colour
      scene.background = new THREE.Color(0x89cff0);
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

      //Texture Loader
      var loader = new THREE.TextureLoader();

      //material for a grass block. Load once to save overhead
      var blockMeshMat = [
        new THREE.MeshBasicMaterial({map: loader.load("img/texture/grass-side.png")}),
        new THREE.MeshBasicMaterial({map: loader.load("img/texture/grass-side.png")}),
        new THREE.MeshBasicMaterial({map: loader.load("img/texture/grass-top.png")}),
        new THREE.MeshBasicMaterial({map: loader.load("img/texture/dirt.jpg")}),
        new THREE.MeshBasicMaterial({map: loader.load("img/texture/grass-side.png")}),
        new THREE.MeshBasicMaterial({map: loader.load("img/texture/grass-side.png")})
      ];

      /*
       * Defines a block object and how it should be rendered
       * x, y, z : 3D position
       */
      function Block(x, y, z) {

        //Settings for block rendering

        /* WARNING: disabling linesEnabled will break chunk Loading
         * in current version
         */
        var linesEnabled = true;

        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh;
        this.line;

        //Function defining what to do when a Block object is displayed
        this.display = function() {
          /* NOTE: BufferGeometry stores geometry as raw data in an array rather
           * than as instances of Vector and Face classes. This makes them more
           * efficient but more difficult to manipulate. This is good for chunks,
           * as we need to render a lot of them and won't manipulate their geometry.
           */

          //Create a buffer object of box geometry, a cube with the dimension 5
          var blockBox = new THREE.BoxBufferGeometry(5, 5, 5); //width, height, depth
          //Create a mesh material object with a hex colour

          //Solid green material
          //var blockMeshMat = new THREE.MeshBasicMaterial({color: 0x00ff00});

          //Create a mesh out of the box buffer geometry, with the mesh material
          this.mesh = new THREE.Mesh(blockBox, blockMeshMat);
          //Add the block to the scene
          scene.add(this.mesh);
          //Position the block in the scene
          this.mesh.position.x = this.x;
          this.mesh.position.y = this.y - 10;
          this.mesh.position.z = this.z;

          if(linesEnabled) {
            //Edges of the block
            var edges = new THREE.EdgesGeometry(blockBox);
            //Line segments according to the edges of the block
            this.line = new THREE.LineSegments(edges, new THREE
              .LineBasicMaterial({color: 0x000000})
            );
            //Add the lines to the scene and position them according to the block
            scene.add(this.line);
            this.line.position.x = this.x;
            this.line.position.y = this.y - 10;
            this.line.position.z = this.z;
          }

        }
      }

      function getChunkEdges () {
        var xPosArray = [];
        var zPosArray = [];

        for(var i = 0; i < chunks.length; i++) {
          for(var j = 0; j < chunks[i].length; j++) {
            xPosArray.push(chunks[i][j].x);
            zPosArray.push(chunks[i][j].z);
          }
        }

        return [
                  Math.min.apply(null, xPosArray),
                  Math.max.apply(null, xPosArray),
                  Math.min.apply(null, zPosArray),
                  Math.max.apply(null, zPosArray)
               ];

      }

      //Array containing chunks
      var chunks = [];
      //Size of an individual chunk
      var chunkSize = 16;
      //RenderDistance: number of chunks to render at a time
      var renderDistance = 3;
      //The offsetting of the block positions as per the noise function
      var xOff = 0;
      var zOff = 0;

      var inc = 0.05; //Smoothness
      var amplitude = 30 + (Math.random() * 70); //height (variation)

      //Looping over rendered chunks
      for(var i = 0; i < renderDistance; i++) {
        //Looping over rendered chunks on the other axis
        for(var j = 0; j < renderDistance; j++) {
          //Empty array of chunks for new chunk
          var chunk = [];
          //Looping over x and z axis to create a flat 20x20 plane of chunks.
          //Multiply by chunksize to transform into the space of the chunk
          for(var x = i * chunkSize; x < (i * chunkSize) + chunkSize; x++) {
            //Reset x to 0 each time for a new row of chunks, so the value does not accumulate
            //xOff = 0;
            for(var z = j * chunkSize; z < (j * chunkSize) + chunkSize; z++) {
              //Increment the offset values
              xOff = inc * x;
              zOff = inc * z;
              /* Get a whole number Math.round()
               * of the output of a noise function noise.perlin2()
               * with the parameters x offset and z offset
               * multiplied by amplitude, divided by 5 to get a height displacement
               * multiply it by 5 to bring it into the space of chunks
               */
              var v = Math.round(noise.perlin2(xOff, zOff) * amplitude / 5) * 5;
              //Add a block to the array, with the noise displaced height v.
              chunk.push(new Block(x * 5, v, z * 5));

              /*
              console.log("New Block: \n"
                          + "chunk: " + (i+1) + " : " + (j + 1) + "\n"
                          + " block: " + (x*5) + " , " + v + " , " + (z*5)
                          + "\n");
              */
            }
          }
          chunks.push(chunk);
          //console.log("chunk " + (i + 1) + " : " + (j + 1) + " pushed");
      }
    }

      //Spawn position
      camera.position.x = Math.round(renderDistance * chunkSize / 2 * 5);
      camera.position.z = Math.round(renderDistance * chunkSize / 2 * 5);
      camera.position.y = 70;

      //Display each block in the rendered chunks
      for(var i = 0; i < chunks.length; i++) {
        for(var j = 0; j < chunks[i].length; j++) {
          console.log();
          chunks[i][j].display();
        }
      }


      var canJump = true;
      document.addEventListener("keydown", (e) => {
        var code = event.which || event.keyCode;
        keyHandle(code, true);

        if (keys[32] && canJump) {
          e.preventDefault();
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
        for(var i = 0; i < chunks.length; i++) {
          for(var j = 0; j < chunks[i].length; j++) {
            if(camera.position.x <= chunks[i][j].x + 2.5 &&
               camera.position.x >= chunks[i][j].x - 2.5 &&
               camera.position.z <= chunks[i][j].z + 2.5 &&
               camera.position.z >= chunks[i][j].z - 2.5) {

              if(camera.position.y == chunks[i][j].y - 2.5 &&
                 !autoJumpEnabled) {
                console.log("colliding! cameraY: " + camera.position.y + "\n"
                            + " blockPos: x: " + chunks[i][j].x + "\n"
                            + " blockPos: y: " + chunks[i][j].y + "\n"
                            + " blockPos: z: " + chunks[i][j].z + "\n");
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
      }

    //Toggle for auto jump button
		function toggleAutoJump() {
			if(autoJumpEnabled){
				autoJumpEnabled = false;
				document.getElementById("autojump-btn").innerHTML = "<h2>Auto Jump: Off</h2>";
			} else {
				autoJumpEnabled = true;
				document.getElementById("autojump-btn").innerHTML = "<h2>Auto Jump: On</h2>";
			}

		}

      var movementSpeed = 0.7;
      var ySpeed = 0;
      var acc = 0.06;
      var jumping = false;
      var autoJumpEnabled = true;
      var forward = 1;
      var back = -1;

      //Update function: Update game each frams
      function update() {

        updateMovement();

        camera.position.y -= ySpeed;
        ySpeed += acc;

        for(var i = 0; i < chunks.length; i++) {
          for(var j = 0; j < chunks[i].length; j++) {
            if(camera.position.x <= chunks[i][j].x + 2.5 &&
               camera.position.x >= chunks[i][j].x - 2.5 &&
               camera.position.z <= chunks[i][j].z + 2.5 &&
               camera.position.z >= chunks[i][j].z - 2.5) {

              if(camera.position.y <= chunks[i][j].y + 2.5 &&
                 camera.position.y >= chunks[i][j].y - 2.5) {

                camera.position.y = chunks[i][j].y + 2.5;
                ySpeed = 0;
                canJump = true;
              }

            }
          }
        }

        //Chunk Loading
        var chunkEdges = getChunkEdges();
        var lowestX = chunkEdges[0];
        var highestX = chunkEdges[1];
        var lowestZ = chunkEdges[2];
        var highestZ = chunkEdges[3];

        if(camera.position.z <= lowestZ + (chunkSize * 5)) { //Middle of chunks
				/*

					[0], [3], [6],
					[1], [x], [7],
					[2], [5], [8],
				*/

				// remove blocks (chunks)

        //Loop over chunks
				for(var i = 0; i < chunks.length; i++) {
          //If chunk row (i+1) is outside of render distance
					if((i + 1) % renderDistance == 0) {
            //Loop over each chunk in i and remove each block
						for(var j = 0; j < chunks[i].length; j++) {
							scene.remove(chunks[i][j].mesh);
							scene.remove(chunks[i][j].line);
						}
					}

				}

        //Add every other chunk to an array newChunks[]
				var newChunks = [];
				for(var i = 0; i < chunks.length; i++) {
					if((i + 1) % renderDistance != 0) {
						newChunks.push(chunks[i]);
					}
				}

				// add blocks
        //Create a row of chunks the length of renderDistance
				for(var i = 0; i < renderDistance; i++) {
					var chunk = [];
          /* Create the row with the coords after the current end of rendered
           * chunks. (i * chunkSize * 5) = x coordinate of the first block
           * of each chunk.
           */
					for(var x = lowestX + (i * chunkSize * 5);
            x < lowestX + (i * chunkSize * 5) + (chunkSize * 5); x += 5) {
            /* Loop over the z axis and perlin noise create a block for each
             * block position in the chunk
             */
						for(var z = lowestZ - (chunkSize * 5); z < lowestZ; z += 5){
							xoff = inc * x / 5;
							zoff = inc * z / 5;
							var v = Math.round(noise.perlin2(xoff, zoff) * amplitude / 5) * 5;
							chunk.push(new Block(x, v, z));
						}
					}
          //Add the new chunks at the start of the newChunks array
					newChunks.splice(i * renderDistance, 0, chunk);
				}

        //Replace chunks with newChunks
				chunks = newChunks;

        //Display every new chunk
				for(var i = 0; i < chunks.length; i++) {
					if(i % renderDistance == 0) {
						for(var j = 0; j < chunks[i].length; j++) {
							chunks[i][j].display();
						}
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
