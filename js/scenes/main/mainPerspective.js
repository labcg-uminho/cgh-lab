/**
 * Created by TiagoLuís on 18/02/2015.
 */

MainPerspective = function( renderer, camera )
{
    this.scene = new THREE.Scene();
    this.objects = [];
    this.mirror = new THREE.Mirror( renderer, camera, { clipBias: 0.003, textureWidth: window.innerWidth, textureHeight: window.innerHeight, color:0x889999 } );
};

MainPerspective.prototype = {

    constructor: MainPerspective,

    init: function()
    {
        //GEOMETRY
        var mirror = new THREE.Mesh(new THREE.PlaneGeometry( 6, 6 ), this.mirror.material );
        mirror.add(this.mirror);
        mirror.position.y = 1.5;
        mirror.position.x = -6;
        mirror.rotateY(Math.PI / 2);
        var mirrorBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
        var mirrorBoxMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var mirrorBox = new THREE.Mesh(mirrorBoxGeometry, mirrorBoxMaterial);
        mirrorBox.scale.set(0.1,6,6);
        mirrorBox.position.set(-6.1,1.5,0)

        var laserSourceGeometry = new THREE.CylinderGeometry( 1, 1, 3, 32);
        var laserSourceMaterial = new THREE.MeshPhongMaterial( {color: 0x00ffff, ambient: 0x00ffff} );
        var laserSource = new THREE.Mesh(laserSourceGeometry, laserSourceMaterial);
        laserSource.position.set(0,0,6);
        laserSource.rotateX(Math.PI / 2);

        var beamSplitterGeometry = new THREE.BoxGeometry(1, 1, 1);
        var beamSplitterMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, ambient: 0xffffff });
        var beamSplitter = new THREE.Mesh(beamSplitterGeometry, beamSplitterMaterial);
        beamSplitter.scale.set(3,3,3);
        beamSplitter.position.set(0,0,-6);

        var objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        var objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00});
        var object = new THREE.Mesh(objectGeometry, objectMaterial);
        object.scale.set(3,3,3);
        object.name = 'object';

        var holographicPlateGeometry = new THREE.PlaneGeometry( 6, 6 )
        var holographicPlateMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, ambient: 0x00ff00, side: THREE.DoubleSide });
        var holographicPlate = new THREE.Mesh(holographicPlateGeometry, holographicPlateMaterial);
        holographicPlate.position.set(5,1.5,0);
        holographicPlate.rotateY(-Math.PI / 2);
        holographicPlate.name = 'plate';

        var floorGeometry = new THREE.PlaneGeometry( 50, 50);
        var floorMaterial = new THREE.MeshPhongMaterial( {color: 0xffff00, ambient: 0xffff00, side: THREE.DoubleSide} );
        var floor = new THREE.Mesh( floorGeometry, floorMaterial );
        floor.position.y = -1.5;
        floor.rotation.x = Math.PI / 2;

        this.scene.add(mirror);
        this.scene.add(mirrorBox);
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
