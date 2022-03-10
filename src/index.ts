/// Zappar for ThreeJS Examples
/// Play animation from gaze

// In this image tracked example we'll use a THREE.Raycaster to detect if
// the user is pointing their camera at a 3D object. If it is, we'll play
// the animation that's baked into the 3D model file.

import * as ZapparThree from '@zappar/zappar-threejs';
import { getHashes } from 'crypto';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import model from '../assets/сhechol.glb';
import targetImage from '../assets/marker.zpt';

// The SDK is supported on many different browsers, but there are some that
// don't provide camera access. This function detects if the browser is supported
// For more information on support, check out the readme over at
// https://www.npmjs.com/package/@zappar/zappar-threejs
if (ZapparThree.browserIncompatible()) {
  // The browserIncompatibleUI() function shows a full-page dialog that informs the user
  // they're using an unsupported browser, and provides a button to 'copy' the current page
  // URL so they can 'paste' it into the address bar of a compatible alternative.
  ZapparThree.browserIncompatibleUI();

  // If the browser is not compatible, we can avoid setting up the rest of the page
  // so we throw an exception here.
  throw new Error('Unsupported browser');
}

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded. You can use this if it's helpful, or use
// your own loading UI - it's up to you :-)
const manager = new ZapparThree.LoadingManager();

// Construct our ThreeJS renderer and scene as usual
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
document.body.appendChild(renderer.domElement);

// As with a normal ThreeJS scene, resize the canvas if the window resizes
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create a Zappar camera that we'll use instead of a ThreeJS camera
const camera = new ZapparThree.Camera();

// In order to use camera and motion data, we need to ask the users for permission
// The Zappar library comes with some UI to help with that, so let's use it
ZapparThree.permissionRequestUI().then((granted) => {
  // If the user granted us the permissions we need then we can start the camera
  // Otherwise let's them know that it's necessary with Zappar's permission denied UI
  if (granted) camera.start();
  else ZapparThree.permissionDeniedUI();
});

// The Zappar component needs to know our WebGL context, so set it like this:
ZapparThree.glContextSet(renderer.getContext());

// Set the background of our scene to be the camera background texture
// that's provided by the Zappar camera
scene.background = camera.backgroundTexture;

// Set an error handler on the loader to help us check if there are issues loading content.
manager.onError = (url) => console.log(`There was an error loading ${url}`);

// Create a zappar ImageTracker and wrap it in an ImageAnchorGroup for us
// to put our ThreeJS content into
// Pass our loading manager in to ensure the progress bar works correctly
const imageTracker = new ZapparThree.ImageTrackerLoader(manager).load(targetImage);
const imageTrackerGroup = new ZapparThree.ImageAnchorGroup(camera, imageTracker);

// Add our image tracker group into the ThreeJS scene
scene.add(imageTrackerGroup);



// Load a 3D model to place within our group (using ThreeJS's GLTF loader)
// Pass our loading manager in to ensure the progress bar works correctly
const gltfLoader = new GLTFLoader(manager);
gltfLoader.load(model, (gltf) => {
  gltf.scene.rotateZ(Math.PI/2)
  gltf.scene.scale.set(2,2,2)
  imageTrackerGroup.add(gltf.scene.rotateX(Math.PI / 2));
}, undefined, () => {
  console.log('An error ocurred loading the GLTF model');
});

// Light up our scene with an ambient light
imageTrackerGroup.add(new THREE.AmbientLight(0xffffff));





// When we lose sight of the camera, hide the scene contents.
imageTracker.onVisible.bind(() => { scene.visible = true; });
imageTracker.onNotVisible.bind(() => { scene.visible = false; });

// used to get deltaTime for our animations.

// We'll use a raycaster to see if the hotspot plane is in front of the camera
// Use a function to render our scene as usual
function render(): void {
  // The Zappar camera must have updateFrame called every frame
  camera.updateFrame(renderer);
 
  renderer.render(scene, camera);

  // Call render() again next frame
  requestAnimationFrame(render);
}

// Start things off
render();
