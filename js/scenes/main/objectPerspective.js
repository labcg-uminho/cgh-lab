/**
 * Created by tiago on 3/21/15.
 */

CGHLab.ObjectPerspective = {

    setLightPoints: function( scene, lightPoints )
    {
        var i;
        var lightPointGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        var lightPointMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00});
        for(i = 0; i < lightPoints.length; i++ ){
            var lightPointMesh = new THREE.Mesh(lightPointGeometry, lightPointMaterial);
            lightPointMesh.position.set(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            lightPointMesh.name = 'lightPoint'+i;
            scene.add(lightPointMesh);
        }
    },

    setLightPointWaveMaterial: function(mainScene){
        var shader = CGHLab.GeometryShaderLib.sphereShader;
        var lightPointMaterial = new THREE.ShaderMaterial({
            uniforms: shader.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            side: THREE.DoubleSide,
            transparent: true
        });

        mainScene.lightPointWaveShader = lightPointMaterial;
    },

    sendLightPointWave: function( scene, lightPoints, mainScene, lightPointMaterial ){
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

        for(i = 0; i < 1; i++ ){
            var clone = lightPointMesh.clone();
            var materialClone  = lightPointMaterial.clone();
            clone.position.set(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            materialClone.uniforms.origin.value = new THREE.Vector3(lightPoints[i].position.x, lightPoints[i].position.y, lightPoints[i].position.z);
            materialClone.uniforms.plate.value = platePoints;
            clone.material = materialClone;
            scene.add(clone);
            mainScene.addToLightPointWaves(clone);
        }
    }

};