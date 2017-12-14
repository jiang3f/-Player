/* name space */
var Rubiks = Rubiks || {};

Rubiks.Player = function(element) {

  this.element_ = element;
  
}

/**
 * Starts the player.
 *
 * @export
 */
Rubiks.Player.prototype.start = function() {

    mediaElement = this.element_.querySelector('video');

    mediaManager_ = new window.cast.receiver.MediaManager(mediaElement_);

    const castReceiverManager = window.cast.receiver.CastReceiverManager.getInstance();

    castReceiverManager.onReady = (event) => {
      const deviceCapabilities = window.cast.receiver.CastReceiverManager.getInstance().getDeviceCapabilities();
      if (deviceCapabilities && deviceCapabilities['is_hdr_supported']) {
        console.log(deviceCapabilities['is_hdr_supported']);
        // hdr supported
      }
      if (deviceCapabilities && deviceCapabilities['is_dv_supported']) {
        console.log(deviceCapabilities['is_dv_supported']);
        // dv supported
      }
    };    
    
    castReceiverManager.start();
};
