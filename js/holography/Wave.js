/**
 * Created by TiagoLuís on 03/03/2015.
 */

CGHLab.Wave = function(phase, amplitude, waveLength)
{
    this.phase = phase || 0;
    this.amplitude = amplitude || 1;
    this.waveLength = waveLength || 1;
};

CGHLab.Wave.prototype = {

    constructor: CGHLab.Wave

};
