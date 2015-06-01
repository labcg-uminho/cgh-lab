/**
 * Created by Tiago on 07/05/2015.
 */

CGHLab.PlatePerspective = function( mainScene ){

    this.mainScene = mainScene;

};

CGHLab.PlatePerspective.prototype = {

    constructor: CGHLab.PlatePerspective,

    changeObject: function( value )
    {
        //Changes the object
        this.mainScene.object.changeObject(value);
        this.mainScene.updateShaderUniforms();

        //if(!this.mainScene.interferencePatternInstant) this.mainScene.hideInterferencePattern();
    },

    changeDetail: function( geometry, detail )
    {
        //ChangeDetail
        this.mainScene.object.changeDetail(geometry, detail);
        this.mainScene.updateShaderUniforms();

        if(!this.mainScene.interferencePatternInstant) this.mainScene.hideInterferencePattern();
    }

};