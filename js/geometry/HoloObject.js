/**
 * Created by TiagoLuís on 27/02/2015.
 */

CGHLab.HoloObject = function ( position, rotation )
{
    this.position = position;
    this.rotation = rotation;

    this.object = new THREE.Mesh;

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
        if (geometry == 'cube') objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        //else if (geometry == 'sphere') objectGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        else if (geometry == 'sphere') objectGeometry = new THREE.IcosahedronGeometry(0.5,2);
        else if (geometry == 'octahedron') objectGeometry = new THREE.OctahedronGeometry(0.5,0);
        else if (geometry == 'tetrahedron') objectGeometry = new THREE.TetrahedronGeometry(0.5,0);
        var objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00});
        this.object = new THREE.Mesh(objectGeometry, objectMaterial);
        this.object.scale.set(30,30,30);
        this.object.position.set(this.position.x, this.position.y, this.position.z);
        this.object.rotateY(this.rotation);
        this.object.name = 'object';
        this.convertToLightPoints();
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
        //alert(lightPoints.length);
    },

    changeObject: function( geometry )
    {
        var objectGeometry;
        var o = this.object;//this.scene.getObjectByName('object');
        if (geometry == 'cube') objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        //else if (geometry == 'sphere') objectGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        else if (geometry == 'sphere') objectGeometry = new THREE.IcosahedronGeometry(0.5,2);
        else if (geometry == 'octahedron') objectGeometry = new THREE.OctahedronGeometry(0.5,0);
        else if (geometry == 'tetrahedron') objectGeometry = new THREE.TetrahedronGeometry(0.5,0);
        o.geometry = objectGeometry;
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