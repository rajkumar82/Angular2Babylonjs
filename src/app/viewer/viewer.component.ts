/// <reference path="../../../node_modules/babylonjs/babylon.d.ts" />
import {Output, Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {EventEmitter} from '@angular/core';
import {MyCamera} from './MyCamera';
import {MyCameraPointersInput} from './MyCameraPointersInput';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements OnInit, AfterViewInit {

  @Output() viewerInitialized: EventEmitter<ViewerComponent> = new EventEmitter<ViewerComponent>();
  @Output() viewerPicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() mouseMoved: EventEmitter<string> = new EventEmitter<string>();

  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: MyCamera;
  light: BABYLON.HemisphericLight;
  dirlight: BABYLON.DirectionalLight;


  @ViewChild('canvasElement') canvasElement;

  constructor() { }

  ngOnInit() {

  }

    ngAfterViewInit() {

        this.createViewer();

        let me = this;

        this.engine.runRenderLoop(me.runRenderLoop.bind(me));
    }

    private createViewer() {

        this.createEngine();

        this.createScene();

        this.createCamera();

        this.createLight();

        let me = this;

        this.scene.onBeforeRenderObservable.add(function () {
            me.dirlight.position = me.camera.position;
            me.dirlight.setDirectionToTarget(me.camera.target);

        });

        let engine = this.engine;


        let canvas = this.canvasElement.nativeElement;
        window.addEventListener('resize', me.ReSize.bind(me));
        canvas.addEventListener('mousedown', me.Select.bind(me));
        canvas.addEventListener('wheel', me.MouseWheeled.bind(me));
        canvas.addEventListener('mousemove', me.MouseMoved.bind(me));


        // set gradient background
        this.SetBackground(BABYLON.Color3.FromHexString('#E6F5FF'));
        let url = 'assets/Gradient.png';
        let background = new BABYLON.Layer('back', url, this.scene);
        background.isBackground = true;


        this.viewerInitialized.next(me);
    }

    private Select() {
        // dont select in pan mode
        if (this.camera.pointerMode === MyCameraPointersInput.POINTER_MODE_PAN)
          return;

        this.viewerPicked.next('');
    }

    private MouseMoved() {
        this.mouseMoved.next('');
    }

    MouseWheeled(event: any) {
        let zoom = event.deltaY;
        let factor = 1;
        // console.log("direction=" + zoom);

        if (zoom > 0)
            factor = 1.2;
        else
            factor = 1 / 1.2;

        let x = this.scene.pointerX;
        let y = this.scene.pointerY;
        let first = this.camera.ConvertScreenToView(x, y);


        // zoom 
        this.camera.orthoTop *= factor;
        this.camera.orthoBottom *= factor;
        this.camera.orthoLeft *= factor;
        this.camera.orthoRight *= factor;

        let second = this.camera.ConvertScreenToView(x, y);

        // calc diff
        let dx = second.x - first.x;
        let dy = second.y - first.y;

        this.camera.orthoLeft -= dx;
        this.camera.orthoRight -= dx;
        this.camera.orthoTop -= dy;
        this.camera.orthoBottom -= dy;
    }

    private createEngine() {
        // load the 3D engine
        this.engine = new BABYLON.Engine(this.canvasElement.nativeElement, true);
    }

    private createScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.ambientColor = BABYLON.Color3.White();
    }

    private createCamera() {
        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        this.camera = new MyCamera('MyCamera', 1, 0.8, 100, BABYLON.Vector3.Zero(), this.scene);

        this.camera.allowUpsideDown = true;
        this.camera.lowerBetaLimit = null;
        this.camera.upperBetaLimit = null;

        // target the camera to scene origin
        this.camera.setTarget(BABYLON.Vector3.Zero());

        // target the camera to scene origin
        this.camera.setPosition(new BABYLON.Vector3(1000, 1000, 1000));

        // attach the camera to the canvas
        this.camera.attachControl(this.canvasElement.nativeElement, true, true);

        this.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

        this.camera.inertia = 1;

        this.camera.panningSensibility = 1;
        this.camera.angularSensibilityX = 300;
        this.camera.angularSensibilityY = 300;
    }

    private createLight() {
        // this.light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), this.scene);
        // this.light.groundColor = new BABYLON.Color3(0.9, 0.9, 0.9);
        // this.light.intensity = 1;
        // this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        // this.light.specular = new BABYLON.Color3(1, 1, 1);

        this.dirlight = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(0, 1, 0), this.scene);
        this.dirlight.intensity = 1.2;
        // this.dirlight.range = 10000;
        // this.dirlight.radius = 10000;
        this.dirlight.diffuse = new BABYLON.Color3(1, 1, 1);
    }

    private showAxis(size) {
        let origin = BABYLON.Vector3.Zero();
        let me = this;
        let axisX = BABYLON.Mesh.CreateLines('axisX', [origin, new BABYLON.Vector3(size, 0, 0)], me.scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        let axisY = BABYLON.Mesh.CreateLines('axisY', [origin, new BABYLON.Vector3(0, size, 0)], me.scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        let axisZ = BABYLON.Mesh.CreateLines('axisZ', [origin, new BABYLON.Vector3(0, 0, size)], me.scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
    }

    custombb_mesh: BABYLON.Mesh;

    _bounds: string = '';

    public get Bounds(): string {
        return this._bounds;
    }

    public displayBounds() {

        if (this.custombb_mesh != null) {
            this.scene.removeMesh(this.custombb_mesh);
            this.custombb_mesh.dispose();
        };

        let bounds = this.camera.computeBounds();

        this._bounds = 'Min = ' + bounds.minimum.toString() + '  Max = ' + bounds.maximum.toString();

        let min_coordinates = bounds.minimum;
        let max_coordinates = bounds.maximum;

        this.custombb_mesh = new BABYLON.Mesh('custom_boundingbox', this.scene);
        let vertexdata = new BABYLON.VertexData();
        vertexdata.indices = [];
        vertexdata.positions = [
            min_coordinates.x, min_coordinates.y, min_coordinates.z,
            max_coordinates.x, max_coordinates.y, max_coordinates.z
        ];
        vertexdata.applyToMesh(this.custombb_mesh);
        this.custombb_mesh.refreshBoundingInfo();
        this.custombb_mesh.showBoundingBox = true;
    }

    private runRenderLoop() {
        this.scene.render();
    }



    ReSize() {
        this.engine.resize();
        // this.ZoomFit();
    }

    public SetBackground(color: BABYLON.Color3) {
        this.scene.clearColor = color;

        // var url = "appScripts/Viewer/Gradient.jpg";
        // var background = new BABYLON.Layer("back", url, this.scene);
        // background.isBackground = true;
    }

    PositionCamera() {
        this.engine.resize();
        this.camera.IsometricView();
    }

    ZoomFit() {
        this.camera.ZoomAll();
    }

    FrontView() {
        this.camera.FrontView();
    }

    BackView() {
        this.camera.BackView();
    }

    LeftView() {
        this.camera.LeftView();
    }

    TopView() {
        this.camera.TopView();
    }

    RightView() {
        this.camera.RightView();
    }

    IsometricView() {
        this.camera.IsometricView();
    }

    PointerMode() {
        this.camera.pointerMode = MyCameraPointersInput.POINTER_MODE_SELECT;
        document.getElementById('content-viewer').style.cursor = '';
    }

    PanMode() {
        this.camera.pointerMode = MyCameraPointersInput.POINTER_MODE_PAN;
        document.getElementById('content-viewer').style.cursor = 'move';
    }

}
