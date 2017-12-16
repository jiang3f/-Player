/* name space */
var Rubiks = Rubiks || {};

Rubiks.Player = function(element) {

    cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);

    /*
    *    class members
    */
    // 
    this.element = element;

    // video element
    this.mediaElement = this.element.querySelector('video');

    // media manager
    this.mediaManager = new window.cast.receiver.MediaManager(this.mediaElement);

    // cast receier manager
    this.receiverManager = window.cast.receiver.CastReceiverManager.getInstance();

    // config
    this.appConfig = new cast.receiver.CastReceiverManager.Config();

   
    /*====================================================================================
    *    For media applications, override/provide any event listeners on the MediaManager. 
    *===================================================================================*/

    /**
     * Called when we receive a LOAD message. Calls load().
     * @param {cast.receiver.MediaManager.Event} event The load event.
     * @private
     */
    /*
    this.mediaManager.onLoad = (function() {
        this.mediaManager.origOnLoad = this.mediaManager.onLoad;
        return function(event) {
            console.log("onload");
            this.mediaManager.origOnLoad(event);
        }
    }());

    this.mediaManager['origOnLoad'] = this.mediaManager.onLoad;
    this.mediaManager.onLoad = function (event) {
        console.log("onLoad");
        this.mediaManager['origOnLoad'](event);
    }

    this.mediaManager['origOnPlay'] = this.mediaManager.onPlay;
    this.mediaManager.onPlay = function (event) {
        //do whatever is needed for the receiver application logic
        console.log("onPlay");
        this.mediaManager['origOnPlay'](event);
    }
    */

    /**
     * The original metadata error callback.
     * @private {?function(!cast.receiver.MediaManager.LoadInfo)}
     */
    this.onLoadOrig = this.mediaManager.onLoad.bind(this.mediaManager);
    this.mediaManager.onLoad = this.onLoad.bind(this);

}


// ========================================================================================================================================
// ========================================================================================================================================

/**
 * set app config.
 */
Rubiks.Player.prototype.set_appConfig = function() {
    this.appConfig.statusText = 'Ready to play';

    // 100 minutes for testing, use default 10sec in prod by not setting this value
    console.log("set maxInactivity to 100 Mns for testing!");
    this.appConfig.maxInactivity = 6000;
    
}

/**
 * Called when the media could not be successfully loaded. Transitions to
 * IDLE state and calls the original media manager implementation.
 *
 * @see cast.receiver.MediaManager#onLoadMetadataError
 * @param {!cast.receiver.MediaManager.LoadInfo} event The data
 *     associated with a LOAD event.
 * @private
 */
Rubiks.Player.prototype.onLoad = function(event) {
    console.log('onLoad');
    this.onLoadOrig(event);
};
  
  

/**
 * Starts the player.
 */
Rubiks.Player.prototype.start = function() {

    this.set_appConfig();

    this.receiverManager.start(this.appConfig);

};
