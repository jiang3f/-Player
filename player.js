/* name space */
var Rubiks = Rubiks || {};

Rubiks.Player = function(element) {

  cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
    
  this.element_ = element;

  // video element
  this.mediaElement_ = this.element_.querySelector('video');

  this.mediaManager_ = new window.cast.receiver.MediaManager(this.mediaElement_);
  
  // cast receier manager
  this.receiverManager_ = window.cast.receiver.CastReceiverManager.getInstance();
  
  // config
  this.appConfig_ = new cast.receiver.CastReceiverManager.Config();
  
}

/**
 * set app config.
 */
Rubiks.Player.prototype.set_appConfig = function() {
    this.appConfig_.statusText = 'Ready to play';
    this.appConfig_.maxInactivity = 6000;
    
}
    
/**
 * Starts the player.
 */
Rubiks.Player.prototype.start = function() {

    this.set_appConfig();

    this.receiverManager_.start(this.appConfig);
};
