/// <reference path="../../../node_modules/babylonjs/babylon.d.ts" />
import {MyCamera} from './MyCamera';

export class MyCameraMouseWheelInput implements BABYLON.ICameraInput<MyCamera> {
    camera: MyCamera;

    private _wheel: (p: BABYLON.PointerInfo, s: BABYLON.EventState) => void;
    private _observer: BABYLON.Observer<BABYLON.PointerInfo>;

    @BABYLON.serialize()
    public wheelPrecision = 3.0;

    public attachControl(element: HTMLElement, noPreventDefault?: boolean) {
        this._wheel = (p, s) => {
            // sanity check - this should be a PointerWheel event.
            if (p.type !== BABYLON.PointerEventTypes.POINTERWHEEL) return;
            var event = <MouseWheelEvent>p.event;
            var delta = 0;
            if (event.wheelDelta) {
                delta = event.wheelDelta / (this.wheelPrecision * 40);
            } else if (event.detail) {
                delta = -event.detail / this.wheelPrecision;
            }

            if (delta)
                this.camera.inertialRadiusOffset += delta;

            if (event.preventDefault) {
                if (!noPreventDefault) {
                    event.preventDefault();
                }
            }
        };

        this._observer = this.camera.getScene().onPointerObservable.add(this._wheel, BABYLON.PointerEventTypes.POINTERWHEEL);
    }

    public detachControl(element: HTMLElement) {
        if (this._observer && element) {
            this.camera.getScene().onPointerObservable.remove(this._observer);
            this._observer = null;
            this._wheel = null;
        }
    }

    getTypeName(): string {
        return 'MyCameraMouseWheelInput';
    }

    getSimpleName() {
        return 'mousewheel';
    }
}

BABYLON.CameraInputTypes['MyCameraMouseWheelInput'] = MyCameraMouseWheelInput;
