/// <reference path="../../../node_modules/babylonjs/babylon.d.ts" />
import {MyCameraInputsManager} from "./MyCameraInputsManager"
import {MyCameraPointersInput} from "./MyCameraPointersInput"
import {MyCameraMouseWheelInput} from "./MyCameraMouseWheelInput"

export class MyCamera extends BABYLON.TargetCamera {

    @BABYLON.serialize()
    public alpha: number;

    @BABYLON.serialize()
    public beta: number;

    @BABYLON.serialize()
    public radius: number;

    @BABYLON.serializeAsVector3()
    public target: BABYLON.Vector3;

    @BABYLON.serialize()
    public inertialAlphaOffset = 0;

    @BABYLON.serialize()
    public inertialBetaOffset = 0;

    @BABYLON.serialize()
    public inertialRadiusOffset = 0;

    @BABYLON.serialize()
    public lowerAlphaLimit = null;

    @BABYLON.serialize()
    public upperAlphaLimit = null;

    @BABYLON.serialize()
    public lowerBetaLimit = 0.01;

    @BABYLON.serialize()
    public upperBetaLimit = Math.PI;

    @BABYLON.serialize()
    public lowerRadiusLimit = null;

    @BABYLON.serialize()
    public upperRadiusLimit = null;

    @BABYLON.serialize()
    public inertialPanningX: number = 0;

    @BABYLON.serialize()
    public inertialPanningY: number = 0;

    //-- begin properties for backward compatibility for inputs       
    public get angularSensibilityX() {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers)
            return pointers.angularSensibilityX;
    }

    public set angularSensibilityX(value) {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers) {
            pointers.angularSensibilityX = value;
        }
    }

    public get angularSensibilityY() {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers)
            return pointers.angularSensibilityY;
    }

    public set angularSensibilityY(value) {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers) {
            pointers.angularSensibilityY = value;
        }
    }

    public get pinchPrecision() {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers)
            return pointers.pinchPrecision;
    }

    public set pinchPrecision(value) {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers) {
            pointers.pinchPrecision = value;
        }
    }

    public get panningSensibility() {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers)
            return pointers.panningSensibility;
    }

    public set panningSensibility(value) {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers) {
            pointers.panningSensibility = value;
        }
    }

    public set pointerMode(val:number) {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers) {
            pointers.PointerMode = val;
        }
    }

    public get pointerMode(): number {
        var pointers = <MyCameraPointersInput>this.inputs.attached["pointers"];
        if (pointers) {
            return pointers.PointerMode;
        }
        return MyCameraPointersInput.POINTER_MODE_SELECT;
    }

    public get keysUp() {
        //var keyboard = <ArcRotateCameraKeyboardMoveInput>this.inputs.attached["keyboard"];
        //if (keyboard)
        //    return keyboard.keysUp;
        return [];
    }

    public set keysUp(value) {
        //var keyboard = <ArcRotateCameraKeyboardMoveInput>this.inputs.attached["keyboard"];
        //if (keyboard)
        //    keyboard.keysUp = value;
    }

    public get keysDown() {
        //var keyboard = <ArcRotateCameraKeyboardMoveInput>this.inputs.attached["keyboard"];
        //if (keyboard)
        //    return keyboard.keysDown;
        return [];
    }

    public set keysDown(value) {
        //var keyboard = <ArcRotateCameraKeyboardMoveInput>this.inputs.attached["keyboard"];
        //if (keyboard)
        //    keyboard.keysDown = value;
    }

    public get keysLeft() {
        //var keyboard = <ArcRotateCameraKeyboardMoveInput>this.inputs.attached["keyboard"];
        //if (keyboard)
        //    return keyboard.keysLeft;
        return [];
    }

    public set keysLeft(value) {
        //var keyboard = <ArcRotateCameraKeyboardMoveInput>this.inputs.attached["keyboard"];
        //if (keyboard)
        //    keyboard.keysLeft = value;
    }

    public get keysRight() {
        //var keyboard = <ArcRotateCameraKeyboardMoveInput>this.inputs.attached["keyboard"];
        //if (keyboard)
        //    return keyboard.keysRight;
        return [];
    }

    public set keysRight(value) {
        //var keyboard = <ArcRotateCameraKeyboardMoveInput>this.inputs.attached["keyboard"];
        //if (keyboard)
        //    keyboard.keysRight = value;        
    }

    public get wheelPrecision() {
        var mousewheel = <MyCameraMouseWheelInput>this.inputs.attached["mousewheel"];
        if (mousewheel)
            return mousewheel.wheelPrecision;
    }

    public set wheelPrecision(value) {
        var mousewheel = <MyCameraMouseWheelInput>this.inputs.attached["mousewheel"];
        if (mousewheel)
            mousewheel.wheelPrecision = value;
    }

    //-- end properties for backward compatibility for inputs        

    @BABYLON.serialize()
    public zoomOnFactor = 1;

    public targetScreenOffset = BABYLON.Vector2.Zero();

    @BABYLON.serialize()
    public allowUpsideDown = true;

    public _viewMatrix = new BABYLON.Matrix();
    public _useCtrlForPanning: boolean;
    public inputs: MyCameraInputsManager;

    public _reset: () => void;

    // Panning
    public panningAxis: BABYLON.Vector3 = new BABYLON.Vector3(1, 1, 0);
    private _localDirection: BABYLON.Vector3;
    private _transformedDirection: BABYLON.Vector3;

    // Collisions
    public onCollide: (collidedMesh: BABYLON.AbstractMesh) => void;
    public checkCollisions = false;
    public collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5);
    private _collider = new BABYLON.Collider();
    private _previousPosition = BABYLON.Vector3.Zero();
    private _collisionVelocity = BABYLON.Vector3.Zero();
    private _newPosition = BABYLON.Vector3.Zero();
    private _previousAlpha: number;
    private _previousBeta: number;
    private _previousRadius: number;
    //due to async collision inspection
    private _collisionTriggered: boolean;

    constructor(name: string, alpha: number, beta: number, radius: number, target: BABYLON.Vector3, scene: BABYLON.Scene) {
        super(name, BABYLON.Vector3.Zero(), scene);

        if (!target) {
            this.target = BABYLON.Vector3.Zero();
        } else {
            this.target = target;
        }

        this.alpha = alpha;
        this.beta = beta;
        this.radius = radius;

        this.getViewMatrix();
        this.inputs = new MyCameraInputsManager(this);
        this.inputs.addKeyboard().addMouseWheel().addPointers().addGamepad();
    }

    // Cache
    public _initCache(): void {
        super._initCache();
        this._cache.target = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._cache.alpha = undefined;
        this._cache.beta = undefined;
        this._cache.radius = undefined;
        this._cache.targetScreenOffset = BABYLON.Vector2.Zero();
    }

    public _updateCache(ignoreParentClass?: boolean): void {
        if (!ignoreParentClass) {
            super._updateCache();
        }

        this._cache.target.copyFrom(this._getTargetPosition());
        this._cache.alpha = this.alpha;
        this._cache.beta = this.beta;
        this._cache.radius = this.radius;
        this._cache.targetScreenOffset.copyFrom(this.targetScreenOffset);
    }

    private _getTargetPosition(): BABYLON.Vector3 {
        if ((<any>this.target).getAbsolutePosition) {
            return (<any>this.target).getAbsolutePosition();
        }

        return this.target;
    }

    // Synchronized
    public _isSynchronizedViewMatrix(): boolean {
        if (!super._isSynchronizedViewMatrix())
            return false;

        return this._cache.target.equals(this.target)
            && this._cache.alpha === this.alpha
            && this._cache.beta === this.beta
            && this._cache.radius === this.radius
            && this._cache.targetScreenOffset.equals(this.targetScreenOffset);
    }

    // Methods
    public attachControl(element: HTMLElement, noPreventDefault?: boolean, useCtrlForPanning: boolean = true): void {
        this._useCtrlForPanning = useCtrlForPanning;

        this.inputs.attachElement(element, noPreventDefault);

        this._reset = () => {
            this.inertialAlphaOffset = 0;
            this.inertialBetaOffset = 0;
            this.inertialRadiusOffset = 0;
        };
    }

    public detachControl(element: HTMLElement): void {
        this.inputs.detachElement(element);

        if (this._reset) {
            this._reset();
        }
    }


    public computeBounds() {
        var scene = this.getScene();
        var min = new BABYLON.Vector3(1e7, 1e7, 1e7);
        var max = new BABYLON.Vector3(-1e7, -1e7, -1e7);
        for (var i = 0; i < scene.meshes.length; i++) {

            var mesh = scene.meshes[i];
            if (mesh.isVisible == false) continue;

            var sp = mesh.getBoundingInfo().boundingSphere;
            if (sp.radius == 0)
                continue;

            var bmax = mesh.getBoundingInfo().boundingBox.maximumWorld;
            var bmin = mesh.getBoundingInfo().boundingBox.minimumWorld;

            if (bmin.x < min.x) min.x = bmin.x;
            if (bmin.y < min.y) min.y = bmin.y;
            if (bmin.z < min.z) min.z = bmin.z;

            if (max.x < bmax.x) max.x = bmax.x;
            if (max.y < bmax.y) max.y = bmax.y;
            if (max.z < bmax.z) max.z = bmax.z;
        }
        return new BABYLON.BoundingInfo(min, max);
    }

    private computeTransformedBounds(bounds: BABYLON.BoundingInfo) {
        //var min = bounds.minimum;
        //var max = bounds.maximum;
        //var mintrans = BABYLON.Vector3.Zero();
        //var maxtrans = BABYLON.Vector3.Zero();

        //this._viewMatrix.invertToRef(this._cameraTransformMatrix);
        //BABYLON.Vector3.TransformNormalToRef(min, this._cameraTransformMatrix, mintrans);
        //BABYLON.Vector3.TransformNormalToRef(max, this._cameraTransformMatrix, maxtrans);
        //var boundTrans = new BABYLON.BoundingInfo(mintrans, maxtrans);
        //return boundTrans;
        return bounds;
    }

    private zoomToBounds(canSetPos: boolean) {
        var bounds = this.computeBounds();
        var boundTrans = this.computeTransformedBounds(bounds);

        var r = boundTrans.boundingSphere.radius;
        var dist = r / (2 * Math.tan(this.fov));
        var aspect = this.getEngine().getAspectRatio(this, true);

        

        if (canSetPos === true)
            this._newPos = new BABYLON.Vector3(boundTrans.boundingSphere.center.x,
                boundTrans.boundingSphere.center.y,
                boundTrans.boundingSphere.radius + dist);
        this._newTarget = boundTrans.boundingSphere.center;

        this.adjustFit(r);
    }

    factor: number;
    _newPos: BABYLON.Vector3;
    _newTarget: BABYLON.Vector3;

   

    public PositionCamera() {
        this.zoomToBounds(true);
    }
    
    public ZoomAll() {
        this.zoomToBounds(false);        
    }

    public FrontView() {
        var bound = this.computeBounds();
        var bounds = this.computeTransformedBounds(bound);
        var dist = bounds.boundingSphere.radius / (2 * Math.tan(this.fov));

        var p = bounds.boundingSphere.radius + dist;
        var x = bounds.boundingSphere.center.x;
        var y = bounds.boundingSphere.center.y;
        var r = bounds.boundingSphere.radius;


        this._newPos = (new BABYLON.Vector3(x, y, p));
        this._newTarget = (bounds.boundingSphere.center);

        this.adjustFit(r);
    }

    BackView() {
        var bound = this.computeBounds();
        var bounds = this.computeTransformedBounds(bound);
        var dist = bounds.boundingSphere.radius / (2 * Math.tan(this.fov));

        var r = bounds.boundingSphere.radius;
        var p = bounds.boundingSphere.radius + dist;
        var x = bounds.boundingSphere.center.x;
        var y = bounds.boundingSphere.center.y;


        this._newPos = (new BABYLON.Vector3(0, y, -p));
        this._newTarget = (bounds.boundingSphere.center);


        this.adjustFit(r);

    }

    LeftView() {
        var bound = this.computeBounds();
        var bounds = this.computeTransformedBounds(bound);
        var dist = bounds.boundingSphere.radius / (2 * Math.tan(this.fov));

        var p = bounds.boundingSphere.radius + dist;
        var x = bounds.boundingSphere.center.x;
        var y = bounds.boundingSphere.center.y;
        var z = bounds.boundingSphere.center.z;
        var r = bounds.boundingSphere.radius;

        this._newPos = (new BABYLON.Vector3(p, y, z));
        this._newTarget = (bounds.boundingSphere.center);

        this.adjustFit(r);
    }

    TopView() {

        var bound = this.computeBounds();
        var bounds = this.computeTransformedBounds(bound);
        var dist = bounds.boundingSphere.radius / (2 * Math.tan(this.fov));

        var p = bounds.boundingSphere.radius + dist;
        var x = bounds.boundingSphere.center.x;
        var y = bounds.boundingSphere.center.y;
        var z = bounds.boundingSphere.center.z;
        var r = bounds.boundingSphere.radius;


        this._newPos = (new BABYLON.Vector3(0, p,0));
        this._newTarget = (bounds.boundingSphere.center);

        
        this.adjustFit(r);
    }

    RightView() {
        var bound = this.computeBounds();
        var bounds = this.computeTransformedBounds(bound);
        var dist = bounds.boundingSphere.radius / (2 * Math.tan(this.fov));
        var p = bounds.boundingSphere.radius + dist;

        var x = bounds.boundingSphere.center.x;
        var y = bounds.boundingSphere.center.y;
        var z = bounds.boundingSphere.center.z;
        var r = bounds.boundingSphere.radius;

        this._newPos = (new BABYLON.Vector3(-p, y, z));
        this._newTarget = (bounds.boundingSphere.center);

        this.adjustFit(r);
    }

    IsometricView() {
        var bound = this.computeBounds();
        var bounds = this.computeTransformedBounds(bound);
        var dist = bounds.boundingSphere.radius / (2 * Math.tan(this.fov));
        var p = bounds.boundingSphere.radius + dist;
        var r = bounds.boundingSphere.radius;

        this._newPos = new BABYLON.Vector3(p, p, p);
        this._newTarget = (bounds.boundingSphere.center);

        //this.adjustFitNew(bounds.maximum, bounds.minimum);
        this.adjustFit(r);
        
    }

    private adjustFitNew(min: BABYLON.Vector3, max: BABYLON.Vector3) {
        var aspect = this.getEngine().getAspectRatio(this, true);
        this.factor = aspect * 1;

        this.orthoLeft = min.x * this.factor;
        this.orthoRight = max.x * this.factor;
        this.orthoTop = max.y * this.factor / aspect;
        this.orthoBottom = min.y * this.factor / aspect;
    }

    private adjustFit(r: number) {
        var aspect = this.getEngine().getAspectRatio(this, true);
        this.factor = aspect * 1;

        this.orthoLeft = r * this.factor;
        this.orthoRight = -r * this.factor;
        this.orthoTop = r * this.factor / aspect;
        this.orthoBottom = -r * this.factor / aspect;
    }


    public ConvertScreenToViewEx(x: number, y: number) {

        var i = BABYLON.Matrix.Identity();
        var dir = new BABYLON.Vector3(x, y, 0);
        var ret = BABYLON.Vector3.Unproject(dir,
            this.getEngine().getRenderWidth(),
            this.getEngine().getRenderHeight(),
            i,
            this.getViewMatrix(),
            this.getProjectionMatrix());
        return ret;
    }

    public ConvertScreenToView(x: number, y: number) {        
        var dir = new BABYLON.Vector3(x, y, y);
        var ret = BABYLON.Vector3.Unproject(dir,
            this.getEngine().getRenderWidth(),
            this.getEngine().getRenderHeight(),
            this.getWorldMatrix(),
            this.getViewMatrix(),
            this.getProjectionMatrix());
        return ret;       
    }

    public _checkInputs(): void {
        //if (async) collision inspection was triggered, don't update the camera's position - until the collision callback was called.
        if (this._collisionTriggered) {
            return;
        }

        this.inputs.checkInputs();

        // Inertia
        if (this.inertialAlphaOffset !== 0 || this.inertialBetaOffset !== 0 || this.inertialRadiusOffset !== 0) {

            this.alpha += this.beta <= 0 ? this.inertialAlphaOffset : -this.inertialAlphaOffset;

            this.beta += this.inertialBetaOffset;
            this.radius -= this.inertialRadiusOffset;
            this.inertialAlphaOffset *= this.inertia;
            this.inertialBetaOffset *= this.inertia;
            this.inertialRadiusOffset *= this.inertia;
            if (Math.abs(this.inertialAlphaOffset) < BABYLON.Epsilon)
                this.inertialAlphaOffset = 0;
            if (Math.abs(this.inertialBetaOffset) < BABYLON.Epsilon)
                this.inertialBetaOffset = 0;
            if (Math.abs(this.inertialRadiusOffset) < BABYLON.Epsilon)
                this.inertialRadiusOffset = 0;

            this.inertialAlphaOffset = 0;
            this.inertialBetaOffset = 0;
            this.inertialRadiusOffset = 0;
        }

        // Panning inertia
        if (this.inertialPanningX !== 0 || this.inertialPanningY !== 0) {
            if (!this._localDirection) {
                this._localDirection = BABYLON.Vector3.Zero();
                this._transformedDirection = BABYLON.Vector3.Zero();
            }

            this.inertialPanningX *= this.inertia;
            this.inertialPanningY *= this.inertia;

            if (Math.abs(this.inertialPanningX) < BABYLON.Epsilon)
                this.inertialPanningX = 0;
            if (Math.abs(this.inertialPanningY) < BABYLON.Epsilon)
                this.inertialPanningY = 0;

            var orthowidth = this.orthoRight - this.orthoLeft;
            var orthoheight = this.orthoTop - this.orthoBottom;

            var xfactor = orthowidth * this.inertialPanningX / this.getEngine().getRenderWidth();
            var yfactor = orthoheight * this.inertialPanningY / this.getEngine().getRenderHeight();

            this.orthoLeft += xfactor;
            this.orthoRight += xfactor;
            this.orthoTop += yfactor;
            this.orthoBottom += yfactor;

            //reset inertial panning now
            this.inertialPanningX = 0;
            this.inertialPanningY = 0;
        }

        var bRebuild = false;

        //position
        if (!this.position.equals(this._newPos) && this._newPos != null) {
            this.position = this._newPos;
            bRebuild = true;
        }

        //target
        if (!this.target.equals(this._newTarget) && this._newTarget != null) {
            this.target = this._newTarget;
            bRebuild = true;
        }

        if (bRebuild)
            this.rebuildAnglesAndRadius();
        else
        // Limits
        this._checkLimits();

        super._checkInputs();
    }

    private _checkLimits() {
        if (this.lowerBetaLimit === null || this.lowerBetaLimit === undefined) {
            if (this.allowUpsideDown && this.beta > Math.PI) {
                this.beta = this.beta - (2 * Math.PI);
            }
        } else {
            if (this.beta < this.lowerBetaLimit) {
                this.beta = this.lowerBetaLimit;
            }
        }

        if (this.upperBetaLimit === null || this.upperBetaLimit === undefined) {
            if (this.allowUpsideDown && this.beta < -Math.PI) {
                this.beta = this.beta + (2 * Math.PI);
            }
        } else {
            if (this.beta > this.upperBetaLimit) {
                this.beta = this.upperBetaLimit;
            }
        }

        if (this.lowerAlphaLimit && this.alpha < this.lowerAlphaLimit) {
            this.alpha = this.lowerAlphaLimit;
        }
        if (this.upperAlphaLimit && this.alpha > this.upperAlphaLimit) {
            this.alpha = this.upperAlphaLimit;
        }

        if (this.lowerRadiusLimit && this.radius < this.lowerRadiusLimit) {
            this.radius = this.lowerRadiusLimit;
        }
        if (this.upperRadiusLimit && this.radius > this.upperRadiusLimit) {
            this.radius = this.upperRadiusLimit;
        }
    }

    public rebuildAnglesAndRadius() {
        var radiusv3 = this.position.subtract(this._getTargetPosition());
        this.radius = radiusv3.length();

        // Alpha
        this.alpha = Math.acos(radiusv3.x / Math.sqrt(Math.pow(radiusv3.x, 2) + Math.pow(radiusv3.z, 2)));

        if (radiusv3.z < 0) {
            this.alpha = 2 * Math.PI - this.alpha;
        }

        // Beta
        this.beta = Math.acos(radiusv3.y / this.radius);

        this._checkLimits();
    }

    public setPosition(position: BABYLON.Vector3): void {
        if (this.position.equals(position)) {
            return;
        }
        this.position = position;

        this.rebuildAnglesAndRadius();
    }

    public setTarget(target: BABYLON.Vector3): void {
        if (this._getTargetPosition().equals(target)) {
            return;
        }
        this.target = target;
        this.rebuildAnglesAndRadius();
    }

    public _getViewMatrix(): BABYLON.Matrix {
        // Compute
        var cosa = Math.cos(this.alpha);
        var sina = Math.sin(this.alpha);
        var cosb = Math.cos(this.beta);
        var sinb = Math.sin(this.beta);

        if (sinb === 0) {
            sinb = 0.0001;
        }

        var target = this._getTargetPosition();
        target.addToRef(new BABYLON.Vector3(this.radius * cosa * sinb, this.radius * cosb, this.radius * sina * sinb), this._newPosition);
        if (this.getScene().collisionsEnabled && this.checkCollisions) {
            this._collider.radius = this.collisionRadius;
            this._newPosition.subtractToRef(this.position, this._collisionVelocity);
            this._collisionTriggered = true;
            this.getScene().collisionCoordinator.getNewPosition(this.position, this._collisionVelocity, this._collider, 3, null, this._onCollisionPositionChange, this.uniqueId);
        } else {
            this.position.copyFrom(this._newPosition);

            var up = this.upVector;
            if (this.allowUpsideDown && this.beta < 0) {
                up = up.clone();
                up = up.negate();
            }

            BABYLON.Matrix.LookAtLHToRef(this.position, target, up, this._viewMatrix);
            this._viewMatrix.m[12] += this.targetScreenOffset.x;
            this._viewMatrix.m[13] += this.targetScreenOffset.y;
        }
        return this._viewMatrix;
    }

    private _onCollisionPositionChange = (collisionId: number, newPosition: BABYLON.Vector3, collidedMesh: BABYLON.AbstractMesh = null) => {

        if (this.getScene().workerCollisions && this.checkCollisions) {
            newPosition.multiplyInPlace(this._collider.radius);
        }

        if (!collidedMesh) {
            this._previousPosition.copyFrom(this.position);
        } else {
            this.setPosition(newPosition);

            if (this.onCollide) {
                this.onCollide(collidedMesh);
            }
        }

        // Recompute because of constraints
        var cosa = Math.cos(this.alpha);
        var sina = Math.sin(this.alpha);
        var cosb = Math.cos(this.beta);
        var sinb = Math.sin(this.beta);

        if (sinb === 0) {
            sinb = 0.0001;
        }

        var target = this._getTargetPosition();
        target.addToRef(new BABYLON.Vector3(this.radius * cosa * sinb, this.radius * cosb, this.radius * sina * sinb), this._newPosition);
        this.position.copyFrom(this._newPosition);

        var up = this.upVector;
        if (this.allowUpsideDown && this.beta < 0) {
            up = up.clone();
            up = up.negate();
        }

        BABYLON.Matrix.LookAtLHToRef(this.position, target, up, this._viewMatrix);
        this._viewMatrix.m[12] += this.targetScreenOffset.x;
        this._viewMatrix.m[13] += this.targetScreenOffset.y;

        this._collisionTriggered = false;
    }

    public zoomOn(meshes?: BABYLON.AbstractMesh[], doNotUpdateMaxZ = false): void {
        meshes = meshes || this.getScene().meshes;

        var minMaxVector = BABYLON.Mesh.MinMax(meshes);
        var distance = BABYLON.Vector3.Distance(minMaxVector.min, minMaxVector.max);

        this.radius = distance * this.zoomOnFactor;

        this.focusOn({ min: minMaxVector.min, max: minMaxVector.max, distance: distance }, doNotUpdateMaxZ);
    }

    public focusOn(meshesOrMinMaxVectorAndDistance, doNotUpdateMaxZ = false): void {
        var meshesOrMinMaxVector;
        var distance;

        if (meshesOrMinMaxVectorAndDistance.min === undefined) { // meshes
            meshesOrMinMaxVector = meshesOrMinMaxVectorAndDistance || this.getScene().meshes;
            meshesOrMinMaxVector = BABYLON.Mesh.MinMax(meshesOrMinMaxVector);
            distance = BABYLON.Vector3.Distance(meshesOrMinMaxVector.min, meshesOrMinMaxVector.max);
        }
        else { //minMaxVector and distance
            meshesOrMinMaxVector = meshesOrMinMaxVectorAndDistance;
            distance = meshesOrMinMaxVectorAndDistance.distance;
        }

        this.target = BABYLON.Mesh.Center(meshesOrMinMaxVector);

        if (!doNotUpdateMaxZ) {
            this.maxZ = distance * 2;
        }
    }

    /**
     * @override
     * Override Camera.createRigCamera
     */
    public createRigCamera(name: string, cameraIndex: number): BABYLON.Camera {
        switch (this.cameraRigMode) {
            case BABYLON.Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH:
            case BABYLON.Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL:
            case BABYLON.Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_CROSSEYED:
            case BABYLON.Camera.RIG_MODE_STEREOSCOPIC_OVERUNDER:
            case BABYLON.Camera.RIG_MODE_VR:
                var alphaShift = this._cameraRigParams.stereoHalfAngle * (cameraIndex === 0 ? 1 : -1);
                var rigCam = new MyCamera(name, this.alpha + alphaShift, this.beta, this.radius, this.target, this.getScene());
                rigCam._cameraRigParams = {};
                return rigCam;
        }
        return null;
    }

    /**
     * @override
     * Override Camera._updateRigCameras
     */
    public _updateRigCameras() {
        switch (this.cameraRigMode) {
            case BABYLON.Camera.RIG_MODE_STEREOSCOPIC_ANAGLYPH:
            case BABYLON.Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_PARALLEL:
            case BABYLON.Camera.RIG_MODE_STEREOSCOPIC_SIDEBYSIDE_CROSSEYED:
            case BABYLON.Camera.RIG_MODE_STEREOSCOPIC_OVERUNDER:
            case BABYLON.Camera.RIG_MODE_VR:
                var camLeft = <MyCamera>this._rigCameras[0];
                var camRight = <MyCamera>this._rigCameras[1];
                camLeft.alpha = this.alpha - this._cameraRigParams.stereoHalfAngle;
                camRight.alpha = this.alpha + this._cameraRigParams.stereoHalfAngle;
                camLeft.beta = camRight.beta = this.beta;
                camLeft.radius = camRight.radius = this.radius;
                break;
        }
        super._updateRigCameras();
    }

    public dispose(): void {
        this.inputs.clear();
        super.dispose();
    }

    public getTypeName(): string {
        return "MyCamera";
    }
}

