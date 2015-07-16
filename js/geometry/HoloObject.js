/**
 * Created by TiagoLuís on 27/02/2015.
 */

CGHLab.HoloObject = function ( position, rotation )
{
    this.position = position;
    this.rotation = rotation;

    this.object = new THREE.Mesh;
    this.figureList = ["Cube", "Sphere", "Cylinder", "Torus Knot"];
    this.figure = "";
    this.detail = "";

    this.lightPoints = [];

    this.getLightPointsPositions = function(){
        var positions = [];
        for (var i = 0; i < this.lightPoints.length; i++){
            positions[i] = this.lightPoints[i].position;
        }
        return positions;
    }
};

CGHLab.HoloObject.prototype = {

    constructor: CGHLab.HoloObject,

    //Setup of the an arbitrary object
    setObject: function( geometry )
    {
        var objectGeometry;
        if (geometry == 'Cube') objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        else if (geometry == 'Sphere') objectGeometry = new THREE.IcosahedronGeometry(0.5, 1);
        else if (geometry == 'Cylinder') objectGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1);
        //else if (geometry == 'pyramid') objectGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1);
        //else if (geometry == 'torus') objectGeometry = new THREE.TorusGeometry(0.5, 0.2, 8, 6);
        else if (geometry == 'Torus Knot') objectGeometry = new THREE.TorusKnotGeometry(0.5, 0.1, 12, 4, 1, 2);
        var objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00});
        this.object = new THREE.Mesh(objectGeometry, objectMaterial);
        this.object.scale.set(30,30,30);
        this.object.position.set(this.position.x, this.position.y, this.position.z);
        this.object.rotateY(this.rotation + Math.PI/2);
        this.object.name = 'object';
        this.figure = geometry;
        this.detail = 'low';
        this.convertToLightPoints();
    },

    swapMaterial: function(flag) {
        if (flag == "Virtual") this.object.material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            ambient: 0x00ff00
            //transparent: true,
            //opacity: 0.75
        });
        else if (flag == "Real") this.object.material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            ambient: 0x00ff00
        });
    },

    //Convert all the vertices to objects of the class LightPoint.
    convertToLightPoints: function()
    {
        var clone = this.object.clone();
        var geometry = clone.geometry.clone();
        var vertices = geometry.vertices;
        var lightPoints = [];
        clone.updateMatrixWorld();
        for(var i = 0; i < vertices.length; i++){
            vertices[i].applyMatrix4(clone.matrixWorld);
            //alert('x: '+ vertices[i].x + 'y '+ vertices[i].y + ' z: '+ vertices[i].z);
            var lp = new CGHLab.LightPoint(vertices[i].x,vertices[i].y,vertices[i].z, 0);
            lightPoints.push(lp);
        }
        this.lightPoints = [];
        this.lightPoints = lightPoints;
        //console.log(this.lightPoints.length);
        //alert(lightPoints.length);
    },

    changeObject: function( geometry )
    {
        var objectGeometry;
        var o = this.object;//this.scene.getObjectByName('object');
        if (geometry == 'Cube') objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        else if (geometry == 'Sphere') objectGeometry = new THREE.IcosahedronGeometry(0.5, 1);
        else if (geometry == 'Cylinder') objectGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1, false, 0, 2*Math.PI);
        //else if (geometry == 'pyramid') objectGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1);
        //else if (geometry == 'torus') objectGeometry = new THREE.TorusGeometry(0.5, 0.2, 8, 6);
        else if (geometry == 'Torus Knot') objectGeometry = new THREE.TorusKnotGeometry(0.5, 0.1, 12, 4, 1, 2);
        o.geometry = objectGeometry;
        this.figure = geometry;
        this.detail = 'low';
        this.convertToLightPoints();
    },

    changeDetail: function( geometry, detail ){
        var objectGeometry;
        var o = this.object;
        if (geometry == 'Cube') {
            switch (detail) {
                case 'Low':
                    objectGeometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
                    break;
                case 'Medium':
                    objectGeometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
                    break;
                case 'High':
                    objectGeometry = new THREE.BoxGeometry(1, 1, 1, 4, 4, 4);
                    break;
                /*case 'ultra':
                    objectGeometry = new THREE.BoxGeometry(1, 1, 1, 5, 5, 5);
                    break;*/
            }
        }
        else if (geometry == 'Sphere') {
            switch (detail) {
                case 'Low':
                    objectGeometry = new THREE.IcosahedronGeometry(0.5, 1);
                    break;
                case 'High':
                    objectGeometry = new THREE.IcosahedronGeometry(0.5, 2);
                    break;
            }
        }
        else if (geometry == 'Cylinder') {
            switch (detail) {
                case 'Low':
                    objectGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1);
                    break;
                case 'Medium':
                    objectGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 2);
                    break;
                case 'High':
                    objectGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 4);
                    break;
                /*case 'ultra':
                    objectGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 4);
                    break;*/
            }
        }
        /*else if (geometry == 'pyramid'){
            switch (detail) {
                case 'low':
                    objectGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1);
                    break;
                case 'medium':
                    objectGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 4);
                    break;
                case 'high':
                    objectGeometry = new THREE.CylinderGeometry(0, 0.5, 1, 4, 8);
                    break;
            }
        }*/
        /*else if (geometry == 'torus') {
            switch (detail) {
                case 'low':
                    objectGeometry = new THREE.TorusGeometry(0.5, 0.2, 8, 8);
                    break;
                case 'medium':
                    objectGeometry = new THREE.TorusGeometry(0.5, 0.2, 8, 12);
                    break;
                case 'high':
                    objectGeometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16);
                    break;
            }
        }*/
        else if (geometry == 'Torus Knot') {
            switch (detail) {
                case 'Low':
                    objectGeometry = new THREE.TorusKnotGeometry(0.5, 0.1, 8, 4, 1, 2);
                    break;
                case 'Medium':
                    objectGeometry = new THREE.TorusKnotGeometry(0.5, 0.1, 16, 4, 1, 2);
                    break;
                case 'High':
                    objectGeometry = new THREE.TorusKnotGeometry(0.5, 0.1, 32, 4, 1, 2);
                    break;
                /*case 'ultra':
                    objectGeometry = new THREE.TorusKnotGeometry(0.5, 0.1, 32, 4, 1, 2);
                    break;*/
            }
        }
        o.geometry = objectGeometry;
        this.detail = detail;
        this.convertToLightPoints();
    },

    clone: function()
    {
        var clone = new CGHLab.HoloObject(this.position, this.rotation);
        clone.object = this.object.clone();
        clone.convertToLightPoints();
        return clone;
    }

};