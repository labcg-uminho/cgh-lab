/**
 * Created by TiagoLuís on 18/02/2015.
 */

MainPerspective = function( renderer, camera )
{
    this.scene = new THREE.Scene();
    this.objects = [];
    this.mirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color:0x889999 } );
    this.objectRotation = 0;
    this.laserPosition = new THREE.Vector3(-15,0,15);
    this.objectPosition = new THREE.Vector3(-15,0,-15);
    this.mirrorPosition = new THREE.Vector3(15,1.5,10);
    this.beamSplitterPosition = new THREE.Vector3(-15,0,10);
    this.platePosition = new THREE.Vector3(15,1.5,-15);

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
        for(i = 0; i < 20; i++){
            copies[i].position.z = this.laserPosition.z - (i*delta);
            this.scene.add(copies[i]);
            this.laserLight1.push(copies[i]);
            copies2[i].position.x = this.beamSplitterPosition.x + (i*delta2);
            this.scene.add(copies2[i]);
            this.laserLight2.push(copies2[i]);
            copies3[i].position.z = this.mirrorPosition.z - (i*delta3);
            this.scene.add(copies3[i]);
            this.laserLight3.push(copies3[i]);
        }

    },

    updateLaser: function(){
        var timer = 0.01;
        var i;
        for(i = 0; i < this.laserLight1.length; i++){
            //this.laserLight1[i].position.z -= timer;
            if ((this.laserLight1[i].position.z -= timer) < this.objectPosition.z) this.laserLight1[i].position.z = this.laserPosition.z;
            //if (this.laserLight1[i].position.z > -15.00) alert('ola');
            else this.laserLight1[i].position.z -= timer;
        }
        for(i = 0; i < this.laserLight2.length; i++){
            //this.laserLight1[i].position.z -= timer;
            if ((this.laserLight2[i].position.x += timer) > this.mirrorPosition.x) this.laserLight2[i].position.x = this.beamSplitterPosition.x;
            //if (this.laserLight1[i].position.z > -15.00) alert('ola');
            else this.laserLight2[i].position.x += timer;
        }
        for(i = 0; i < this.laserLight3.length; i++){
            //this.laserLight1[i].position.z -= timer;
            if ((this.laserLight3[i].position.z -= timer) < this.platePosition.z) this.laserLight3[i].position.z = this.mirrorPosition.z;
            //if (this.laserLight1[i].position.z > -15.00) alert('ola');
            else this.laserLight3[i].position.z -= timer;
        }
    },

    init: function()
    {
        //GEOMETRY
        var mirror = new THREE.Mesh(new THREE.PlaneGeometry( 6, 6 ), this.mirror.material );
        mirror.add(this.mirror);
        mirror.position.set(this.mirrorPosition.x, this.mirrorPosition.y, this.mirrorPosition.z);
        mirror.rotateY(-3*Math.PI / 4);
        var mirrorBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
        var mirrorBoxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var mirrorBox = new THREE.Mesh(mirrorBoxGeometry, mirrorBoxMaterial);
        mirrorBox.scale.set(0.1,6,6);
        mirrorBox.position.set(15.1,1.5,10.1);
        mirrorBox.rotateY(-Math.PI / 4);

        var laserSourceGeometry = new THREE.CylinderGeometry( 1, 1, 3, 32);
        var laserSourceMaterial = new THREE.MeshPhongMaterial( {color: 0x00ffff, ambient: 0x00ffff} );
        var laserSource = new THREE.Mesh(laserSourceGeometry, laserSourceMaterial);
        laserSource.position.set(this.laserPosition.x, this.laserPosition.y, this.laserPosition.z);
        laserSource.rotateX(Math.PI / 2);
        laserSource.name = 'laser';

        var beamSplitterGeometry = new THREE.BoxGeometry(1, 1, 1);
        var beamSplitterMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var beamSplitter = new THREE.Mesh(beamSplitterGeometry, beamSplitterMaterial);
        beamSplitter.scale.set(3,3,3);
        beamSplitter.position.set(this.beamSplitterPosition.x,this.beamSplitterPosition.y, this.beamSplitterPosition.z);

        var objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        var objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00});
        var object = new THREE.Mesh(objectGeometry, objectMaterial);
        object.scale.set(3,3,3);
        object.position.set(this.objectPosition.x, this.objectPosition.y, this.objectPosition.z);
        object.name = 'object';

        var holographicPlateGeometry = new THREE.PlaneGeometry( 6, 6 )
        var holographicPlateMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, ambient: 0x00ff00, side: THREE.DoubleSide });
        var holographicPlate = new THREE.Mesh(holographicPlateGeometry, holographicPlateMaterial);
        holographicPlate.position.set(this.platePosition.x, this.platePosition.y, this.platePosition.z);
        holographicPlate.rotateY(-Math.PI / 4);
        holographicPlate.name = 'plate';

        var floorGeometry = new THREE.PlaneGeometry( 50, 50);
        var floorMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00, ambient: 0xffff00, side: THREE.DoubleSide} );
        var floor = new THREE.Mesh( floorGeometry, floorMaterial );
        floor.position.y = -1.5;
        floor.rotation.x = Math.PI / 2;

        var axes = new THREE.AxisHelper(10);
        this.scene.add( axes );

        this.scene.add(mirror);
        this.scene.add(mirrorBox);
        this.scene.add(floor);
        this.scene.add(object);
        this.scene.add(holographicPlate);
        this.scene.add(laserSource);
        this.scene.add(beamSplitter);

        //this.laserOn();

        this.objects.push(object);
        this.objects.push(holographicPlate);

        //LIGHT
        var ambLight = new THREE.AmbientLight( 0x505050 );
        //var light = new THREE.PointLight( 0xffffff, 1);
        var light = new THREE.PointLight(0xffffff, 1);
        light.position.set( 0, 50, 0);
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
