/**
 * Created by TiagoLuís on 18/02/2015.
 */

MainPerspective = function( renderer, camera )
{
    this.scene = new THREE.Scene();
    this.objects = [];
    this.mirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color:0x889999 } );

    this.platePosition = new THREE.Vector3(3,3,0);
    this.plateRotation = 0;//-Math.PI/4;
    //var plateNormal = new THREE.Vector3(Math.sin(this.plateRotation), 0, Math.cos(this.plateRotation)).normalize();


    //Direction of mirror in relation to plate
    this.dirMirror = new THREE.Vector3(Math.sin(this.plateRotation+Math.PI/4), 0, Math.cos(this.plateRotation+Math.PI/4)).normalize();
    var unitsMirror = 25;
    this.mirrorPosition = new THREE.Vector3();
    this.mirrorPosition.addVectors(this.platePosition, this.dirMirror.multiplyScalar(unitsMirror));
    this.mirrorRotation = -Math.PI/2 + this.plateRotation;

    //Direction of object in relation to plate
    this.dirObject = new THREE.Vector3(Math.sin(this.plateRotation-Math.PI/4), 0, Math.cos(this.plateRotation-Math.PI/4)).normalize();
    var unitsObject = 30;
    this.objectPosition = new THREE.Vector3();
    this.objectPosition.addVectors(this.platePosition, this.dirObject.multiplyScalar(unitsObject));
    this.objectRotation = this.plateRotation + Math.PI/4;

    //Direction of laser in relation to object
    this.dirLaser = new THREE.Vector3(Math.sin(this.plateRotation+Math.PI/4), 0, Math.cos(this.plateRotation+Math.PI/4)).normalize();
    var unitsLaser = 30;
    this.laserPosition = new THREE.Vector3();
    this.laserPosition.addVectors(this.objectPosition, this.dirLaser.multiplyScalar(unitsLaser));
    this.laserRotation = this.plateRotation + Math.PI/4;

    //Direction of beam splitter in relation to mirror
    this.dirSplitter = new THREE.Vector3(Math.sin(this.plateRotation-Math.PI/4), 0, Math.cos(this.plateRotation-Math.PI/4)).normalize();
    var unitsSplitter = 30;
    this.beamSplitterPosition = new THREE.Vector3();
    this.beamSplitterPosition.addVectors(this.mirrorPosition, this.dirSplitter.multiplyScalar(unitsSplitter));
    this.beamSplitterRotation = this.plateRotation + Math.PI/4;

    this.center = new THREE.Vector3();
    this.center.addVectors(this.platePosition,this.laserPosition).divideScalar(2);

    this.laserLight1 = [];
    this.laserLight2 = [];
    this.laserLight3 = [];
};

MainPerspective.prototype = {

    constructor: MainPerspective,

    /*updateObjectRotation: function( angle )
    {
        var o = this.scene.getObjectByName('object');
        var rads = (angle * Math.PI)/180;
        this.cubeRotation = angle;
        o.rotateY(rads);
    },*/
    objectRotationPlus: function()
    {
        var o = this.scene.getObjectByName('object');
        var rads = (Math.PI)/180;
        o.rotateY(rads);
        if ((this.objectRotation + 1) > 360) this.objectRotation = 0;
        else this.objectRotation += 1;
    },

    laserOn: function()
    {
        var i;
        var laser = this.scene.getObjectByName('laser');
        var distance = this.laserPosition.distanceTo(this.objectPosition);
        var distance2 = this.beamSplitterPosition.distanceTo(this.mirrorPosition);
        var distance3 = this.mirrorPosition.distanceTo(this.platePosition);

        var delta = distance/20;
        var delta2 = distance2/20;
        var delta3 = distance3/20;

        var lightGeometry = new THREE.CircleGeometry(1,32);
        var lightMaterial = new THREE.MeshPhongMaterial( {color: 0x0000ff, ambient: 0x0000ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5} );
        var light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
        var light2 = light.clone();
        light2.rotateY(Math.PI/2);
        light2.position.set(this.beamSplitterPosition.x,this.beamSplitterPosition.y, this.beamSplitterPosition.z);
        var light3 = light.clone();
        light3.position.set(this.mirrorPosition.x, this.beamSplitterPosition.y, this.mirrorPosition.z);

        var copies = [];
        var copies2 = [];
        var copies3 = [];
        for(i = 0; i < 20; i++){
            copies.push(light.clone());
            copies2.push(light2.clone());
            copies3.push(light3.clone());
        }
        //alert('x: '+ this.dirLaser.normalize().x+' y: '+this.dirLaser.normalize().y+' z: '+this.dirLaser.normalize().z);
        //alert('x: '+ this.dirObject.normalize().x+' y: '+this.dirObject.normalize().y+' z: '+this.dirObject.normalize().z);
        //alert('x: '+ this.dirSplitter.normalize().x+' y: '+this.dirSplitter.normalize().y+' z: '+this.dirSplitter.normalize().z);
        for(i = 0; i < 20; i++){
            copies[i].position.set(this.laserPosition.x - (this.dirLaser.normalize().x * (i*delta)), this.laserPosition.y, this.laserPosition.z - (this.dirLaser.normalize().z * (i*delta)));
            copies[i].rotateY(this.laserRotation);
            this.scene.add(copies[i]);
            this.laserLight1.push(copies[i]);

            copies2[i].position.set(this.beamSplitterPosition.x - (this.dirSplitter.normalize().x * (i*delta2)), this.beamSplitterPosition.y, this.beamSplitterPosition.z - (this.dirSplitter.normalize().z * (i*delta2)));
            copies2[i].rotateY(this.beamSplitterRotation);
            this.scene.add(copies2[i]);
            this.laserLight2.push(copies2[i]);

            copies3[i].position.set(this.mirrorPosition.x - (this.dirMirror.normalize().x * (i*delta3)), this.mirrorPosition.y, this.mirrorPosition.z - (this.dirMirror.normalize().z * (i*delta3)));
            copies3[i].rotateY(this.laserRotation);
            this.scene.add(copies3[i]);
            this.laserLight3.push(copies3[i]);
        }
        /*var axes1 = new THREE.AxisHelper(10);
        copies[0].add( axes1 );
        var axes2 = new THREE.AxisHelper(10);
        copies2[0].add( axes2 );
        var axes3 = new THREE.AxisHelper(10);
        copies3[0].add( axes3 );*/

    },

    updateLaser: function(){
        var timer = 0.01;
        var i;
        for(i = 0; i < this.laserLight1.length; i++){
            this.laserLight1[i].position.z -= this.dirLaser.normalize().z * timer;
            this.laserLight1[i].position.x -= this.dirLaser.normalize().x * timer;
            if (this.laserLight1[i].position.z < this.objectPosition.z) {
                this.laserLight1[i].position.x = this.laserPosition.x;
                this.laserLight1[i].position.z = this.laserPosition.z;
            }
        }
        for(i = 0; i < this.laserLight2.length; i++){
            this.laserLight2[i].position.z -= this.dirSplitter.normalize().z * timer;
            this.laserLight2[i].position.x -= this.dirSplitter.normalize().x * timer;
            if (this.laserLight2[i].position.z < this.mirrorPosition.z) {
                this.laserLight2[i].position.x = this.beamSplitterPosition.x;
                this.laserLight2[i].position.z = this.beamSplitterPosition.z;
            }
        }
        for(i = 0; i < this.laserLight3.length; i++){
            this.laserLight3[i].position.z -= this.dirMirror.normalize().z * timer;
            this.laserLight3[i].position.x -= this.dirMirror.normalize().x * timer;
            if (this.laserLight3[i].position.z < this.platePosition.z) {
                this.laserLight3[i].position.x = this.mirrorPosition.x;
                this.laserLight3[i].position.z = this.mirrorPosition.z;
            }
        }
    },

    init: function()
    {
        //GEOMETRY
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

        var laserSourceGeometry = new THREE.CylinderGeometry( 1, 1, 3, 32);
        var laserSourceMaterial = new THREE.MeshPhongMaterial( {color: 0x00ffff, ambient: 0x00ffff} );
        var laserSource = new THREE.Mesh(laserSourceGeometry, laserSourceMaterial);
        laserSource.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
        laserSource.rotateY(this.laserRotation);
        laserSource.rotateX(Math.PI / 2);
        laserSource.name = 'laser';

        var beamSplitterGeometry = new THREE.BoxGeometry(1, 1, 1);
        var beamSplitterMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var beamSplitter = new THREE.Mesh(beamSplitterGeometry, beamSplitterMaterial);
        beamSplitter.scale.set(3,3,3);
        beamSplitter.position.set(this.beamSplitterPosition.x,this.beamSplitterPosition.y, this.beamSplitterPosition.z);
        beamSplitter.rotateY(this.beamSplitterRotation);

        var objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        var objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00});
        var object = new THREE.Mesh(objectGeometry, objectMaterial);
        object.scale.set(3,3,3);
        object.position.set(this.objectPosition.x, this.objectPosition.y, this.objectPosition.z);
        object.rotateY(this.objectRotation);
        object.name = 'object';

        var holographicPlateGeometry = new THREE.PlaneGeometry( 6, 6 )
        var holographicPlateMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, ambient: 0x00ff00, side: THREE.DoubleSide });
        var holographicPlate = new THREE.Mesh(holographicPlateGeometry, holographicPlateMaterial);
        holographicPlate.position.set(this.platePosition.x, this.platePosition.y, this.platePosition.z);
        holographicPlate.rotateY(this.plateRotation);
        holographicPlate.name = 'plate';

        var floorGeometry = new THREE.PlaneGeometry( 50, 50);
        var floorMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00, ambient: 0xffff00, side: THREE.DoubleSide} );
        var floor = new THREE.Mesh( floorGeometry, floorMaterial );
        floor.position.y = 0;
        floor.position.x = this.center.x;
        floor.position.z = this.center.z;
        floor.rotation.z = Math.PI / 4;
        floor.rotation.x = Math.PI / 2;

        var axes = new THREE.AxisHelper(10);
        this.scene.add( axes );

        this.scene.add(mirror);
        mirror.add(mirrorBox);
        this.scene.add(floor);
        this.scene.add(object);
        this.scene.add(holographicPlate);
        this.scene.add(laserSource);
        this.scene.add(beamSplitter);

        this.objects.push(object);
        this.objects.push(holographicPlate);

        //LIGHT
        var ambLight = new THREE.AmbientLight( 0x505050 );
        //var light = new THREE.PointLight( 0xffffff, 1);
        var light = new THREE.PointLight(0xffffff, 1);
        light.position.set( this.center.x, 50, this.center.z);
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
    }
};