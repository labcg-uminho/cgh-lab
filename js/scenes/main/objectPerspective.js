/**
 * Created by tiago on 3/21/15.
 */

CGHLab.ObjectPerspective = function( mainScene ){

    this.mainScene = mainScene;
    this.lightPointWaveShader = THREE.Material;

};

CGHLab.ObjectPerspective.prototype = {

    constructor: CGHLab.ObjectPerspective,

    setLightPoints: function( lightPoints, collidableList )
    {
        var i;
        var lightPointGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        var lightPointMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 , ambient: 0x000000});
        for(i = 0; i < lightPoints.length; i++ ){
            var lightPointMesh = new THREE.Mesh(lightPointGeometry, lightPointMaterial);
            lightPointMesh.position.set(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            lightPointMesh.name = 'lightPoint'+i;
            collidableList.push(lightPointMesh);
            this.mainScene.scene.add(lightPointMesh);
        }
    },

    setLightPointWaveMaterial: function(){
        var shader = CGHLab.GeometryShaderLib.myLambertSphere;
        var lightPointMaterial = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.DoubleSide,
            lights:true,
            fog: true,
            transparent: true
        });
        lightPointMaterial.uniforms.opacity.value = 0.5;
        this.lightPointWaveShader = lightPointMaterial;
    },

    sendLightPointWaveSimple: function( lightPoints ){
        var i;
        var lightPointGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        /*var shader = CGHLab.GeometryShaderLib.sphereShader;
        var lightPointMaterial = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.DoubleSide,
            transparent: true
        });*/
        var lightPointMesh = new THREE.Mesh(lightPointGeometry, this.lightPointWaveShader);

        var platePoints = mainScene.platePoints;

        for(i = 0; i < lightPoints.length; i++ ){
            var clone = lightPointMesh.clone();
            var materialClone  = lightPointMaterial.clone();
            clone.position.set(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            materialClone.uniforms.origin.value = new THREE.Vector3(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            materialClone.uniforms.plate.value = platePoints;
            clone.material = materialClone;
            this.mainScene.scene.add(clone);
            this.mainScene.addToLightPointWaves(clone);
        }
    },

    sendLightPointWaveComplete: function( lightPoint, lightPointMaterial ){
        var lightPointGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        /*var shader = CGHLab.GeometryShaderLib.sphereShader;
         var lightPointMaterial = new THREE.ShaderMaterial({
         uniforms: shader.uniforms,
         vertexShader: shader.vertexShader,
         fragmentShader: shader.fragmentShader,
         side: THREE.DoubleSide,
         transparent: true
         });*/
        var lightPointMesh = new THREE.Mesh(lightPointGeometry, lightPointMaterial);

        var platePoints = mainScene.platePoints;

        var clone = lightPointMesh.clone();
        var materialClone  = lightPointMaterial.clone();
        clone.position.set(lightPoint.position.x, lightPoint.position.y, lightPoint.position.z);
        materialClone.uniforms.origin.value = new THREE.Vector3(lightPoint.position.x, lightPoint.position.y, lightPoint.position.z);
        materialClone.uniforms.plate.value = platePoints;
        clone.material = materialClone;
        this.mainScene.scene.add(clone);
        this.mainScene.addToLightPointWaves(clone);
    },

    rotateObject: function( value )
    {
        //First delete the previous light points from the scene
        var i;
        for (i = 0; i < this.mainScene.object.lightPoints.length; i++){
            var object = this.mainScene.scene.getObjectByName('lightPoint'+i);
            this.mainScene.scene.remove(object);
        }

        //Rotate the object
        var rad = CGHLab.Helpers.deg2rad(value);
        var r = rad - this.mainScene.objectRotationScene;
        this.mainScene.objectRotationScene += r;
        if ((this.mainScene.objectRotationScene) > 2*Math.PI) this.mainScene.objectRotationScene = this.mainScene.objectRotationScene - 2*Math.PI;
        this.mainScene.object.object.rotateY(r);
        this.mainScene.object.convertToLightPoints();

        this.mainScene.collidableList = [];
        //Sets the new light points (moves them to the new positions)
        this.setLightPoints(this.mainScene.object.lightPoints, this.mainScene.collidableList);

        this.mainScene.updateShaderUniforms();
    },

    changeObject: function( value )
    {
        //First delete the previous light points from the scene
        var i;
        for (i = 0; i < this.mainScene.object.lightPoints.length; i++){
            var object = this.mainScene.scene.getObjectByName('lightPoint'+i);
            this.mainScene.scene.remove(object);
        }

        //Change the object
        this.mainScene.object.changeObject(value);
        this.mainScene.updateShaderUniforms();

        //Delete the lightPoint waves
        var lightPointsWave = this.mainScene.getLightPointWaves();
        for(i = 0; i < lightPointsWave.list.length; i++){
            this.mainScene.scene.remove(lightPointsWave.list[i]);
        }
        this.mainScene.eraseLightPointWaves();
        this.mainScene.collidableList = [];
        //Sets the new light points
        this.setLightPoints(this.mainScene.object.lightPoints, this.mainScene.collidableList);
        this.mainScene.objWaveArrived = false;
        this.mainScene.patternShown = false;
        if(!this.mainScene.interferencePatternInstant) this.mainScene.hideInterferencePattern();
    },

    changeDetail: function( geometry, detail ){
        //First delete the previous light points from the scene
        var i;
        for (i = 0; i < this.mainScene.object.lightPoints.length; i++){
            var object = this.mainScene.scene.getObjectByName('lightPoint'+i);
            this.mainScene.scene.remove(object);
        }

        //ChangeDetail
        this.mainScene.object.changeDetail(geometry, detail);
        this.mainScene.updateShaderUniforms();

        //Delete the lightPoint waves
        var lightPointsWave = this.mainScene.getLightPointWaves();
        for(i = 0; i < lightPointsWave.list.length; i++){
            this.mainScene.scene.remove(lightPointsWave.list[i]);
        }
        this.mainScene.eraseLightPointWaves();
        this.mainScene.collidableList = [];
        //Sets the new light points
        this.setLightPoints(this.mainScene.object.lightPoints, this.mainScene.collidableList);
        this.mainScene.objWaveArrived = false;
        this.mainScene.patternShown = false;
        if(!this.mainScene.interferencePatternInstant) this.mainScene.hideInterferencePattern();
    }

};