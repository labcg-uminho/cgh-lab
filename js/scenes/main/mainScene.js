/**
 * Created by TiagoLuís on 18/02/2015.
 */

CGHLab.MainScene = function( renderer, camera, map, controls )
{
    this.controls = controls;
    this.camera = camera;

    this.scene0 = new THREE.Scene();
    this.scene = new THREE.Scene();
    this.scene2 = new THREE.Scene();
    this.mainPerspectiveChosen = true;
    this.objectPerspectiveChosen = false;
    this.platePerspectiveChosen = false;

    this.objectPerspective = new CGHLab.ObjectPerspective(this);
    this.mainPerspective = new CGHLab.MainPerspective(this);
    this.platePerspective = new CGHLab.PlatePerspective(this);

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
    var dirMirror = new THREE.Vector3(Math.sin(this.plateRotation + this.referenceWaveAngle), 0, Math.cos(this.plateRotation + this.referenceWaveAngle)).normalize();
    var unitsMirror = (1/Math.cos(Math.PI/4 - this.referenceWaveAngle)) * 250;
    this.mirrorPosition = new THREE.Vector3();
    this.mirrorPosition.addVectors(this.platePosition, dirMirror.multiplyScalar(unitsMirror));
    this.mirrorRotation = -Math.PI/2 + this.plateRotation - ((Math.PI/4 - this.referenceWaveAngle)/2);

    //Direction of object in relation to plate
    var dirObject = new THREE.Vector3(Math.sin(this.plateRotation - Math.PI/4), 0, Math.cos(this.plateRotation - Math.PI/4)).normalize();
    var unitsObject = 350;
    this.objectPosition = new THREE.Vector3();
    this.objectPosition.addVectors(this.platePosition, dirObject.multiplyScalar(unitsObject));
    this.objectRotation = this.plateRotation + Math.PI/4;
    this.object = new CGHLab.HoloObject(this.objectPosition, this.objectRotation);
    this.objectRotationScene = 0;

    //Direction of laser in relation to object
    //This direction is the same as the mirror direction but the position is calculated in relation to the object and not the plate
    var dirLaser = new THREE.Vector3(Math.sin(this.plateRotation + Math.PI/4), 0, Math.cos(this.plateRotation + Math.PI/4)).normalize();
    var unitsLaser = 350;
    this.laserPosition = new THREE.Vector3();
    this.laserPosition.addVectors(this.objectPosition, dirLaser.multiplyScalar(unitsLaser));
    this.laserRotation = this.plateRotation + Math.PI/4;

    //Direction of beam splitter in relation to mirror
    //This direction is the same as the object direction but the position is calculated in relation to the mirror and not the plate
    var dirSplitter = new THREE.Vector3(Math.sin(this.plateRotation - Math.PI/4), 0, Math.cos(this.plateRotation - Math.PI/4)).normalize();
    var unitsSplitter = 350 - (250 * Math.tan(Math.PI/4 - this.referenceWaveAngle));
    this.beamSplitterPosition = new THREE.Vector3();
    this.beamSplitterPosition.addVectors(this.mirrorPosition, dirSplitter.multiplyScalar(unitsSplitter));
    this.beamSplitterRotation = this.plateRotation + Math.PI/4;

    //Direction of light amplifiers in relation to object and plate
    //This direction is the same as the mirror direction but the position is calculated in relation to the object and not the plate
    var dirAmplifier = new THREE.Vector3(Math.sin(this.plateRotation + Math.PI/4), 0, Math.cos(this.plateRotation + Math.PI/4)).normalize();
    var unitsAmplifier = 200;
    this.amplifierPosition = new THREE.Vector3();
    this.amplifierPosition.addVectors(this.objectPosition, dirAmplifier.multiplyScalar(unitsAmplifier));
    this.amplifierRotation = this.plateRotation + Math.PI/4;

    //This direction is the same as the mirror direction
    var unitsAmplifier2 = 200;//(1/Math.cos(Math.PI/4 - this.referenceWaveAngle)) * 200;
    this.amplifierPosition2 = new THREE.Vector3();
    this.amplifierPosition2.addVectors(this.platePosition, dirMirror.normalize().multiplyScalar(unitsAmplifier2));
    var dot = dirSplitter.dot(dirMirror.clone().negate().normalize());
    this.amplifierRotation2 = Math.PI - Math.acos(dot) - Math.PI/4;

    //this.simpleLaserOn = false;
    this.laserOnFlag = false;
    this.laserOnStandBy = false;

    //Discovers the center of the scene
    var center = new THREE.Vector3();
    center.addVectors(this.platePosition,this.laserPosition).divideScalar(2);

    //Reference wave initialization
    this.referenceWave = new CGHLab.Wave(1,1);

    this.interferencePatternShader = new THREE.Material;
    this.interferencePatternShaderUnchanged = new THREE.Material;

    this.simpleWaveSending = true;
    this.objWaveSendingTypes = ["All Together", "Collision Detection"];
    this.objWaveSendingTypeChoosen = "All Together";

    this.laserDupliateShader = new THREE.Material;
    this.laserReflectionShader = new THREE.Material;
    this.laserObjectWaveShader = new THREE.Material;
    this.laserShader = new THREE.Material;

    this.simpleLaserDupliateShader = new THREE.Material;
    this.simpleLaserReflectionShader = new THREE.Material;
    this.simpleLaserObjectWaveShader = new THREE.Material;
    this.simpleLaserShader = new THREE.Material;

    this.laserTypes = ["Simple", "Animated"];
    this.laserTypeActive = "Simple";

    this.interferencePatternOn = false;
    //this.interferencePatternInstant = false;

    this.refWaveArrived = false;
    this.objWaveArrived = false;
    this.patternShown = false;

    this.platePoints = [];
    this.mirrorPoints = [];

    this.collidableList = [];

    this.labelsOn = true;
    this.labelsList = [];
    this.beamLabelsList = [];

    var simpleLaserList = [];

    //Variables to store reference wave and object wave geometry
    var laserLight1 = {
        list: [],
        next: [],
        beam: [],
        object: [],
        lightPoints: [],
        updated: []
    };
    var laserLight2 = {
        list: [],
        mirror: []
    };
    var laserLight3 = [];

    //List of object waves from main perspective
    var objWaveLight = [];

    //List of light point waves from object perspective
    var lightPointWaves = {
        list: [],
        scales: []
    };

    this.getCenter = function(){
        return center;
    };

    this.getDirMirror = function(){
        return dirMirror;
    };

    this.setMirrorDirAndUnits = function(newDir, newUnits, newAmplifierUnits){
        dirMirror = newDir;
        unitsMirror = newUnits;
        unitsAmplifier2 = newAmplifierUnits;
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

    this.getSimpleLaser = function(){
        return simpleLaserList;
    };

    this.addToSimpleLaser = function (obj){
        simpleLaserList.push(obj);
    };

    this.removeFromSimpleLaser = function(obj){
        var i = simpleLaserList.indexOf(obj);
        if(i > -1) {
            simpleLaserList.splice(i, 1);
        }
    };

    this.eraseSimpleLaserList = function(){
        simpleLaserList = [];
    };

    this.addToLaserLight1 = function( obj ){
        laserLight1.list.push(obj);
        laserLight1.next.push(false);
        laserLight1.beam.push(false);
        laserLight1.object.push(false);
        var l = {
            names: []
        };
        laserLight1.lightPoints.push(l);
        laserLight1.updated.push(false);
        //console.log('l: '+l.length);
        //console.log('lL1: '+laserLight1.list.length);
    };

    this.removeFromLaserLight1 = function( obj ){
        var i = laserLight1.list.indexOf(obj);
        if (i > -1) {
            laserLight1.list.splice(i, 1);
            laserLight1.next.splice(i, 1);
            laserLight1.beam.splice(i, 1);
            laserLight1.object.splice(i, 1);
            laserLight1.lightPoints.splice(i, 1);
            laserLight1.updated.splice(i,1);
        }
    };

    this.addToLaserLight2 = function( obj ){
        laserLight2.list.push(obj);
        laserLight2.mirror.push(false);
    };

    this.removeFromLaserLight2 = function( obj ){
        var i = laserLight2.list.indexOf(obj);
        if (i > -1) {
            laserLight2.list.splice(i, 1);
            laserLight2.mirror.splice(i, 1);
        }
    };

    this.addToLaserLight3 = function( obj ){
        laserLight3.push(obj);
    };

    this.removeFromLaserLight3 = function( obj ){
        var i = laserLight3.indexOf(obj);
        if(i > -1) {
            laserLight3.splice(i, 1);
        }
    };

    this.getObjWaveLight = function(){
        return objWaveLight;
    };

    this.addToObjWaveLight = function( obj ){
        objWaveLight.push(obj);
        //console.log(objWaveLight.length);
    };

    this.removeFromObjWaveLight = function(obj){
        var i = objWaveLight.indexOf(obj);
        if (i > -1) {
            objWaveLight.splice(i, 1);
        }
    };

    this.eraseWaveArrays = function(){
        laserLight1.list = [];
        laserLight1.next = [];
        laserLight1.beam = [];
        laserLight1.object = [];
        laserLight1.lightPoints = [];
        laserLight2.list = [];
        laserLight2.mirror = [];
        laserLight3 = [];
        objWaveLight = [];
        lightPointWaves.list = [];
        lightPointWaves.scales = [];
    };

    this.eraseLight3Array = function(){
        laserLight3 = [];
    };

    this.eraseObjLight = function(){
        objWaveLight = [];
    };

    //Object perspective stuff
    this.getLightPointWaves = function(){
        return lightPointWaves;
    };

    this.addToLightPointWaves = function(obj){
        lightPointWaves.list.push(obj);
        lightPointWaves.scales.push(1.0);
    };

    this.removeFromLightPointWaves = function(obj){
        var i = lightPointWaves.list.indexOf(obj);
        if (i > -1) {
            lightPointWaves.list.splice(i, 1);
            lightPointWaves.scales.splice(i, 1);
        }
    };

    this.eraseLightPointWaves = function(){
        lightPointWaves.list = [];
        lightPointWaves.scales = [];
    }
};

CGHLab.MainScene.prototype = {

    constructor: CGHLab.MainScene,

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
        var mirrorBoxMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, ambient: 0xffffff });
        var mirrorBox = new THREE.Mesh(mirrorBoxGeometry, mirrorBoxMaterial);
        mirrorBox.scale.set(0.1,100,100);
        mirrorBox.position.set(0,0,-2);
        mirrorBox.rotateY(-Math.PI / 2);

        //LASER
        var laserSourceGeometry = new THREE.CylinderGeometry( 11, 11, 30, 32);
        var laserSourceMaterial = new THREE.MeshPhongMaterial( {color: 0x222222, ambient: 0x222222} );
        var laserSource = new THREE.Mesh(laserSourceGeometry, laserSourceMaterial);
        laserSource.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
        laserSource.rotateY(this.laserRotation);
        laserSource.rotateX(Math.PI / 2);
        laserSource.name = 'laser';

        var laserSourceGeometry2 = new THREE.CylinderGeometry( 15, 15, 30, 32);
        //var laserSourceMaterial2 = new THREE.MeshLambertMaterial( {color: 0x444444, ambient: 0xffffff} );
        var laserSource2 = new THREE.Mesh(laserSourceGeometry2, laserSourceMaterial);
        laserSource2.position.set(0, 20, 0);
        //laserSource2.rotateY(this.laserRotation);
        //laserSource2.rotateX(Math.PI / 2);

        //AMPLIFIER
        //ThreeCSG stuff
        var cube_geometry = new THREE.CubeGeometry( 30, 30, 30 );
        var cube_mesh = new THREE.Mesh( cube_geometry );
        cube_mesh.position.z = 15;
        var cube_bsp = new ThreeBSP( cube_mesh );
        var sphere_geometry = new THREE.SphereGeometry( 1, 32, 32 );
        var sphere_mesh = new THREE.Mesh( sphere_geometry );
        var sphere_bsp = new ThreeBSP( sphere_mesh );
        var subtract_bsp = sphere_bsp.subtract( cube_bsp );

        var amplifierMaterial = new THREE.MeshPhongMaterial( {color: 0x222222, ambient: 0x222222} );

        var amplifier = subtract_bsp.toMesh(amplifierMaterial);
        amplifier.scale.set(10,10,5);
        amplifier.position.set(this.amplifierPosition.x, this.amplifierPosition.y, this.amplifierPosition.z);
        amplifier.rotateY(this.amplifierRotation);
        amplifier.name = 'amplifier1';

        var amplifier2 = subtract_bsp.toMesh(amplifierMaterial);
        amplifier2.position.set(this.amplifierPosition2.x, this.amplifierPosition2.y, this.amplifierPosition2.z);
        amplifier2.scale.set(10,10,5);
        amplifier2.rotateY(this.amplifierRotation2);
        amplifier2.name = 'amplifier2';

        //BEAM SPLITTER
        var beamSplitterGeometry = new THREE.BoxGeometry(1, 1, 1);
        var beamSplitterMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff, ambient: 0xffffff, transparent: true, opacity: 1 });
        var beamSplitter = new THREE.Mesh(beamSplitterGeometry, beamSplitterMaterial);
        beamSplitter.scale.set(40,40,40);
        beamSplitter.position.set(this.beamSplitterPosition.x,this.beamSplitterPosition.y, this.beamSplitterPosition.z);
        beamSplitter.rotateY(this.beamSplitterRotation);

        //OBJECT
        this.object.setObject('cube'); //OPTIONS: cube, sphere, octahedron, tetrahedron
        //this.object.convertToLightPoints();

        //HOLOGRAPHIC PLATE
        var holographicPlateGeometry = new THREE.PlaneGeometry( 160, 160 );
        var holographicPlateMaterial = new THREE.MeshLambertMaterial({ color: 0x444444, ambient: 0x444444, side: THREE.DoubleSide });

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
        laserSource.add(laserSource2);
        this.scene.add(beamSplitter);
        this.scene.add(amplifier);
        this.scene.add(amplifier2);

        //ADD OBJECTS THAT YOU WHAT TO INTERACT INTO THE OBJECTS ARRAY
        //this.objects.push(this.object.object);
        //this.objects.push(holographicPlate);

        //LIGHT
        var ambLight = new THREE.AmbientLight( 0x505050 );
        //var light = new THREE.PointLight( 0xffffff, 1);
        var light = new THREE.PointLight(0xffffff, 1);
        var center = this.getCenter();
        light.position.set( center.x, 500, center.z);
        this.scene.add( ambLight );
        this.scene.add( light );

        this.scene0.add(ambLight.clone());
        this.scene0.add(light.clone());

        //Initialize hologram shader (link)
        this.setHologramShader();

        //Initialize shader used on the object perspective to paint the light point waves
        this.objectPerspective.setLightPointWaveMaterial();
        this.getMirrorPoints();
        this.setLaserMaterial();
        this.setSimpleLaserMaterial();

        this.getPlatePoints();

        //LABELS
        if(this.labelsOn) this.setLabels();

    },

    setLabels: function(){
        var spritey = CGHLab.Helpers.makeTextSprite( " Laser ", {
            fontsize: 24,
            borderColor: {r:255, g:0, b:0, a:1.0},
            backgroundColor: {r:255, g:100, b:100, a:0.8}
        });
        spritey.position.set(this.laserPosition.x, this.laserPosition.y + 5 ,this.laserPosition.z);
        spritey.name = "laser_label";
        this.scene2.add( spritey );
        this.labelsList.push(spritey.name);

        var spritey2 = CGHLab.Helpers.makeTextSprite( " Beam Splitter ", {
            fontsize: 24,
            borderColor: {r:255, g:0, b:0, a:1.0},
            backgroundColor: {r:255, g:100, b:100, a:0.8}
        });
        spritey2.position.set(this.beamSplitterPosition.x, this.beamSplitterPosition.y + 15 ,this.beamSplitterPosition.z);
        spritey2.name = "splitter_label";
        this.scene2.add( spritey2 );
        this.labelsList.push(spritey2.name);

        var spritey3 = CGHLab.Helpers.makeTextSprite( " Amplifier ", {
            fontsize: 24,
            borderColor: {r:255, g:0, b:0, a:1.0},
            backgroundColor: {r:255, g:100, b:100, a:0.8}
        });
        spritey3.position.set(this.amplifierPosition.x, this.amplifierPosition.y ,this.amplifierPosition.z);
        spritey3.name = "amplifier1_label";
        this.scene2.add( spritey3 );
        this.labelsList.push(spritey3.name);

        var spritey4 = CGHLab.Helpers.makeTextSprite( " Amplifier ", {
            fontsize: 24,
            borderColor: {r:255, g:0, b:0, a:1.0},
            backgroundColor: {r:255, g:100, b:100, a:0.8}
        });
        spritey4.position.set(this.amplifierPosition2.x, this.amplifierPosition2.y ,this.amplifierPosition2.z);
        spritey4.name = "amplifier2_label";
        this.scene2.add( spritey4 );
        this.labelsList.push(spritey4.name);

        var spritey5 = CGHLab.Helpers.makeTextSprite( " Mirror ", {
            fontsize: 24,
            borderColor: {r:255, g:0, b:0, a:1.0},
            backgroundColor: {r:255, g:100, b:100, a:0.8}
        });
        spritey5.position.set(this.mirrorPosition.x, this.mirrorPosition.y + 45 ,this.mirrorPosition.z);
        spritey5.name = "mirror_label";
        this.scene2.add( spritey5 );
        this.labelsList.push(spritey5.name);

        var spritey6;

        if(this.mainPerspectiveChosen) {
            spritey6 = CGHLab.Helpers.makeTextSprite(" Object ", {
                fontsize: 24,
                borderColor: {r: 255, g: 0, b: 0, a: 1.0},
                backgroundColor: {r: 255, g: 100, b: 100, a: 0.8}
            });
            spritey6.position.set(this.objectPosition.x, this.objectPosition.y + 10, this.objectPosition.z);
            spritey6.name = "object_label";
            this.scene2.add(spritey6);
            this.labelsList.push(spritey6.name);
        }

        else if(this.objectPerspectiveChosen) {
            spritey6 = CGHLab.Helpers.makeTextSprite(" Object Light Points ", {
                fontsize: 24,
                borderColor: {r: 255, g: 0, b: 0, a: 1.0},
                backgroundColor: {r: 255, g: 100, b: 100, a: 0.8}
            });
            spritey6.position.set(this.objectPosition.x, this.objectPosition.y + 10, this.objectPosition.z);
            spritey6.name = "object_light_points_label";
            this.scene2.add(spritey6);
            this.labelsList.push(spritey6.name);
        }

        var spritey7 = CGHLab.Helpers.makeTextSprite( " Holographic Plate ", {
            fontsize: 24,
            borderColor: {r:255, g:0, b:0, a:1.0},
            backgroundColor: {r:255, g:100, b:100, a:0.8}
        });
        spritey7.position.set(this.platePosition.x, this.platePosition.y + 80 ,this.platePosition.z);
        spritey7.name = "plate_label";
        this.scene2.add( spritey7 );
        this.labelsList.push(spritey7.name);
    },

    setBeamLabels: function(){
        var spritey = CGHLab.Helpers.makeTextSprite( " Illumination Beam ", {
            fontsize: 24,
            borderColor: {r:0, g:0, b:255, a:1.0},
            backgroundColor: {r:100, g:100, b:255, a:0.8}
        });
        var laserDir = this.getDirLaser().clone().normalize();
        var spriteyPosition = new THREE.Vector3();
        spriteyPosition.addVectors(this.objectPosition, laserDir.multiplyScalar(100));
        spritey.position.set(spriteyPosition.x, spriteyPosition.y + 50 , spriteyPosition.z);
        spritey.name = "illumination_beam_label";
        this.scene2.add( spritey );
        this.beamLabelsList.push(spritey.name);

        var spritey2 = CGHLab.Helpers.makeTextSprite( " Object Beam ", {
            fontsize: 24,
            borderColor: {r:0, g:0, b:255, a:1.0},
            backgroundColor: {r:100, g:100, b:255, a:0.8}
        });
        var objDir = this.getDirObject().clone().normalize();
        var spritey2Position = new THREE.Vector3();
        spritey2Position.addVectors(this.platePosition, objDir.multiplyScalar(175));
        spritey2.position.set(spritey2Position.x, spritey2Position.y + 50 , spritey2Position.z);
        spritey2.name = "object_beam_label";
        this.scene2.add( spritey2 );
        this.beamLabelsList.push(spritey2.name);

        var spritey3 = CGHLab.Helpers.makeTextSprite( " Reference Beam ", {
            fontsize: 24,
            borderColor: {r:0, g:0, b:255, a:1.0},
            backgroundColor: {r:100, g:100, b:255, a:0.8}
        });
        var mirrorDir = this.getDirMirror().clone().normalize();
        var spritey3Position = new THREE.Vector3();
        spritey3Position.addVectors(this.platePosition, mirrorDir.multiplyScalar((1/Math.cos(Math.PI/4 - this.referenceWaveAngle)) * 125));
        spritey3.position.set(spritey3Position.x, spritey3Position.y + 50 , spritey3Position.z);
        spritey3.name = "reference_beam_label";
        this.scene2.add( spritey3 );
        this.beamLabelsList.push(spritey3.name);
    },

    deleteLabels: function(){
        var i;
        var label;
        for (i = 0; i < this.labelsList.length; i++){
            label = this.scene2.getObjectByName(this.labelsList[i]);
            this.scene2.remove(label);
        }
        this.labelsList = [];
    },

    deleteBeamLabels: function(){
        var i;
        var label;
        for (i = 0; i < this.beamLabelsList.length; i++){
            label = this.scene2.getObjectByName(this.beamLabelsList[i]);
            this.scene2.remove(label);
        }
        this.beamLabelsList = [];
    },

    deleteAllLabels: function(){
        this.deleteLabels();
        this.deleteBeamLabels();
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

        this.interferencePatternShaderUnchanged = holographicPlateMaterial.clone();
        this.interferencePatternShader = holographicPlateMaterial.clone();

        this.interferencePatternShader.uniforms.lightPoints.value = this.object.getLightPointsPositions();
        this.interferencePatternShader.uniforms.n_lightPoints.value = this.object.lightPoints.length;
        this.interferencePatternShader.uniforms.horizCycleLength.value = this.referenceWave.waveLength / Math.sin(this.referenceWaveAngle);
        this.interferencePatternShader.uniforms.waveLength.value = this.referenceWave.waveLength;
    },

    updateShaderUniforms: function()
    {
        this.interferencePatternShader = this.interferencePatternShaderUnchanged.clone();

        this.interferencePatternShader.uniforms.lightPoints.value = this.object.getLightPointsPositions();
        this.interferencePatternShader.uniforms.n_lightPoints.value = this.object.lightPoints.length;
        this.interferencePatternShader.uniforms.horizCycleLength.value = this.referenceWave.waveLength / Math.sin(this.referenceWaveAngle);
        this.interferencePatternShader.uniforms.waveLength.value = this.referenceWave.waveLength;

        if(this.interferencePatternOn) {
            var plate = this.scene.getObjectByName('plate');
            plate.material = this.interferencePatternShader;
        }
    },

    seeInterferencePattern: function()
    {
        var plate = this.scene.getObjectByName('plate');
        plate.material = new THREE.MeshLambertMaterial({ color: 0x444444, ambient: 0x444444, side: THREE.DoubleSide });

        plate.material = this.interferencePatternShader;

        this.interferencePatternOn = true;
        //this.interferencePatternInstant = true;
    },

    hideInterferencePattern: function()
    {
        var plate = this.scene.getObjectByName('plate');
        plate.material = new THREE.MeshLambertMaterial({ color: 0x444444, ambient: 0x444444, side: THREE.DoubleSide });

        this.interferencePatternOn = false;
    },

    setLaserMaterial: function () {
        var shader = CGHLab.GeometryShaderLib.myLambertLaser;
        var lightMaterial = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            lights:true,
            fog: true,
            side: THREE.DoubleSide,
            transparent: true

        });
        lightMaterial.uniforms.ambient.value = new THREE.Color(0x0000ff);
        lightMaterial.uniforms.opacity.value = 0.5;
        lightMaterial.uniforms.mirror.value = this.mirrorPoints;
        lightMaterial.uniforms.referenceWaveAngle.value = this.referenceWaveAngle;

        var laserReflectionShader = lightMaterial.clone();
        laserReflectionShader.uniforms.limit.value = 2;
        this.laserReflectionShader = laserReflectionShader;

        var laserDuplicateShader = lightMaterial.clone();
        laserDuplicateShader.uniforms.limit.value = 1;
        this.laserDupliateShader = laserDuplicateShader;

        var laserObjectWaveShader = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            lights:true,
            fog: true,
            transparent: true
        });
        laserObjectWaveShader.uniforms.limit.value = 3;
        this.laserObjectWaveShader = laserObjectWaveShader;

        var laserShader = lightMaterial.clone();
        laserShader.uniforms.limit.value = 0;
        this.laserShader = laserShader;
    },

    setSimpleLaserMaterial: function () {
        var shader = CGHLab.GeometryShaderLib.myLambertLaser;
        var lightMaterial = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            lights:true,
            fog: true,
            transparent: true

        });
        lightMaterial.uniforms.ambient.value = new THREE.Color(0x0000ff);
        lightMaterial.uniforms.opacity.value = 0.5;
        lightMaterial.uniforms.mirror.value = this.mirrorPoints;
        lightMaterial.uniforms.referenceWaveAngle.value = this.referenceWaveAngle;

        var laserReflectionShader = lightMaterial.clone();
        laserReflectionShader.uniforms.limit.value = 2;
        this.simpleLaserReflectionShader = laserReflectionShader;

        var laserDuplicateShader = lightMaterial.clone();
        laserDuplicateShader.uniforms.limit.value = 1;
        this.simpleLaserDupliateShader = laserDuplicateShader;

        var laserObjectWaveShader = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            lights:true,
            fog: true,
            transparent: true
        });
        laserObjectWaveShader.uniforms.limit.value = 3;
        this.simpleLaserObjectWaveShader = laserObjectWaveShader;

        var laserShader = lightMaterial.clone();
        laserShader.uniforms.limit.value = 0;
        this.simpleLaserShader = laserShader;
    },

    simpleLaser: function()
    {
        var middleL_AP1 = new THREE.Vector3();
        middleL_AP1.subVectors(this.amplifierPosition, this.laserPosition).divideScalar(2);
        var unitsL_AP1 = this.laserPosition.distanceTo(this.amplifierPosition);
        var laserGeometryL_AP1 = new THREE.CylinderGeometry(10,10,unitsL_AP1,32, 1, true);
        var laserL_AP1 = new THREE.Mesh(laserGeometryL_AP1, this.simpleLaserShader);
        laserL_AP1.position.set(this.amplifierPosition.x - middleL_AP1.x, this.amplifierPosition.y - middleL_AP1.y, this.amplifierPosition.z - middleL_AP1.z);
        laserL_AP1.rotateY(this.laserRotation);
        laserL_AP1.rotateX(-Math.PI / 2);
        this.scene.add(laserL_AP1);
        this.addToSimpleLaser(laserL_AP1);

        var dirAmplifier = this.getDirAmplifier();
        var negDirAmplifier = dirAmplifier.clone().normalize().negate();
        //extend the maximum path from 'laser to object' to 'laser to object + 50 units' on the object perspective, so the wavefronts
        //can pass through all the light points of an object
        var newLaser1Finish = new THREE.Vector3();
        newLaser1Finish.addVectors(this.objectPosition, negDirAmplifier.multiplyScalar(50));
        var unitsAP1_O = newLaser1Finish.distanceTo(this.amplifierPosition);
        var laserGeometryAP1_O = new THREE.CylinderGeometry(110,10,unitsAP1_O,32);
        var laserAP1_O = new THREE.Mesh(laserGeometryAP1_O, this.simpleLaserShader);
        var middleAP1_O = new THREE.Vector3();
        middleAP1_O.subVectors(newLaser1Finish, this.amplifierPosition).divideScalar(2);
        laserAP1_O.position.set(newLaser1Finish.x - middleAP1_O.x, newLaser1Finish.y - middleAP1_O.y, newLaser1Finish.z - middleAP1_O.z);
        laserAP1_O.rotateY(this.laserRotation);
        laserAP1_O.rotateX(-Math.PI / 2);
        this.scene.add(laserAP1_O);
        this.addToSimpleLaser(laserAP1_O);

        var middleB_M = new THREE.Vector3();
        middleB_M.subVectors(this.mirrorPosition, this.beamSplitterPosition).divideScalar(2);
        var unitsB_M = this.mirrorPosition.distanceTo(this.beamSplitterPosition);
        var laserGeometryB_M = new THREE.CylinderGeometry(10,10,unitsB_M,32, 1, true);
        var laserB_M = new THREE.Mesh(laserGeometryB_M, this.simpleLaserDupliateShader);
        laserB_M.position.set(this.mirrorPosition.x - middleB_M.x, this.mirrorPosition.y - middleB_M.y, this.mirrorPosition.z - middleB_M.z);
        laserB_M.rotateY(this.laserRotation + Math.PI/2);
        laserB_M.rotateX(-Math.PI / 2);
        laserB_M.name = 'simpleLaserBeam';
        this.scene.add(laserB_M);
        this.addToSimpleLaser(laserB_M);

        var dirSplitter = this.getDirSplitter().clone().normalize();
        var dirMirror = this.getDirMirror();
        var negDirMirror = dirMirror.clone().normalize().negate();
        var middleM_AP2 = new THREE.Vector3();
        middleM_AP2.subVectors(this.amplifierPosition2, this.mirrorPosition).divideScalar(2);
        var unitsM_AP2 = this.mirrorPosition.distanceTo(this.amplifierPosition2);
        var laserGeometryM_AP2 = new THREE.CylinderGeometry(10,10,unitsM_AP2,32, 1, true);
        var laserM_AP2 = new THREE.Mesh(laserGeometryM_AP2, this.simpleLaserReflectionShader);
        laserM_AP2.position.set(this.amplifierPosition2.x - middleM_AP2.x, this.amplifierPosition2.y - middleM_AP2.y, this.amplifierPosition2.z - middleM_AP2.z);
        var dot = dirSplitter.dot(negDirMirror);
        var rotationAngle = Math.PI - Math.acos(dot) - Math.PI/4;
        laserM_AP2.rotateY(rotationAngle);
        laserM_AP2.rotateX(-Math.PI / 2);
        laserM_AP2.name = 'simpleMirrorAP2';
        this.scene.add(laserM_AP2);
        this.addToSimpleLaser(laserM_AP2);

        var newLaser3Finish = new THREE.Vector3();
        newLaser3Finish.addVectors(this.mirrorPosition, negDirMirror.clone().normalize().multiplyScalar((1/Math.cos(Math.PI/4 - this.referenceWaveAngle)) * 350));
        var unitsAP2_P = newLaser3Finish.distanceTo(this.amplifierPosition2);
        var laserGeometryAP2_P = new THREE.CylinderGeometry(110,10,unitsAP2_P,32);
        var laserAP2_P = new THREE.Mesh(laserGeometryAP2_P, this.simpleLaserReflectionShader);
        var middleAP2_P = new THREE.Vector3();
        middleAP2_P.subVectors(newLaser3Finish, this.amplifierPosition2).divideScalar(2);
        laserAP2_P.position.set(newLaser3Finish.x - middleAP2_P.x, newLaser3Finish.y - middleAP2_P.y, newLaser3Finish.z - middleAP2_P.z);
        laserAP2_P.rotateY(rotationAngle);
        laserAP2_P.rotateX(-Math.PI / 2);
        laserAP2_P.name = 'simpleAP2Plate';
        this.scene.add(laserAP2_P);
        this.addToSimpleLaser(laserAP2_P);


        var clone = this.object.object.clone();
        var figure = this.object.figure;

        switch (figure){
            case 'cube':
                clone.geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
                break;
            case 'sphere':
                clone.geometry = new THREE.IcosahedronGeometry(0.5, 2);
                break;
            case 'cylinder':
                clone.geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1, true);
        }


        var geometry = clone.geometry.clone();
        var vertices = geometry.vertices;

        var points = [];
        clone.updateMatrixWorld();
        for(var i = 1; i < vertices.length; i++){
            vertices[i].applyMatrix4(clone.matrixWorld);
            if(vertices[i].z > (vertices[i].x - this.objectPosition.x) * ((this.laserPosition.z - this.objectPosition.z)/(this.laserPosition.x - this.objectPosition.x)) + this.objectPosition.z){
                points.push(vertices[i]);
            }
            //points.push(vertices[i]);
        }

        if (this.objectPerspectiveChosen || this.mainPerspectiveChosen) {
            for (i = 0; i < this.platePoints.length; i++) {
                points.push(this.platePoints[i]);
            }
        }
        /*else if (this.mainPerspectiveChosen) {
            var clone2 = this.object.object.clone();
            clone2.scale.set(70, 70, 70);
            clone2.position.set(this.platePosition.x, this.platePosition.y, this.platePosition.z);
            var geometry2 = clone2.geometry.clone();
            var vertices2 = geometry2.vertices;
            clone2.updateMatrixWorld();
            for (i = 0; i < vertices2.length; i++) {
                vertices2[i].applyMatrix4(clone2.matrixWorld);
                if (vertices2[i].z < (vertices2[i].x - this.platePosition.x) * ((this.mirrorPosition.z - this.platePosition.z) / (this.mirrorPosition.x - this.platePosition.x)) + this.platePosition.z) {
                    points.push(vertices2[i]);
                }
                //points.push(vertices2[i]);
            }
        }*/

        var laserO_P = new THREE.Mesh(new THREE.ConvexGeometry(points), this.simpleLaserObjectWaveShader);
        var middleO_P = new THREE.Vector3();
        laserO_P.position.set(middleO_P.x,middleO_P.y,middleO_P.z);
        laserO_P.name = 'simpleLaserObj';
        this.scene.add(laserO_P);
        this.addToSimpleLaser(laserO_P);

        this.simpleLaserOn = true;
    },

    updateSimpleLaser: function(){
        var old = this.scene.getObjectByName('simpleLaserObj');
        this.scene.remove(old);
        this.removeFromSimpleLaser(old);

        var clone = this.object.object.clone();
        var figure = this.object.figure;

        switch (figure){
            case 'cube':
                clone.geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
                break;
            case 'sphere':
                clone.geometry = new THREE.IcosahedronGeometry(0.5, 2);
                break;
            case 'cylinder':
                clone.geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1, true);
        }


        var geometry = clone.geometry.clone();
        var vertices = geometry.vertices;

        var points = [];
        clone.updateMatrixWorld();
        for(var i = 1; i < vertices.length; i++){
            vertices[i].applyMatrix4(clone.matrixWorld);
            if(vertices[i].z > (vertices[i].x - this.objectPosition.x) * ((this.laserPosition.z - this.objectPosition.z)/(this.laserPosition.x - this.objectPosition.x)) + this.objectPosition.z){
                points.push(vertices[i]);
            }
            //points.push(vertices[i]);
        }

        if (this.objectPerspectiveChosen || this.mainPerspectiveChosen) {
            for (i = 0; i < this.platePoints.length; i++) {
                points.push(this.platePoints[i]);
            }
        }
        /*else if (this.mainPerspectiveChosen) {
            var clone2 = this.object.object.clone();
            clone2.scale.set(70, 70, 70);
            clone2.position.set(this.platePosition.x, this.platePosition.y, this.platePosition.z);
            var geometry2 = clone2.geometry.clone();
            var vertices2 = geometry2.vertices;
            clone2.updateMatrixWorld();
            for (i = 0; i < vertices2.length; i++) {
                vertices2[i].applyMatrix4(clone2.matrixWorld);
                if (vertices2[i].z < (vertices2[i].x - this.platePosition.x) * ((this.mirrorPosition.z - this.platePosition.z) / (this.mirrorPosition.x - this.platePosition.x)) + this.platePosition.z) {
                    points.push(vertices2[i]);
                }
                //points.push(vertices2[i]);
            }
        }*/

        var laserO_P = new THREE.Mesh(new THREE.ConvexGeometry(points), this.simpleLaserObjectWaveShader);
        var middleO_P = new THREE.Vector3();
        laserO_P.position.set(middleO_P.x,middleO_P.y,middleO_P.z);
        laserO_P.name = 'simpleLaserObj';
        this.scene.add(laserO_P);
        this.addToSimpleLaser(laserO_P);
    },

    laserOn: function()
    {
        if(this.laserTypeActive == "Animated") {
            var lightGeometry = new THREE.CircleGeometry(10, 32);
            var lightMaterial = this.laserShader;
            var light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);

            var copy = light.clone();
            copy.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
            copy.rotateY(this.laserRotation);
            this.scene.add(copy);
            this.addToLaserLight1(copy);
        }
        else if (this.laserTypeActive == "Simple"){
            this.simpleLaser();
            this.seeInterferencePattern();
            this.refWaveArrived = true;
            this.objWaveArrived = true;
        }

        if (this.labelsOn) this.setBeamLabels();
        this.laserOnFlag = true;
    },

    laserOff: function(){
        var i;
        if(this.laserTypeActive == "Animated") {
            var laserLight1 = this.getLaserLight1();
            var laserLight2 = this.getLaserLight2();
            var laserLight3 = this.getLaserLight3();
            var objWaveLight = this.getObjWaveLight();
            var lightPointWaves = this.getLightPointWaves();
            for (i = 0; i < laserLight1.list.length; i++) {
                this.scene.remove(laserLight1.list[i]);
            }
            for (i = 0; i < laserLight2.list.length; i++) {
                this.scene.remove(laserLight2.list[i]);
            }
            for (i = 0; i < laserLight3.length; i++) {
                this.scene.remove(laserLight3[i]);
            }
            for (i = 0; i < objWaveLight.length; i++) {
                this.scene.remove(objWaveLight[i]);
            }
            for (i = 0; i < lightPointWaves.list.length; i++) {
                this.scene.remove(lightPointWaves.list[i]);
            }
            this.eraseWaveArrays();
        }

        else if (this.laserTypeActive == "Simple"){
            var simpleLaserList = this.getSimpleLaser();
            for (i = 0; i < simpleLaserList.length; i++) {
                this.scene.remove(simpleLaserList[i]);
            }
            this.eraseSimpleLaserList();
            this.simpleLaserOn = false;
        }
        this.refWaveArrived = false;
        this.objWaveArrived = false;
        this.patternShown = false;

        if(this.labelsOn) this.deleteBeamLabels();

        this.laserOnFlag = false;
    },

    updateLaser: function(){
        var timer = 1;
        var i;
        var laserLight1 = this.getLaserLight1();
        var laserLight2 = this.getLaserLight2();
        var laserLight3 = this.getLaserLight3();
        var objWaveLight = this.getObjWaveLight();
        var lightPointsWaves = this.getLightPointWaves();
        var dirLaser = this.getDirLaser();
        var dirSplitter = this.getDirSplitter();
        var dirMirror = this.getDirMirror();
        var dirObject = this.getDirObject();
        var dirAmplifier = this.getDirAmplifier();

        var negDirMirror = dirMirror.clone().negate();

        var negDirAmplifier = dirAmplifier.clone().normalize().negate();

        //extend the maximum path from 'laser to object' to 'laser to object + 50 units' on the object perspective, so the wavefronts
        //can pass through all the light points of an object
        var newLaser1Finish = new THREE.Vector3();
        newLaser1Finish.addVectors(this.objectPosition, negDirAmplifier.multiplyScalar(50));
        var newLaser3Finish = new THREE.Vector3();
        newLaser3Finish.addVectors(this.mirrorPosition, negDirMirror.clone().normalize().multiplyScalar((1/Math.cos(Math.PI/4 - this.referenceWaveAngle)) * 350));

        //LASER
        for(i = 0; i < laserLight1.list.length; i++){
            laserLight1.list[i].position.z -= dirLaser.normalize().z * timer;
            laserLight1.list[i].position.x -= dirLaser.normalize().x * timer;
            //Create next wave starting on the laser
            if((laserLight1.list[i].position.distanceTo(this.laserPosition) > this.referenceWave.waveLength * 100) && !laserLight1.next[i]){
                var newWave = laserLight1.list[i].clone();
                newWave.scale.set(1,1,1);
                newWave.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
                this.addToLaserLight1(newWave);
                this.scene.add(newWave);
                laserLight1.next[i] = true;
            }
            //Every time a wavefront cross the beam splitter a new wave starting on the beam with the direction
            //of the mirror is created
            if((laserLight1.list[i].position.z < this.beamSplitterPosition.z) && !laserLight1.beam[i]){
                var newSplit = laserLight1.list[i].clone();
                newSplit.material = this.laserDupliateShader;
                newSplit.position.set(this.beamSplitterPosition.x, this.beamSplitterPosition.y, this.beamSplitterPosition.z);
                newSplit.rotateY(Math.PI/2);
                this.addToLaserLight2(newSplit);
                this.scene.add(newSplit);
                laserLight1.beam[i] = true;
            }
            //Every time a wavefront cross the object a new object wavefront is created
            //and the ref wave disappears
            if(this.mainPerspectiveChosen) {
                if (laserLight1.list[i].position.z < this.objectPosition.z) {
                    if (!laserLight1.object[i]) {
                        var newObjWave = this.object.object.clone();
                        newObjWave.material = this.laserObjectWaveShader;
                        newObjWave.position.set(this.objectPosition.x, this.objectPosition.y, this.objectPosition.z);
                        this.scene.add(newObjWave);
                        this.addToObjWaveLight(newObjWave);
                        laserLight1.object[i] = true;
                    }
                }
                if (laserLight1.list[i].position.z < newLaser1Finish.z) {
                    this.scene.remove(laserLight1.list[i]);
                    this.removeFromLaserLight1(laserLight1.list[i]);
                }
            }
            else if(this.objectPerspectiveChosen){
                if(!this.simpleWaveSending) {
                    //When the wavefronts get close to the object light points more detail is given to the wavefronts geometry.
                    //This way the collision detector will have more precision
                    if (laserLight1.list[i].position.z < this.objectPosition.z + 50 && !laserLight1.updated[i]){
                        laserLight1.list[i].geometry = new THREE.CircleGeometry(10,512);
                        laserLight1.updated[i] = true;
                    }

                    var originPoint = laserLight1.list[i].position.clone();
                    for (var vertexIndex = 0; vertexIndex < laserLight1.list[i].geometry.vertices.length; vertexIndex++) {
                        var localVertex = laserLight1.list[i].geometry.vertices[vertexIndex].clone();
                        var globalVertex = localVertex.applyMatrix4(laserLight1.list[i].matrix);
                        var directionVector = globalVertex.sub(laserLight1.list[i].position);

                        var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
                        var collisionResults = ray.intersectObjects(this.collidableList);
                        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                            for (var j = 0; j < collisionResults.length; j++) {
                                if (laserLight1.lightPoints[i].names.indexOf(collisionResults[j].object.name) == -1) {
                                    this.objectPerspective.sendLightPointWaveComplete(collisionResults[j].object);
                                    laserLight1.lightPoints[i].names.push(collisionResults[j].object.name);
                                }
                            }
                        }
                    }

                    //if (laserLight1.list[i].position.z < this.objectPosition.z) {
                    if (laserLight1.list[i].position.z < newLaser1Finish.z) {
                        this.scene.remove(laserLight1.list[i]);
                        this.removeFromLaserLight1(laserLight1.list[i]);
                    }
                }
                else {
                    if (laserLight1.list[i].position.z < this.objectPosition.z) {
                        this.scene.remove(laserLight1.list[i]);
                        this.removeFromLaserLight1(laserLight1.list[i]);

                        if (!laserLight1.object[i]) {
                            this.objectPerspective.sendLightPointWaveSimple(this.object.lightPoints);
                         laserLight1.object[i] = true;
                         }
                    }
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
                newReflect.material = this.laserReflectionShader;
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

        //AMPLIFIER1
        var distance_AO = this.amplifierPosition.distanceTo(newLaser1Finish);
        var initScale_A1 = 1;
        var deltaScale_A1 = 10;
        for(i = 0; i < laserLight1.list.length; i++){
            //Cross the amplifier
            if(laserLight1.list[i].position.z < this.amplifierPosition.z){
                var actualDistance_A1 = laserLight1.list[i].position.distanceTo(newLaser1Finish);
                var ratio_A1 = actualDistance_A1/distance_AO;
                //if(i == 0) console.log(ratio_A1);
                laserLight1.list[i].scale.set(initScale_A1+deltaScale_A1*(1-ratio_A1),initScale_A1+deltaScale_A1*(1-ratio_A1),initScale_A1+deltaScale_A1*(1-ratio_A1));
            }
        }

        //MIRROR
        for(i = 0; i < laserLight3.length; i++){
            laserLight3[i].position.z -= dirMirror.normalize().z * timer;
            laserLight3[i].position.x -= dirMirror.normalize().x * timer;
            if (laserLight3[i].position.z <  newLaser3Finish.z) {
                if(!this.refWaveArrived) this.refWaveArrived = true;
                this.scene.remove(laserLight3[i]);
                this.removeFromLaserLight3(laserLight3[i]);
            }
        }

        //AMPLIFIER2
        var distance_AP = this.amplifierPosition2.distanceTo(newLaser3Finish);
        var initScale_A2 = 1;
        var deltaScale_A2 = 10;
        for(i = 0; i < laserLight3.length; i++){
            //Cross the amplifier
            if(laserLight3[i].position.z < this.amplifierPosition2.z){
                var actualDistance_A2 = laserLight3[i].position.distanceTo(newLaser3Finish);
                var ratio_A2 = actualDistance_A2/distance_AP;
                laserLight3[i].scale.set(initScale_A2+deltaScale_A2*(1-ratio_A2),initScale_A2+deltaScale_A2*(1-ratio_A2),initScale_A2+deltaScale_A2*(1-ratio_A2));
            }
        }

        //OBJECT
        if(this.mainPerspectiveChosen) {
            var distance = this.objectPosition.distanceTo(this.platePosition);
            var initScale = 30.0;
            var deltaScale = 120;
            for (i = 0; i < objWaveLight.length; i++) {
                var actualDistance = objWaveLight[i].position.distanceTo(this.platePosition);
                var ratio = actualDistance / distance;
                objWaveLight[i].position.z -= dirObject.normalize().z * timer;
                objWaveLight[i].position.x -= dirObject.normalize().x * timer;
                //The closer to the plate (minor distance) the lower is the ratio and bigger is objWaveLight
                objWaveLight[i].scale.set(initScale + deltaScale * (1 - ratio), initScale + deltaScale * (1 - ratio), initScale + deltaScale * (1 - ratio));
                if (objWaveLight[i].position.z < this.platePosition.z) {
                    if(!this.objWaveArrived) this.objWaveArrived = true;
                    this.scene.remove(objWaveLight[i]);
                    this.removeFromObjWaveLight(objWaveLight[i]);
                }
            }
        }
        else if(this.objectPerspectiveChosen){
            for (i = 0; i < lightPointsWaves.list.length; i++) {
                lightPointsWaves.list[i].scale.set(lightPointsWaves.scales[i], lightPointsWaves.scales[i], lightPointsWaves.scales[i]);
                lightPointsWaves.scales[i] += 3.0;

                if (lightPointsWaves.scales[i] > 800) {
                    if(!this.objWaveArrived) this.objWaveArrived = true;
                    this.scene.remove(lightPointsWaves.list[i]);
                    this.removeFromLightPointWaves(lightPointsWaves.list[i]);
                }
            }
        }

        if(!this.patternShown && this.refWaveArrived && this.objWaveArrived) this.seeInterferencePattern();
        else this.hideInterferencePattern();
    },

    changeToObjectPerspective: function()
    {
        var object = this.scene.getObjectByName('object');
        this.scene.remove(object);

        this.objectPerspective.setLightPoints(this.object.lightPoints, this.collidableList);

        var objWaveLight = this.getObjWaveLight();
        var i;
        for(i = 0; i < objWaveLight.length; i++){
            this.scene.remove(objWaveLight[i]);
        }
        this.eraseObjLight();

        this.controls.enabled = true;
        var target = {x: this.objectPerspective.lastCameraPosition.x, y: this.objectPerspective.lastCameraPosition.y, z: this.objectPerspective.lastCameraPosition.z};
        this.smoothCameraTransition(target, mainScene.objectPosition);

        //Change object label
        if(this.labelsOn){
            this.deleteAllLabels();
            this.setLabels();
            if(this.laserOnFlag) this.setBeamLabels();
        }

        //Change the objcet wave if simple laser is on
        if(this.laserOnFlag && this.laserTypeActive == "Simple"){
            this.updateSimpleLaser();
        }

        if(this.laserOnStandBy){
            this.laserOn();
            this.laserOnStandBy = false;
        }

        CGHLab.Helpers.eraseInfo();
        CGHLab.Helpers.addObjectPerspectiveInfo();
    },

    changeToMainPerspective: function()
    {
        var i;
        for (i = 0; i < this.object.lightPoints.length; i++){
            var object = this.scene.getObjectByName('lightPoint'+i);
            this.scene.remove(object);
        }

        var lightPointsWave = this.getLightPointWaves();
        for(i = 0; i < lightPointsWave.list.length; i++){
            this.scene.remove(lightPointsWave.list[i]);
        }
        this.eraseLightPointWaves();
        this.scene.add(this.object.object);
        this.collidableList = [];

        this.controls.enabled = true;
        var target = {x: this.mainPerspective.lastCameraPosition.x, y: this.mainPerspective.lastCameraPosition.y, z: this.mainPerspective.lastCameraPosition.z};
        this.smoothCameraTransition(target, mainScene.getCenter());

        //Change object label
        if(this.labelsOn){
            this.deleteAllLabels();
            this.setLabels();
            if(this.laserOnFlag) this.setBeamLabels();
        }

        //Change the objcet wave if simple laser is on
        if(this.laserOnFlag && this.laserTypeActive == "Simple"){
            this.updateSimpleLaser();
        }

        if(this.laserOnStandBy){
            this.laserOn();
            this.laserOnStandBy = false;
        }

        CGHLab.Helpers.eraseInfo();
        CGHLab.Helpers.addMainPerspectiveInfo();
    },

    changeToPlatePerspective: function()
    {
        var i;
        for (i = 0; i < this.object.lightPoints.length; i++){
            var object = this.scene.getObjectByName('lightPoint'+i);
            this.scene.remove(object);
        }

        var lightPointsWave = this.getLightPointWaves();
        for(i = 0; i < lightPointsWave.list.length; i++){
            this.scene.remove(lightPointsWave.list[i]);
        }
        this.eraseLightPointWaves();
        this.scene.add(this.object.object);
        this.collidableList = [];

        if(this.laserOnFlag) {
            this.laserOff();
            this.laserOnStandBy = true;
        }

        //this.camera.position.set(0,0,250);
        var target = {x: 0, y: 80, z: 250};
        this.smoothCameraTransition(target, mainScene.platePosition);
        this.controls.enabled = false;

        if(this.labelsOn){
            this.deleteAllLabels();
            //this.labelsOn = false;
        }

        CGHLab.Helpers.eraseInfo();
        CGHLab.Helpers.addPlatePerspectiveInfo();
    },

    getPlatePoints: function()
    {
        var clone = this.scene.getObjectByName('plate').clone();
        var geometry = clone.geometry.clone();
        var vertices = geometry.vertices;
        var points = [];
        clone.updateMatrixWorld();
        for(var i = 0; i < vertices.length; i++){
            vertices[i].applyMatrix4(clone.matrixWorld);
            //alert('x: '+ vertices[i].x + ' y: '+vertices[i].y + ' z: '+vertices[i].z);
            points.push(vertices[i]);
        }
        this.platePoints = points;
    },

    getMirrorPoints: function()
    {
        var clone = this.scene.getObjectByName('mirror').clone();
        var geometry = clone.geometry.clone();
        var vertices = geometry.vertices;
        var points = [];
        clone.updateMatrixWorld();
        for(var i = 0; i < vertices.length/2; i++){
            vertices[i].applyMatrix4(clone.matrixWorld);
            //alert('x: '+ vertices[i].x + ' y: '+vertices[i].y + ' z: '+vertices[i].z);
            points.push(vertices[i]);
        }
        this.mirrorPoints = points;
    },

    smoothCameraTransition: function(target, cameraTarget){
        TWEEN.removeAll();

        controls.target = cameraTarget;

        var current = { x: camera.getWorldPosition().x, y: camera.getWorldPosition().y, z: camera.getWorldPosition().z };
        //var target = {x: -158.76, y: 230, z: 33.29};

        var update = function() {
            camera.position.set(current.x, current.y, current.z);
        };

        var completed = function(){
            controls.target = cameraTarget;
        };

        var tween = new TWEEN.Tween(current)
            .to(target,2000)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(update);
            //.onComplete(completed);

        tween.start();
    },

    teste: function(){
        console.log(camera.getWorldPosition().x, camera.getWorldPosition().y, camera.getWorldPosition().z);
    }

};