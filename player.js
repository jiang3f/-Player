/* name space */
var Rubiks = Rubiks || {};

Dash.Player = function(element) {

    cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
    cast.player.api.setLoggerLevel(cast.player.api.LoggerLevel.DEBUG);
  
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

    // player
    this.player = null;
   
    /*====================================================================================
    *    For media applications, override/provide any event listeners on the MediaManager. 
    *===================================================================================*/

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
Dash.Player.prototype.set_appConfig = function() {
    this.appConfig.statusText = 'Ready to play';

    // 100 minutes for testing, use default 10sec in prod by not setting this value
    console.log("set maxInactivity to 100 Mns for testing!");
    this.appConfig.maxInactivity = 6000;
    
}

/**
 * Called when we receive a LOAD message. Calls load().
 */
Dash.Player.prototype.onLoad = function(event) {
    console.log('onLoad');

    if (this.player !== null) {
        this.player.unload();    // Must unload before starting again.
        this.player = null;
    }

    if (event.data['media'] && event.data['media']['contentId']) {
        console.log('Starting media application');
        var url = event.data['media']['contentId'];

        window.host = new cast.player.api.Host({'mediaElement':this.mediaElement, 'url':url});
        var ext = url.substring(url.lastIndexOf('.'), url.length);
        var initStart = event.data['media']['currentTime'] || 0;
        var autoplay = event.data['autoplay'] || true;
        var protocol = null;
        this.mediaElement.autoplay = autoplay;  // Make sure autoplay get's set
        if (url.lastIndexOf('.m3u8') >= 0) {
            protocol = cast.player.api.CreateHlsStreamingProtocol(host);
        } else if (url.lastIndexOf('.mpd') >= 0) {
            protocol = cast.player.api.CreateDashStreamingProtocol(host);
        } else if (url.indexOf('.ismc') >= 0) {
            protocol = cast.player.api.CreateSmoothStreamingProtocol(host);
        }

        host.onError = function(errorCode) {
            console.log("Fatal Error - " + errorCode);
            if (this.player) {
                this.player.unload();
                this.player = null;
            }
        };

        console.log("we have protocol " + ext);
        if (protocol !== null) {
            console.log("Starting Media Player Library");
            this.player = new cast.player.api.Player(host);
            this.player.load(protocol, initStart);
        }
        else {
            this.onLoadOrig(event);
        }
    }
};
  

/**
 * Starts the player.
 */
Dash.Player.prototype.start = function() {

    this.set_appConfig();

    this.receiverManager.start(this.appConfig);

};
