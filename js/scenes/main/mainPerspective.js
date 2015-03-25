/**
 * Created by TiagoLuís on 18/02/2015.
 */

CGHLab.MainPerspective = function( renderer, camera )
{
    this.scene = new THREE.Scene();
    this.objects = [];
    this.mirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color:0x889999 } );

    this.platePosition = new THREE.Vector3(0,80,0);
    this.plateRotation = 0;//-Math.PI/4;
    //var plateNormal = new THREE.Vector3(Math.sin(this.plateRotation), 0, Math.cos(this.plateRotation)).normalize();
    //The objective is to the normal of the plate make a 45º degree angle with the direction of the mirror and object

    //      Normal
    // M      /\     Obj
    //   .    |    .
    //     .45|45.
    //       .|.
    //==================
    //      PLATE

    //The angle that the reference wave makes with the plate
    this.referenceWaveAngle = Math.PI/4;

    //Direction of mirror in relation to plate
    var dirMirror = new THREE.Vector3(Math.sin(this.plateRotation+this.referenceWaveAngle), 0, Math.cos(this.plateRotation+this.referenceWaveAngle)).normalize();
    var unitsMirror = (1/Math.cos(Math.PI/4 - this.referenceWaveAngle)) * 250;
    this.mirrorPosition = new THREE.Vector3();
    this.mirrorPosition.addVectors(this.platePosition, dirMirror.multiplyScalar(unitsMirror));
    this.mirrorRotation = -Math.PI/2 + this.plateRotation - (Math.PI/4 - this.referenceWaveAngle);

    //Direction of object in relation to plate
    var dirObject = new THREE.Vector3(Math.sin(this.plateRotation-Math.PI/4), 0, Math.cos(this.plateRotation-Math.PI/4)).normalize();
    var unitsObject = 350;
    this.objectPosition = new THREE.Vector3();
    this.objectPosition.addVectors(this.platePosition, dirObject.multiplyScalar(unitsObject));
    this.objectRotation = this.plateRotation + Math.PI/4;
    this.object = new CGHLab.HoloObject(this.objectPosition, this.objectRotation);
    this.objectRotationScene = 0;

    //Direction of laser in relation to object
    //This direction is the same as the mirror direction but the position is calculated in relation to the object and not the plate
    var dirLaser = new THREE.Vector3(Math.sin(this.plateRotation+Math.PI/4), 0, Math.cos(this.plateRotation+Math.PI/4)).normalize();
    var unitsLaser = 400;
    this.laserPosition = new THREE.Vector3();
    this.laserPosition.addVectors(this.objectPosition, dirLaser.multiplyScalar(unitsLaser));
    this.laserRotation = this.plateRotation + Math.PI/4;

    //Direction of light amplifier in relation to object
    //This direction is the same as the mirror direction but the position is calculated in relation to the object and not the plate
    var dirAmplifier = new THREE.Vector3(Math.sin(this.plateRotation+Math.PI/4), 0, Math.cos(this.plateRotation+Math.PI/4)).normalize();
    var unitsAmplifier = 350;
    this.amplifierPosition = new THREE.Vector3();
    this.amplifierPosition.addVectors(this.objectPosition, dirAmplifier.multiplyScalar(unitsAmplifier));
    this.amplifierRotation = this.plateRotation + Math.PI/4;

    //Direction of beam splitter in relation to mirror
    //This direction is the same as the object direction but the position is calculated in relation to the mirror and not the plate
    var dirSplitter = new THREE.Vector3(Math.sin(this.plateRotation-Math.PI/4), 0, Math.cos(this.plateRotation-Math.PI/4)).normalize();
    var unitsSplitter = 350 - (250 * Math.tan(Math.PI/4 - this.referenceWaveAngle));
    this.beamSplitterPosition = new THREE.Vector3();
    this.beamSplitterPosition.addVectors(this.mirrorPosition, dirSplitter.multiplyScalar(unitsSplitter));
    this.beamSplitterRotation = this.plateRotation + Math.PI/4;

    //Discovers the center of the scene
    var center = new THREE.Vector3();
    center.addVectors(this.platePosition,this.laserPosition).divideScalar(2);

    //Reference wave initialization
    this.referenceWave = new CGHLab.Wave(0,1,1);

    this.interferencePatternShader = new THREE.Material;

    //Variables to store reference wave and object wave geometry
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

    this.setMirrorDirAndUnits = function(newDir, newUnits){
        dirMirror = newDir;
        unitsMirror = newUnits;
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

    this.getDirAmplifier = function(){
        return dirAmplifier;
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

    this.eraseLight3Array = function(){
        laserLight3 = [];
    };
};

CGHLab.MainPerspective.prototype = {

    constructor: CGHLab.MainPerspective,

    init: function()
    {
        //GEOMETRY
        //MIRROR
        var mirror = new THREE.Mesh(new THREE.PlaneGeometry( 100, 100 ), this.mirror.material );
        mirror.add(this.mirror);
        mirror.position.set(this.mirrorPosition.x, this.mirrorPosition.y, this.mirrorPosition.z);
        mirror.rotateY(this.mirrorRotation);
        mirror.name = 'mirror';
        var mirrorBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
        var mirrorBoxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var mirrorBox = new THREE.Mesh(mirrorBoxGeometry, mirrorBoxMaterial);
        mirrorBox.scale.set(0.1,100,100);
        mirrorBox.position.set(0,0,-2);
        mirrorBox.rotateY(-Math.PI / 2);
        /*var standGeometry = new THREE.CylinderGeometry( 1, 1, 15, 32);
        var standMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.scale.set(2,2,2);
        stand.position.set(0,-60, 0);*/


        //LASER
        var laserSourceGeometry = new THREE.CylinderGeometry( 10, 10, 30, 32);
        var laserSourceMaterial = new THREE.MeshPhongMaterial( {color: 0x00ffff, ambient: 0x00ffff} );
        var laserSource = new THREE.Mesh(laserSourceGeometry, laserSourceMaterial);
        laserSource.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
        laserSource.rotateY(this.laserRotation);
        laserSource.rotateX(Math.PI / 2);
        laserSource.name = 'laser';

        //AMPLIFIER
        var amplifierGeometry = new THREE.CircleGeometry(30, 32);
        var amplifierMaterial = new THREE.MeshPhongMaterial( {color: 0x00ffff, ambient: 0x00ffff, side: THREE.DoubleSide} );
        var amplifier = new THREE.Mesh(amplifierGeometry, amplifierMaterial);
        amplifier.position.set(this.amplifierPosition.x, this.amplifierPosition.y, this.amplifierPosition.z);
        amplifier.rotateY(this.amplifierRotation);
        amplifier.name = 'amplifier';

        //BEAM SPLITTER
        var beamSplitterGeometry = new THREE.BoxGeometry(1, 1, 1);
        var beamSplitterMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var beamSplitter = new THREE.Mesh(beamSplitterGeometry, beamSplitterMaterial);
        beamSplitter.scale.set(60,60,60);
        beamSplitter.position.set(this.beamSplitterPosition.x,this.beamSplitterPosition.y, this.beamSplitterPosition.z);
        beamSplitter.rotateY(this.beamSplitterRotation);

        //OBJECT
        this.object.setObject('cube'); //OPTIONS: cube, sphere, octahedron, tetrahedron
        this.object.convertToLightPoints();

        //HOLOGRAPHIC PLATE
        var holographicPlateGeometry = new THREE.PlaneGeometry( 160, 160 );
        var holographicPlateMaterial = new THREE.MeshPhongMaterial({ color: 0x444444, ambient: 0x444444, side: THREE.DoubleSide });

        var holographicPlate = new THREE.Mesh(holographicPlateGeometry, holographicPlateMaterial);
        holographicPlate.position.set(this.platePosition.x, this.platePosition.y, this.platePosition.z);
        holographicPlate.rotateY(this.plateRotation);
        holographicPlate.name = 'plate';

        //FLOOR
        var floorGeometry = new THREE.PlaneGeometry( 1000, 1000);
        var floorMaterial = new THREE.MeshPhongMaterial( {color: 0x999999, ambient: 0x999999, side: THREE.DoubleSide} );
        var floor = new THREE.Mesh( floorGeometry, floorMaterial );
        floor.position.y = 0;
        floor.position.x = this.getCenter().x;
        floor.position.z = this.getCenter().z;
        floor.rotation.z = Math.PI / 4;
        floor.rotation.x = Math.PI / 2;

        //AXES HELPER
        var axes = new THREE.AxisHelper(100);
        this.scene.add( axes );

        //ADD STUFF TO SCENE
        this.scene.add(mirror);
        mirror.add(mirrorBox);
        //mirror.add(stand);
        this.scene.add(floor);
        this.scene.add(this.object.object);
        this.scene.add(holographicPlate);
        this.scene.add(laserSource);
        this.scene.add(beamSplitter);
        this.scene.add(amplifier);

        //ADD OBJECTS THAT YOU WHAT TO INTERACT INTO THE OBJECTS ARRAY
        this.objects.push(this.object.object);
        this.objects.push(holographicPlate);

        //LIGHT
        var ambLight = new THREE.AmbientLight( 0x505050 );
        //var light = new THREE.PointLight( 0xffffff, 1);
        var light = new THREE.PointLight(0xffffff, 1);
        var center = this.getCenter();
        light.position.set( center.x, 500, center.z);
        this.scene.add( ambLight );
        this.scene.add( light );

        this.setHologramShader();

    },

    rotateObject: function(value)
    {
        var rad = CGHLab.Helpers.deg2rad(value);
        var r = rad - this.objectRotationScene;
        this.objectRotationScene += r;
        if ((this.objectRotationScene) > 2*Math.PI) this.objectRotationScene = this.objectRotationScene - 2*Math.PI;
        this.object.object.rotateY(r);
        this.object.convertToLightPoints();
        this.updateShaderUniforms();
    },

    changeObject: function(value)
    {
        this.object.changeObject(value);
        this.updateShaderUniforms();
    },

    updateMirror: function(value)
    {
        var mirror = this.scene.getObjectByName('mirror');
        var d = this.getDirMirror().clone().normalize();
        //alert('x: '+ d.x + " y: "+ d.y + " z: "+ d.z);
        this.referenceWaveAngle = CGHLab.Helpers.deg2rad(value);
        var dirMirror = new THREE.Vector3(Math.sin(this.plateRotation+this.referenceWaveAngle), 0, Math.cos(this.plateRotation+this.referenceWaveAngle)).normalize();
        var unitsMirror = (1/Math.cos(Math.PI/4 - this.referenceWaveAngle)) * 250;
        this.setMirrorDirAndUnits(dirMirror, unitsMirror);
        var d2 = this.getDirMirror();
        //alert('x: '+ d2.x + " y: "+ d2.y + " z: "+ d2.z);
        this.mirrorPosition = new THREE.Vector3();
        this.mirrorPosition.addVectors(this.platePosition, this.getDirMirror().normalize().multiplyScalar(unitsMirror));
        mirror.rotateY(-this.mirrorRotation);
        //TO_DO: tentar perceber o porque disto... xD
        this.mirrorRotation = -Math.PI/2 + this.plateRotation - ((Math.PI/4 - this.referenceWaveAngle)/2);

        var db = this.getDirSplitter().clone().normalize();
        var dm = dirMirror.clone().normalize();
        var ndm = dm.clone().negate().normalize();
        //alert('x: '+ ndm.x + " y: "+ ndm.y + " z: "+ ndm.z);
        var mN = new THREE.Vector3(Math.sin(this.mirrorRotation), 0, Math.cos(this.mirrorRotation)).normalize();
        var pN = new THREE.Vector3(Math.sin(this.plateRotation), 0, Math.cos(this.plateRotation)).normalize();
        //alert('x: '+ mN.x + " y: "+ mN.y + " z: "+ mN.z);
        var dot1 = CGHLab.Helpers.rad2deg(Math.acos(mN.dot(db.normalize())));
        var dot2 = CGHLab.Helpers.rad2deg(Math.acos(mN.dot(ndm.normalize())));
        var dot3 = CGHLab.Helpers.rad2deg(Math.acos(db.dot(ndm.normalize())));
        var dot4 = CGHLab.Helpers.rad2deg(Math.acos(dm.dot(pN.normalize())));
        //alert('mN db: ' + dot1);
        //alert('mN ndm: ' +dot2);
        //alert('db ndm: ' + dot3);
        //alert('dm pN: ' + dot4);

        mirror.position.set(this.mirrorPosition.x, this.mirrorPosition.y, this.mirrorPosition.z);
        mirror.rotateY(this.mirrorRotation);
        this.updateShaderUniforms();

        var laserLight3 = this.getLaserLight3();
        var i;
        for(i = 0; i < laserLight3.length; i++){
            this.scene.remove(laserLight3[i]);
        }
        this.eraseLight3Array();
    },

    setHologramShader: function()
    {
        var shader = CGHLab.HologramShaderLib.bipolar;
        var holographicPlateMaterial = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.DoubleSide
        });

        //   |<-- horizCycleLength -->|
        // ============================= hologram
        //   `-. ) referenceWave     /   plane
        //      `-.     Angle       /
        //         `-.             /
        // wavefront  `-.         / waveLength
        // of reference  `-.     /
        //           wave   `-. /
        //                     `

        holographicPlateMaterial.uniforms.lightPoints.value = this.object.getLightPointsPositions();
        holographicPlateMaterial.uniforms.n_lightPoints.value = this.object.lightPoints.length;
        holographicPlateMaterial.uniforms.horizCycleLength.value = this.referenceWave.waveLength / Math.sin(this.referenceWaveAngle);
        holographicPlateMaterial.uniforms.waveLength.value = this.referenceWave.waveLength;

        this.interferencePatternShader = holographicPlateMaterial;
    },

    updateShaderUniforms: function()
    {
        this.interferencePatternShader.uniforms.lightPoints.value = this.object.getLightPointsPositions();
        this.interferencePatternShader.uniforms.n_lightPoints.value = this.object.lightPoints.length;
        this.interferencePatternShader.uniforms.horizCycleLength.value = this.referenceWave.waveLength / Math.sin(this.referenceWaveAngle);
        this.interferencePatternShader.uniforms.waveLength.value = this.referenceWave.waveLength;
    },

    seeInterferencePattern: function()
    {
        var plate = this.scene.getObjectByName('plate');
        plate.material = new THREE.MeshPhongMaterial({ color: 0x444444, ambient: 0x444444, side: THREE.DoubleSide });

        plate.material = this.interferencePatternShader;
    },

    laserOn: function()
    {
        var lightGeometry = new THREE.CircleGeometry(10,32);
        var lightMaterial = new THREE.MeshPhongMaterial( {color: 0x0000ff, ambient: 0x0000ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5} );
        var light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);

        var copy = light.clone();
        copy.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
        copy.rotateY(this.laserRotation);
        this.scene.add(copy);
        this.addToLaserLight1(copy);
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
        var timer = 1;
        var i;
        var laserLight1 = this.getLaserLight1();
        var laserLight2 = this.getLaserLight2();
        var laserLight3 = this.getLaserLight3();
        var objWaveLight = this.getObjWaveLight();
        var dirLaser = this.getDirLaser();
        var dirSplitter = this.getDirSplitter();
        var dirMirror = this.getDirMirror();
        var dirObject = this.getDirObject();

        var negDirMirror = dirMirror.clone().negate();

        //LASER
        for(i = 0; i < laserLight1.list.length; i++){
            laserLight1.list[i].position.z -= dirLaser.normalize().z * timer;
            laserLight1.list[i].position.x -= dirLaser.normalize().x * timer;
            //Create next wave starting on the laser
            if((laserLight1.list[i].position.distanceTo(this.laserPosition) > this.referenceWave.waveLength * 10) && !laserLight1.next[i]){
                var newWave = laserLight1.list[i].clone();
                newWave.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
                this.addToLaserLight1(newWave);
                this.scene.add(newWave);
                laserLight1.next[i] = true;
            }
            //Cross the amplifier
            if(laserLight1.list[i].position.z < this.amplifierPosition.z){
                laserLight1.list[i].scale.set(3,3,3);
            }
            //Every time a wavefront cross the beam splitter a new wave starting on the beam with the direction
            //of the mirror is created
            if((laserLight1.list[i].position.z < this.beamSplitterPosition.z) && !laserLight1.beam[i]){
                var newSplit = laserLight1.list[i].clone();
                newSplit.position.set(this.beamSplitterPosition.x, this.beamSplitterPosition.y, this.beamSplitterPosition.z);
                newSplit.rotateY(Math.PI/2);
                this.addToLaserLight2(newSplit);
                this.scene.add(newSplit);
                laserLight1.beam[i] = true;
            }
            //Every time a wavefront cross the object a new object wavefront is created
            //and the ref wave disappears
            if (laserLight1.list[i].position.z < this.objectPosition.z) {
                this.scene.remove(laserLight1.list[i]);
                this.removeFromLaserLight1(laserLight1.list[i]);

                if(!laserLight1.object[i]) {
                    //var newObjWave = objWave.clone();
                    var newObjWave = this.object.object.clone();
                    newObjWave.material = new THREE.MeshPhongMaterial({ color: 0x0000ff , ambient: 0x0000ff, transparent: true, opacity: 0.5});
                    newObjWave.position.set(this.objectPosition.x, this.objectPosition.y, this.objectPosition.z);
                    this.scene.add(newObjWave);
                    this.addToObjWaveLight(newObjWave);
                    laserLight1.object[i] = true;
                }
            }
        }

        //BEAM SPLITTER
        for(i = 0; i < laserLight2.list.length; i++){
            laserLight2.list[i].position.z -= dirSplitter.normalize().z * timer;
            laserLight2.list[i].position.x -= dirSplitter.normalize().x * timer;
            //Every time a wavefront cross the mirror a reflection is created
            if((laserLight2.list[i].position.z < this.mirrorPosition.z) && !laserLight2.mirror[i]){
                var newReflect = laserLight2.list[i].clone();
                newReflect.position.set(this.mirrorPosition.x, this.mirrorPosition.y, this.mirrorPosition.z);
                //The wave is perpendicular to the direction and the angle made by the 2 directions is arccos(dot(dirMirror, dirBeam))
                //So the angle os rotation is 360 - 90 - 90 - arccos(dot(dirMirror, dirBeam))
                var dot = dirSplitter.dot(negDirMirror);
                var rotationAngle = Math.PI - Math.acos(dot);
                newReflect.rotateY(rotationAngle);
                this.addToLaserLight3(newReflect);
                this.scene.add(newReflect);
                laserLight2.mirror[i] = true;
            }
            if (laserLight2.list[i].position.z < this.mirrorPosition.z) {
                this.scene.remove(laserLight2.list[i]);
                this.removeFromLaserLight2(laserLight2.list[i]);
            }
        }

        //MIRROR
        for(i = 0; i < laserLight3.length; i++){
            laserLight3[i].position.z -= dirMirror.normalize().z * timer;
            laserLight3[i].position.x -= dirMirror.normalize().x * timer;
            if (laserLight3[i].position.z < this.platePosition.z) {
                this.scene.remove(laserLight3[i]);
                this.removeFromLaserLight3(laserLight3[i]);
            }
        }

        var distance = this.objectPosition.distanceTo(this.platePosition);
        //var delta = distance/5;
        var initScale = 30.0;
        var deltaScale = 40;
        for(i = 0; i < objWaveLight.length; i++){
            var actualDistance = objWaveLight[i].position.distanceTo(this.platePosition);
            var ratio = actualDistance/distance;
            objWaveLight[i].position.z -= dirObject.normalize().z * timer;
            objWaveLight[i].position.x -= dirObject.normalize().x * timer;
            //The closer to the plate (minor distance) the lower is the ratio and bigger is objWaveLight
            objWaveLight[i].scale.set(initScale+deltaScale*(1-ratio),initScale+deltaScale*(1-ratio),initScale+deltaScale*(1-ratio));
            if (objWaveLight[i].position.z < this.platePosition.z) {
                this.scene.remove(objWaveLight[i]);
                this.removeFromObjWaveLight(objWaveLight[i]);
            }
        }
    }
};