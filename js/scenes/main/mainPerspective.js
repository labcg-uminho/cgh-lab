/**
 * Created by TiagoLuís on 18/02/2015.
 */

MainPerspective = function( renderer, camera )
{
    this.scene = new THREE.Scene();
    this.objects = [];
    this.mirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color:0x889999 } );

    this.platePosition = new THREE.Vector3(0,4,0);
    this.plateRotation = 0;//-Math.PI/4;
    //var plateNormal = new THREE.Vector3(Math.sin(this.plateRotation), 0, Math.cos(this.plateRotation)).normalize();
    //The objective is to the normal of the plate make a 45º degree angle with the direction of the mirror and object

    //      Normal
    // M      /\     Obj
    //   .    |    .
    //     .  |  .
    //   45º .|. 45º
    //==================
    //      PLATE

    //Direction of mirror in relation to plate
    var dirMirror = new THREE.Vector3(Math.sin(this.plateRotation+Math.PI/4), 0, Math.cos(this.plateRotation+Math.PI/4)).normalize();
    var unitsMirror = 25;
    this.mirrorPosition = new THREE.Vector3();
    this.mirrorPosition.addVectors(this.platePosition, dirMirror.multiplyScalar(unitsMirror));
    this.mirrorRotation = -Math.PI/2 + this.plateRotation;

    //Direction of object in relation to plate
    var dirObject = new THREE.Vector3(Math.sin(this.plateRotation-Math.PI/4), 0, Math.cos(this.plateRotation-Math.PI/4)).normalize();
    var unitsObject = 30;
    this.objectPosition = new THREE.Vector3();
    this.objectPosition.addVectors(this.platePosition, dirObject.multiplyScalar(unitsObject));
    this.objectRotation = this.plateRotation + Math.PI/4;
    this.object = new HoloObject(this.objectPosition, this.objectRotation);

    //Direction of laser in relation to object
    //This direction is the same as the mirror direction but the position is calculated in relation to the object and not the plate
    var dirLaser = new THREE.Vector3(Math.sin(this.plateRotation+Math.PI/4), 0, Math.cos(this.plateRotation+Math.PI/4)).normalize();
    var unitsLaser = 30;
    this.laserPosition = new THREE.Vector3();
    this.laserPosition.addVectors(this.objectPosition, dirLaser.multiplyScalar(unitsLaser));
    this.laserRotation = this.plateRotation + Math.PI/4;

    //Direction of beam splitter in relation to mirror
    //This direction is the same as the object direction but the position is calculated in relation to the mirror and not the plate
    var dirSplitter = new THREE.Vector3(Math.sin(this.plateRotation-Math.PI/4), 0, Math.cos(this.plateRotation-Math.PI/4)).normalize();
    var unitsSplitter = 30;
    this.beamSplitterPosition = new THREE.Vector3();
    this.beamSplitterPosition.addVectors(this.mirrorPosition, dirSplitter.multiplyScalar(unitsSplitter));
    this.beamSplitterRotation = this.plateRotation + Math.PI/4;

    var center = new THREE.Vector3();
    center.addVectors(this.platePosition,this.laserPosition).divideScalar(2);

    this.waveLength = 3;

    var laserLight1 = {
        list: [],
        next: [],
        beam: [],
        object: []
    };
    var laserLight2 = {
        list: [],
        mirror: []
    };
    var laserLight3 = [];
    var objWaveLight = [];

    this.getCenter = function(){
        return center;
    };

    this.getDirMirror = function(){
        return dirMirror;
    };

    this.getDirObject = function(){
        return dirObject;
    };

    this.getDirLaser = function(){
        return dirLaser;
    };

    this.getDirSplitter = function(){
        return dirSplitter;
    };

    this.getLaserLight1 = function(){
        return laserLight1;
    };

    this.getLaserLight2 = function(){
        return laserLight2;
    };

    this.getLaserLight3 = function(){
        return laserLight3;
    };

    this.addToLaserLight1 = function( obj ){
        laserLight1.list.push(obj);
        laserLight1.next.push(false);
        laserLight1.beam.push(false);
        laserLight1.object.push(false);
    };

    this.removeFromLaserLight1 = function( obj ){
        var i = laserLight1.list.indexOf(obj);
        laserLight1.list.slice(i, 1);
        laserLight1.next.slice(i, 1);
        laserLight1.beam.slice(i, 1);
        laserLight1.object.slice(i, 1);
    };

    this.addToLaserLight2 = function( obj ){
        laserLight2.list.push(obj);
        laserLight2.mirror.push(false);
    };

    this.removeFromLaserLight2 = function( obj ){
        var i = laserLight2.list.indexOf(obj);
        laserLight2.list.slice(i, 1);
        laserLight2.mirror.slice(i, 1);
    };

    this.addToLaserLight3 = function( obj ){
        laserLight3.push(obj);
    };

    this.removeFromLaserLight3 = function( obj ){
        var i = laserLight3.indexOf(obj);
        laserLight3.slice(i, 1);
    };

    this.getObjWaveLight = function(){
        return objWaveLight;
    };

    this.addToObjWaveLight = function( obj ){
        objWaveLight.push(obj);
    };

    this.removeFromObjWaveLight = function(obj){
        var i = objWaveLight.indexOf(obj);
        objWaveLight.slice(i, 1);
    };

    this.eraseWaveArrays = function(){
        laserLight1.list = [];
        laserLight1.next = [];
        laserLight1.beam = [];
        laserLight1.object = [];
        laserLight2.list = [];
        laserLight2.mirror = [];
        laserLight3 = [];
        objWaveLight = [];
    };
};

MainPerspective.prototype = {

    constructor: MainPerspective,

    objectRotationPlus: function()
    {
        var o = this.scene.getObjectByName('object');
        var rad = (Math.PI)/180;
        o.rotateY(rad);
        if ((this.objectRotation + rad) > 2*Math.PI) this.objectRotation = 0;
        else this.objectRotation += rad;
    },

    init: function()
    {
        //GEOMETRY
        //MIRROR
        var mirror = new THREE.Mesh(new THREE.PlaneGeometry( 6, 6 ), this.mirror.material );
        mirror.add(this.mirror);
        mirror.position.set(this.mirrorPosition.x, this.mirrorPosition.y, this.mirrorPosition.z);
        mirror.rotateY(this.mirrorRotation);
        var mirrorBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
        var mirrorBoxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var mirrorBox = new THREE.Mesh(mirrorBoxGeometry, mirrorBoxMaterial);
        mirrorBox.scale.set(0.1,6,6);
        mirrorBox.position.set(0,0,-0.1);
        mirrorBox.rotateY(-Math.PI / 2);

        //LASER
        var laserSourceGeometry = new THREE.CylinderGeometry( 1, 1, 3, 32);
        var laserSourceMaterial = new THREE.MeshPhongMaterial( {color: 0x00ffff, ambient: 0x00ffff} );
        var laserSource = new THREE.Mesh(laserSourceGeometry, laserSourceMaterial);
        laserSource.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
        laserSource.rotateY(this.laserRotation);
        laserSource.rotateX(Math.PI / 2);
        laserSource.name = 'laser';

        //BEAM SPLITTER
        var beamSplitterGeometry = new THREE.BoxGeometry(1, 1, 1);
        var beamSplitterMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var beamSplitter = new THREE.Mesh(beamSplitterGeometry, beamSplitterMaterial);
        beamSplitter.scale.set(3,3,3);
        beamSplitter.position.set(this.beamSplitterPosition.x,this.beamSplitterPosition.y, this.beamSplitterPosition.z);
        beamSplitter.rotateY(this.beamSplitterRotation);

        //OBJECT
        this.object.setObject('cube');
        this.object.convertToLightPoints();

        //HOLOGRAPHIC PLATE
        var holographicPlateGeometry = new THREE.PlaneGeometry( 8, 8 );
        var holographicPlateMaterial = new THREE.MeshPhongMaterial({ color: 0x444444, ambient: 0x444444, side: THREE.DoubleSide });
        var holographicPlate = new THREE.Mesh(holographicPlateGeometry, holographicPlateMaterial);
        holographicPlate.position.set(this.platePosition.x, this.platePosition.y, this.platePosition.z);
        holographicPlate.rotateY(this.plateRotation);
        holographicPlate.name = 'plate';

        //FLOOR
        var floorGeometry = new THREE.PlaneGeometry( 50, 50);
        var floorMaterial = new THREE.MeshPhongMaterial( {color: 0x999999, ambient: 0x999999, side: THREE.DoubleSide} );
        var floor = new THREE.Mesh( floorGeometry, floorMaterial );
        floor.position.y = 0;
        floor.position.x = this.getCenter().x;
        floor.position.z = this.getCenter().z;
        floor.rotation.z = Math.PI / 4;
        floor.rotation.x = Math.PI / 2;

        //AXES HELPER
        var axes = new THREE.AxisHelper(10);
        this.scene.add( axes );

        //ADD STUFF TO SCENE
        this.scene.add(mirror);
        mirror.add(mirrorBox);
        this.scene.add(floor);
        this.scene.add(this.object.object);
        this.scene.add(holographicPlate);
        this.scene.add(laserSource);
        this.scene.add(beamSplitter);

        //ADD OBJECTS THAT YOU WHAT TO INTERACT INTO THE OBJECTS ARRAY
        this.objects.push(this.object.object);
        this.objects.push(holographicPlate);

        //LIGHT
        var ambLight = new THREE.AmbientLight( 0x505050 );
        //var light = new THREE.PointLight( 0xffffff, 1);
        var light = new THREE.PointLight(0xffffff, 1);
        var center = this.getCenter();
        light.position.set( center.x, 50, center.z);
        this.scene.add( ambLight );
        this.scene.add( light );

        /*var spotLight = new THREE.SpotLight( 0xffffff );
         spotLight.position.set( 100, 1000, 100 );
         spotLight.castShadow = true;
         spotLight.shadowMapWidth = 1024;
         spotLight.shadowMapHeight = 1024;
         spotLight.shadowCameraNear = 500;
         spotLight.shadowCameraFar = 4000;
         spotLight.shadowCameraFov = 30;
         this.scene.add( spotLight );*/
    },

    laserOn: function()
    {
        //var i;
        //var laser = this.scene.getObjectByName('laser');
        //var distance = this.laserPosition.distanceTo(this.objectPosition);
        //var distance2 = this.beamSplitterPosition.distanceTo(this.mirrorPosition);
        //var distance3 = this.mirrorPosition.distanceTo(this.platePosition);
        //var distance4 = this.objectPosition.distanceTo(this.platePosition);

        //var wavelength = 1;
        //Number of waves draw according to the wavelength and distance
        //var delta = distance/wavelength;
        //var delta2 = distance2/wavelength;
        //var delta3 = distance3/wavelength;
        //var delta4 = distance4/wavelength;

        var lightGeometry = new THREE.CircleGeometry(1,32);
        var lightMaterial = new THREE.MeshPhongMaterial( {color: 0x0000ff, ambient: 0x0000ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5} );
        var light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
        /*var light2 = light.clone();
        light2.rotateY(Math.PI/2);
        light2.position.set(this.beamSplitterPosition.x,this.beamSplitterPosition.y, this.beamSplitterPosition.z);
        var light3 = light.clone();
        light3.position.set(this.mirrorPosition.x, this.beamSplitterPosition.y, this.mirrorPosition.z);*/

        //var objWaveGeometry = this.object.object.geometry.clone();
        //var objWaveMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff , ambient: 0x0000ff, transparent: true, opacity: 0.5});
        //var objWave = new THREE.Mesh(objWaveGeometry, objWaveMaterial);
        //objWave.rotateY(this.objectRotation);
        //var objWaveBSP = new ThreeBSP(objWaveMesh);

        /*var cutterGeometry = new THREE.BoxGeometry(2,2,2);
        var cutterMesh = new THREE.Mesh(cutterGeometry);
        cutterMesh.position.set(objWaveMesh.position.x - 1, objWaveMesh.position.y, objWaveMesh.position.z);
        var cutterBSP = new ThreeBSP(cutterMesh);*/

        /*var objWaveMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00, transparent: true, opacity: 0.5});
        var newBSP = objWaveBSP.subtract(cutterBSP);
        var newMesh = newBSP.toMesh(objWaveMaterial);
        newMesh.rotateY(Math.PI/4);
        var objWave = newMesh;*/

        //alert('x: '+ this.dirLaser.normalize().x+' y: '+this.dirLaser.normalize().y+' z: '+this.dirLaser.normalize().z);
        //alert('x: '+ this.dirObject.normalize().x+' y: '+this.dirObject.normalize().y+' z: '+this.dirObject.normalize().z);
        //alert('x: '+ this.dirSplitter.normalize().x+' y: '+this.dirSplitter.normalize().y+' z: '+this.dirSplitter.normalize().z);

        //var copies = [];
        //var copies2 = [];
        //var copies3 = [];
        //var copies4 = [];
        //var scale = 3.0;
        //var dirLaser = this.getDirLaser();
        var copy = light.clone();
        copy.position.set(this.laserPosition.x /*- (dirLaser.normalize().x * (i*wavelength))*/, this.laserPosition.y, this.laserPosition.z /*- (dirLaser.normalize().z * (i*wavelength))*/);
        copy.rotateY(this.laserRotation);
        this.scene.add(copy);
        this.addToLaserLight1(copy);

        /*for(i = 0; i < 1; i++){
            var dirSplitter = this.getDirSplitter();
            copies2[i] = light2.clone();
            copies2[i].position.set(this.beamSplitterPosition.x - (dirSplitter.normalize().x * (i*wavelength)), this.beamSplitterPosition.y, this.beamSplitterPosition.z - (dirSplitter.normalize().z * (i*wavelength)));
            copies2[i].rotateY(this.beamSplitterRotation);
            this.scene.add(copies2[i]);
            this.addToLaserLight2(copies2[i]);
        }*/

        /*for(i = 0; i < delta3; i++){
            var dirMirror = this.getDirMirror();
            copies3[i] = light3.clone();
            copies3[i].position.set(this.mirrorPosition.x - (dirMirror.normalize().x * (i*wavelength)), this.mirrorPosition.y, this.mirrorPosition.z - (dirMirror.normalize().z * (i*wavelength)));
            copies3[i].rotateY(this.laserRotation);
            this.scene.add(copies3[i]);
            this.addToLaserLight3(copies3[i]);
        }*/

        /*for(i = 0; i < delta4; i++){
            var dirObject = this.getDirObject();
            copies4[i] = objWave.clone();
            copies4[i].scale.set(scale,scale,scale);
            copies4[i].position.set(this.objectPosition.x - (dirObject.normalize().x * (i*wavelength)), this.objectPosition.y, this.objectPosition.z - (dirObject.normalize().z * (i*wavelength)));
            this.addToObjWaveLight(copies4[i]);
            this.scene.add(copies4[i]);
            //scale += 0.1;
        }*/
        /*var axes1 = new THREE.AxisHelper(10);
         copies[0].add( axes1 );
         var axes2 = new THREE.AxisHelper(10);
         copies2[0].add( axes2 );
         var axes3 = new THREE.AxisHelper(10);
         copies3[0].add( axes3 );*/

    },

    setObjWave: function(){
        var objWaveGeometry = this.object.object.geometry.clone();
        var objWaveMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff , ambient: 0x0000ff, transparent: true, opacity: 0.5});
        var objWave = new THREE.Mesh(objWaveGeometry, objWaveMaterial);
        objWave.rotateY(this.objectRotation);
        return objWave;
    },

    laserOff: function(){
        var i;
        var laserLight1 = this.getLaserLight1();
        var laserLight2 = this.getLaserLight2();
        var laserLight3 = this.getLaserLight3();
        var objWaveLight = this.getObjWaveLight();
        for(i = 0; i < laserLight1.list.length; i++){
            this.scene.remove(laserLight1.list[i]);
        }
        for(i = 0; i < laserLight2.list.length; i++){
            this.scene.remove(laserLight2.list[i]);
        }
        for(i = 0; i < laserLight3.length; i++){
            this.scene.remove(laserLight3[i]);
        }
        for(i = 0; i < objWaveLight.length; i++){
            this.scene.remove(objWaveLight[i]);
        }
        this.eraseWaveArrays();
    },

    updateLaser: function(){
        var timer = 0.1;
        var i;
        var laserLight1 = this.getLaserLight1();
        var laserLight2 = this.getLaserLight2();
        var laserLight3 = this.getLaserLight3();
        var objWaveLight = this.getObjWaveLight();
        var dirLaser = this.getDirLaser();
        var dirSplitter = this.getDirSplitter();
        var dirMirror = this.getDirMirror();
        var dirObject = this.getDirObject();
        var objWave = this.setObjWave();
        for(i = 0; i < laserLight1.list.length; i++){
            laserLight1.list[i].position.z -= dirLaser.normalize().z * timer;
            laserLight1.list[i].position.x -= dirLaser.normalize().x * timer;
            if((laserLight1.list[i].position.distanceTo(this.laserPosition) > this.waveLength) && !laserLight1.next[i]){
                var newWave = laserLight1.list[i].clone();
                newWave.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
                this.addToLaserLight1(newWave);
                this.scene.add(newWave);
                laserLight1.next[i] = true;
            }
            if((laserLight1.list[i].position.z < this.beamSplitterPosition.z) && !laserLight1.beam[i]){
                var newSplit = laserLight1.list[i].clone();
                newSplit.position.set(this.beamSplitterPosition.x, this.beamSplitterPosition.y, this.beamSplitterPosition.z);
                newSplit.rotateY(Math.PI/2);
                this.addToLaserLight2(newSplit);
                this.scene.add(newSplit);
                laserLight1.beam[i] = true;
            }
            if (laserLight1.list[i].position.z < this.objectPosition.z) {
                //laserLight1.list[i].position.x = this.laserPosition.x;
                //laserLight1.list[i].position.z = this.laserPosition.z;
                this.scene.remove(laserLight1.list[i]);
                this.removeFromLaserLight1(laserLight1.list[i]);

                if(!laserLight1.object[i]) {
                    var newObjWave = objWave.clone();
                    newObjWave.position.set(this.objectPosition.x, this.objectPosition.y, this.objectPosition.z);
                    this.scene.add(newObjWave);
                    this.addToObjWaveLight(newObjWave);
                    laserLight1.object[i] = true;
                }
            }
        }
        for(i = 0; i < laserLight2.list.length; i++){
            laserLight2.list[i].position.z -= dirSplitter.normalize().z * timer;
            laserLight2.list[i].position.x -= dirSplitter.normalize().x * timer;
            if((laserLight2.list[i].position.z < this.mirrorPosition.z) && !laserLight2.mirror[i]){
                var newReflect = laserLight2.list[i].clone();
                newReflect.position.set(this.mirrorPosition.x, this.mirrorPosition.y, this.mirrorPosition.z);
                newReflect.rotateY(Math.PI/2);
                this.addToLaserLight3(newReflect);
                this.scene.add(newReflect);
                laserLight2.mirror[i] = true;
            }
            if (laserLight2.list[i].position.z < this.mirrorPosition.z) {
                //laserLight2[i].position.x = this.beamSplitterPosition.x;
                //laserLight2[i].position.z = this.beamSplitterPosition.z;
                this.scene.remove(laserLight2.list[i]);
                this.removeFromLaserLight2(laserLight2.list[i]);
            }
        }
        for(i = 0; i < laserLight3.length; i++){
            laserLight3[i].position.z -= dirMirror.normalize().z * timer;
            laserLight3[i].position.x -= dirMirror.normalize().x * timer;
            if (laserLight3[i].position.z < this.platePosition.z) {
                //laserLight3[i].position.x = this.mirrorPosition.x;
                //laserLight3[i].position.z = this.mirrorPosition.z;
                this.scene.remove(laserLight3[i]);
                this.removeFromLaserLight3(laserLight3[i]);
            }
        }

        //Here the wave start to rendered only at objectPosition + delta in order to avoid have wave objects inside the real object.
        var distance = this.objectPosition.distanceTo(this.platePosition);
        //var delta = distance/5;
        var initScale = 3.0;
        var deltaScale = 2;
        for(i = 0; i < objWaveLight.length; i++){
            var actualDistance = objWaveLight[i].position.distanceTo(this.platePosition);
            var ratio = actualDistance/distance;
            objWaveLight[i].position.z -= dirObject.normalize().z * timer;
            objWaveLight[i].position.x -= dirObject.normalize().x * timer;
            //The closer to the plate (minor distance) the lower is the ratio and bigger is objWaveLight
            objWaveLight[i].scale.set(initScale+deltaScale*(1-ratio),initScale+deltaScale*(1-ratio),initScale+deltaScale*(1-ratio));
            if (objWaveLight[i].position.z < this.platePosition.z) {
                //objWaveLight[i].position.x = this.objectPosition.x;
                //objWaveLight[i].position.z = this.objectPosition.z;
                //objWaveLight[i].scale.set(initScale,initScale,initScale);
                this.scene.remove(objWaveLight[i]);
                this.removeFromObjWaveLight(objWaveLight[i]);
            }
        }
    }
};