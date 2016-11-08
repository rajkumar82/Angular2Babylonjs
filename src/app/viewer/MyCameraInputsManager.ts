/// <reference path="../../../node_modules/babylonjs/babylon.d.ts" />
import {MyCamera} from './MyCamera';
import {MyCameraMouseWheelInput} from './MyCameraMouseWheelInput';
import {MyCameraPointersInput} from './MyCameraPointersInput';


export class MyCameraInputsManager extends BABYLON.CameraInputsManager<MyCamera> {
    constructor(camera: MyCamera) {
        super(camera);
    }

    public addMouseWheel(): MyCameraInputsManager {
        this.add(new MyCameraMouseWheelInput());
        return this;
    }

    public addPointers(): MyCameraInputsManager {
        this.add(new MyCameraPointersInput());
        return this;
    }

    public addKeyboard(): MyCameraInputsManager {
        // this.add(new ArcRotateCameraKeyboardMoveInput());
        return this;
    }

    public addGamepad(): MyCameraInputsManager {
        // this.add(new ArcRotateCameraGamepadInput());
        return this;
    }

    public addVRDeviceOrientation(): MyCameraInputsManager {
        // this.add(new ArcRotateCameraVRDeviceOrientationInput());
        return this;
    }
}