/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable arrow-body-style */
/* eslint-disable camelcase */
import * as THREE from 'three'
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
// import postprocessing passes
// import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
// import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
// import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
// import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// import vertexShader from './shaders/vertex.glsl'
// import fragmentShader from './shaders/fragment.glsl'

import vertexPars from './shaders/vertex_pars.glsl'
import vertexMain from './shaders/vertex_main.glsl'
import fragmentPars from './shaders/fragment_pars.glsl'
import fragmentMain from './shaders/fragment_main.glsl'

import abhi from './images/abhi.svg';

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  const gui = useGui()
  const { width, height } = useRenderSize()
  let red = 0.8, green = 0.3, blue = 0.8;

  // settings
  // const MOTION_BLUR_AMOUNT = 0.725

  // lighting
  const dirLight = new THREE.DirectionalLight('#526cff', 1.6)
  dirLight.position.set(2, 5, 2)

  const dirLight2 = new THREE.DirectionalLight('#526cff', 0.6)
  dirLight.position.set(-2, -5, 2)
  scene.add(dirLight2)

  let ambientLight = new THREE.AmbientLight(new THREE.Color("rgb ("+ red, green, blue + ") "), 0.9)
  scene.add(dirLight, ambientLight)


  // meshes
  const geometry = new THREE.IcosahedronGeometry(1, 400)
  const material = new THREE.MeshStandardMaterial({
    onBeforeCompile: (shader) => {
      // storing a reference to the shader object
      material.userData.shader = shader

      // uniforms
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + vertexPars
      )

      const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + vertexMain
      )

      const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`
      const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`
      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + fragmentPars
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + fragmentMain
      )
    },
    roughness: 0.5,
    metalness: 0.9
  })

  const ico = new THREE.Mesh(geometry, material)
  scene.add(ico)

    const planeGeometry = new THREE.PlaneGeometry(0.35, 0.35);
    const planeTexture = new THREE.TextureLoader().load(abhi);
    const planeMaterial = new THREE.MeshBasicMaterial({ map: planeTexture, transparent: true });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // plane.position.set(0, this.sphere2.position.y * 2 + this.sphere2.geometry.parameters.radius + 1, 0); // Adjust Y and Z as needed
    const distanceFromSphere = 1 + 0.4; // Slightly in front of the sphere
    plane.position.set(0, 0, distanceFromSphere);
    scene.add(plane);

  // GUI
  const options = {
    red: 0.8,
    blue: 0.8,
    green: 0.3,
    roughness: 0.5,
    metalness: 0.9
  }
  ambientLight.color.setRGB(red, green, blue);
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 10)
  const colorsFolder = gui.addFolder('Colors');
  colorsFolder.add(options, 'red', 0, 1).onChange((val)=> {
    red = Number(val);
    ambientLight.color.setRGB(red, green, blue);
  });
  colorsFolder.add(options, 'blue', 0, 1).onChange((val)=> {
    blue = Number(val);
    ambientLight.color.setRGB(red, green, blue);
  });
  colorsFolder.add(options, 'green', 0, 1).onChange((val)=> {
    green = Number(val);
    ambientLight.color.setRGB(red, green, blue);
  });
  const meshStandardMaterialFolder = gui.addFolder('MeshStandardMaterial');
  meshStandardMaterialFolder.add(options, 'roughness', 0, 1);
  meshStandardMaterialFolder.add(options, 'metalness', 0, 1);
  camera.position.z = 4;
  scene.background = new THREE.Color( 0xA2BAC5 );

  addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.1, 0.1, 0.1))

  useTick(({ timestamp }) => {
    const time = timestamp / 5000
    material.userData.shader.uniforms.uTime.value = time
  })
}

export default startApp
