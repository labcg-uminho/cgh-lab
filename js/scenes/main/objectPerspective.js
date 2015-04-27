/**
 * Created by tiago on 3/21/15.
 */

CGHLab.ObjectPerspective = {

    setLightPoints: function( scene, lightPoints, collidableList )
    {
        var i;
        var lightPointGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        var lightPointMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 , ambient: 0x000000});
        for(i = 0; i < lightPoints.length; i++ ){
            var lightPointMesh = new THREE.Mesh(lightPointGeometry, lightPointMaterial);
            lightPointMesh.position.set(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            lightPointMesh.name = 'lightPoint'+i;
            collidableList.push(lightPointMesh);
            scene.add(lightPointMesh);
        }
    },

    setLightPointWaveMaterial: function(mainScene){
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
        mainScene.lightPointWaveShader = lightPointMaterial;
    },

    sendLightPointWaveSimple: function( scene, lightPoints, mainScene, lightPointMaterial ){
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
        var lightPointMesh = new THREE.Mesh(lightPointGeometry, lightPointMaterial);

        var platePoints = mainScene.platePoints;

        for(i = 0; i < lightPoints.length; i++ ){
            var clone = lightPointMesh.clone();
            var materialClone  = lightPointMaterial.clone();
            clone.position.set(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            materialClone.uniforms.origin.value = new THREE.Vector3(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            materialClone.uniforms.plate.value = platePoints;
            clone.material = materialClone;
            scene.add(clone);
            mainScene.addToLightPointWaves(clone);
        }
    },

    sendLightPointWaveComplete: function( scene, lightPoint, mainScene, lightPointMaterial ){
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
        var lightPointMesh = new THREE.Mesh(lightPointGeometry, lightPointMaterial);

        var platePoints = mainScene.platePoints;

        var clone = lightPointMesh.clone();
        var materialClone  = lightPointMaterial.clone();
        clone.position.set(lightPoint.position.x, lightPoint.position.y, lightPoint.position.z);
        materialClone.uniforms.origin.value = new THREE.Vector3(lightPoint.position.x, lightPoint.position.y, lightPoint.position.z);
        materialClone.uniforms.plate.value = platePoints;
        clone.material = materialClone;
        scene.add(clone);
        mainScene.addToLightPointWaves(clone);
    },

    rotateObject: function(value, mainScene)
    {
        //First delete the previous light points from the scene
        var i;
        for (i = 0; i < mainScene.object.lightPoints.length; i++){
            var object = mainScene.scene.getObjectByName('lightPoint'+i);
            mainScene.scene.remove(object);
        }

        //Rotate the object
        var rad = CGHLab.Helpers.deg2rad(value);
        var r = rad - mainScene.objectRotationScene;
        mainScene.objectRotationScene += r;
        if ((mainScene.objectRotationScene) > 2*Math.PI) mainScene.objectRotationScene = mainScene.objectRotationScene - 2*Math.PI;
        mainScene.object.object.rotateY(r);
        mainScene.object.convertToLightPoints();

        mainScene.collidableList = [];
        //Sets the new light points (moves them to the new positions)
        this.setLightPoints(mainScene.scene, mainScene.object.lightPoints, mainScene.collidableList);

        mainScene.updateShaderUniforms();
    },

    changeObject: function(value, mainScene)
    {
        //First delete the previous light points from the scene
        var i;
        for (i = 0; i < mainScene.object.lightPoints.length; i++){
            var object = mainScene.scene.getObjectByName('lightPoint'+i);
            mainScene.scene.remove(object);
        }

        //Change the object
        mainScene.object.changeObject(value);
        mainScene.updateShaderUniforms();

        //Delete the lightPoint waves
        var lightPointsWave = mainScene.getLightPointWaves();
        for(i = 0; i < lightPointsWave.list.length; i++){
            mainScene.scene.remove(lightPointsWave.list[i]);
        }
        mainScene.eraseLightPointWaves();
        mainScene.collidableList = [];
        //Sets the new light points
        this.setLightPoints(mainScene.scene, mainScene.object.lightPoints, mainScene.collidableList);
        mainScene.objWaveArrived = false;
        mainScene.patternShown = false;
        if(!mainScene.interferencePatternInstant) mainScene.hideInterferencePattern();
    },

    changeDetail: function(geometry, detail, mainScene){
        //First delete the previous light points from the scene
        var i;
        for (i = 0; i < mainScene.object.lightPoints.length; i++){
            var object = mainScene.scene.getObjectByName('lightPoint'+i);
            mainScene.scene.remove(object);
        }

        //ChangeDetail
        mainScene.object.changeDetail(geometry, detail);
        mainScene.updateShaderUniforms();

        //Delete the lightPoint waves
        var lightPointsWave = mainScene.getLightPointWaves();
        for(i = 0; i < lightPointsWave.list.length; i++){
            mainScene.scene.remove(lightPointsWave.list[i]);
        }
        mainScene.eraseLightPointWaves();
        mainScene.collidableList = [];
        //Sets the new light points
        this.setLightPoints(mainScene.scene, mainScene.object.lightPoints, mainScene.collidableList);
        mainScene.objWaveArrived = false;
        mainScene.patternShown = false;
        if(!mainScene.interferencePatternInstant) mainScene.hideInterferencePattern();
    }

};