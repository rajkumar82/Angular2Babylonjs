/// <reference path="../../node_modules/babylonjs/babylon.d.ts" />
import { Component } from '@angular/core';
import {ViewerComponent } from './viewer/viewer.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  onViewerInitialized(viewer: ViewerComponent) {

      
      let scene = viewer.scene;

      let light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);

      let light1 = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, -1, 0), scene);

      let box = BABYLON.Mesh.CreateBox('box', 100.0, scene,false, BABYLON.Mesh.DOUBLESIDE);
      box.position = new BABYLON.Vector3(-10, 0, 0);   // Using a vector

      let material = new BABYLON.StandardMaterial("material", scene);
      material.diffuseColor = BABYLON.Color3.Blue();
      
      box.material = material;
      box.enableEdgesRendering(0.01);

      viewer.ZoomFit();

  }
}
