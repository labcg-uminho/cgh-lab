/**
 * Created by TiagoLuís on 27/02/2015.
 */

CGHLab.HoloObject = function ( position, rotation )
{
    this.position = position;
    this.rotation = rotation;

    this.object = new THREE.Mesh;
};

CGHLab.HoloObject.prototype = {

    constructor: CGHLab.HoloObject,

    //Setup of the an arbitrary object
    setObject: function( geometry )
    {
        var objectGeometry;
        if (geometry == 'cube') objectGeometry = new THREE.BoxGeometry(1, 1, 1);
        else if (geometry == 'sphere') objectGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        var objectMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 , ambient: 0x00ff00});
        this.object = new THREE.Mesh(objectGeometry, objectMaterial);
        this.object.scale.set(3,3,3);
        this.object.position.set(this.position.x, this.position.y, this.position.z);
        this.object.rotateY(this.rotation);
        this.object.name = 'object';
    },

    //Convert all the vertices to objects of the class LightPoint.
    convertToLightPoints: function()
    {
        var clone = this.object.clone();
        var geometry = clone.geometry.clone();
        var vertices = geometry.vertices;
        var lightPoints = [];
        //alert(vertices.length);
        clone.updateMatrixWorld();
        //var vector = new THREE.Vector3();
        //vector.setFromMatrixPosition( clone.matrixWorld );
        for(var i = 0; i < vertices.length; i++){
            vertices[i].applyMatrix4(clone.matrixWorld);
            //alert('x: '+vertices[i].x+' y: '+vertices[i].y+' z: '+vertices[i].z);
            var lp = new CGHLab.LightPoint(vertices[i].x,vertices[i].y,vertices[i].z);
            lightPoints.push(lp);
        }
        //alert('x: '+vector.x+' y: '+vector.y+' z: '+vector.z);
        //alert('x: '+vertices[0].x+' y: '+vertices[0].y+' z: '+vertices[0].z);
        return lightPoints;
    },

    clone: function()
    {
        var clone = new CGHLab.HoloObject(this.position, this.rotation);
        clone.object.copy(this.object);
    }

};