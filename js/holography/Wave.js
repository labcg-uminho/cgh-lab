/**
 * Created by TiagoLuís on 03/03/2015.
 */

Wave = function(phase, amplitude, waveLength)
{
    this.phase = phase || 0;
    this.amplitude = amplitude || 1;
    this.waveLength = waveLength || 1;
};

Wave.prototype = {

    constructor: Wave

};
