/* name space */
var Dash = Dash || {};

Dash.Player = function(element) 
{

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

    // protocol
    this.protocol = null;

  /**
   * Text Tracks currently supported.
   */
  this.textTrackType = null;
  
   
    /*====================================================================================
    *    For media applications, override/provide any event listeners on the MediaManager. 
    *===================================================================================*/

    /**
     * The original metadata error callback.
     * @private {?function(!cast.receiver.MediaManager.LoadInfo)}
     */
    this.onLoadOrig = this.mediaManager.onLoad.bind(this.mediaManager);
    this.mediaManager.onLoad = this.onLoad.bind(this);

  /**
   * The original metadataLoaded callback
   * @private {?function(!cast.receiver.MediaManager.LoadInfo)}
   */
   this.onMetadataLoadedOrig = this.mediaManager.onMetadataLoaded.bind(this.mediaManager);
   this.mediaManager.onMetadataLoaded = this.onMetadataLoaded.bind(this);
}


// ========================================================================================================================================
// ========================================================================================================================================

/**
 * set app config.
 */
Dash.Player.prototype.set_appConfig = function() 
{
    this.appConfig.statusText = 'Ready to play';

    // 100 minutes for testing, use default 10sec in prod by not setting this value
    console.log("set maxInactivity to 100 Mns for testing!");
    this.appConfig.maxInactivity = 6000;
    
}

/**
 * Called when we receive a LOAD message. Calls load().
 */
Dash.Player.prototype.onLoad = function(event) 
{
    console.log('onLoad');

    if (this.player !== null) {
        this.player.unload();    // Must unload before starting again.
        this.player = null;
    }

    if (event.data['media'] && event.data['media']['contentId']) {
        console.log('Starting media application');
        var url = event.data['media']['contentId'];

        window.host = new cast.player.api.Host({'mediaElement':this.mediaElement, 'url':url,useRelativeCueTimestamps: false});

        /*
         *If your server requires CORS and cookie information in order to access the media, set the property withCredentials to true and set the header information as needed.
         *
        window.host.updateSegmentRequestInfo = function(requestInfo) {
            // example of setting CORS withCredentials
            requestInfo.withCredentials = true;
            // example of setting headers
            requestInfo.headers = {};
            requestInfo.headers['content-type'] = 'text/xml;charset=utf-8';
          };
        */

        var ext = url.substring(url.lastIndexOf('.'), url.length);
        var initStart = event.data['media']['currentTime'] || 0;
        var autoplay = event.data['autoplay'] || true;
        this.mediaElement.autoplay = autoplay;  // Make sure autoplay get's set

        if (url.lastIndexOf('.m3u8') >= 0) {
            this.protocol = cast.player.api.CreateHlsStreamingProtocol(host);
        } else if (url.lastIndexOf('.mpd') >= 0) {
            this.protocol = cast.player.api.CreateDashStreamingProtocol(host);
        } else if (url.indexOf('.ismc') >= 0) {
            this.protocol = cast.player.api.CreateSmoothStreamingProtocol(host);
        }

        host.onError = function(errorCode) {
            console.log("Fatal Error - " + errorCode);
            if (this.player) {
                this.player.unload();
                this.player = null;
            }
        };

        console.log("we have protocol " + ext);
        if (this.protocol !== null) {
            console.log("Starting Media Player Library");
            this.player = new cast.player.api.Player(host);
            this.player.load(this.protocol, initStart);

        }
        else {
            this.onLoadOrig(event);
        }
    }
};
  
/**
 * Called when metadata is loaded
 * @private
 */
Dash.Player.prototype.onMetadataLoaded = function(info) 
{
  console.log('onMetadataLoaded');

  this.readSideLoadedTextTrackType(info);

  var streamCount = this.protocol.getStreamCount();

  var streamInfo;
  for (var i = 0; i < streamCount; i++) {
      streamInfo = this.protocol.getStreamInfo(i);
      this.protocol.enableStream(i, true);
  }

  this.player.enableCaptions(true);            
  
  /*
   * for debugging
   */
  var bufferDuration = this.player.getMaxBufferDuration();

};
  


/**
 * 
 */
Dash.Player.prototype.readSideLoadedTextTrackType =
function(info) 
{
    if (!info.message || !info.message.media || !info.message.media.tracks) 
    {
        return;
    }

    for (var i = 0; i < info.message.media.tracks.length; i++) 
    {
        var oldTextTrackType = this.textTrackType_;
        if (info.message.media.tracks[i].type != cast.receiver.media.TrackType.TEXT) 
        {
            continue;
        }

        var trackContentId = info.message.media.tracks[i].trackContentId;
        var trackContentType = info.message.media.tracks[i].trackContentType;
        
        if ((trackContentId && this.getExtension(trackContentId) == 'vtt') | (trackContentType && trackContentType.indexOf('text/vtt') === 0)) 
        {
            console.log("found vtt");
            this.textTrackType = 'vtt';
        }
        else 
        {
            console.log("unsupported text track");
        }
    }
};

/**
 */
Dash.Player.getExtension = function(url) {
    var parts = url.split('.');
    // Handle files with no extensions and hidden files with no extension
    if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
      return '';
    }
    return parts.pop().toLowerCase();
  };
  
  
/**
 */
Dash.Player.prototype.onLoadSuccess = function() {
    console.log("onLoadSuccess")
};
    
/**
 * Starts the player.
 */
Dash.Player.prototype.start = function() {

    this.set_appConfig();

    this.receiverManager.start(this.appConfig);

};
