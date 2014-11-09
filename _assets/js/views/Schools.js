define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view'
], function($, _, Backbone, Modernizr, View){

  var Schools = View.extend({
    page: 'schools',

    initialize: function(){
      _.bindAll(this, 'createTimelines');
      this.scrollNaggerEnabled = true;
    },

    beforeAppend: function() {
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
      this.createTimelines();
    },

    onImgLoadCallback: function($el) {
      console.log('loaded')
    },

    createTimelines: function() {
      this.timelines = {};
      var createTitleTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#edu-title h2'), 5, {y:'50vh', ease:Expo.easeOut});
        return tl;
      }.bind(this);

      var createCtaTl = function() {
        var tl = new TimelineLite({paused: true});
        tl.from( this.$el.find('#cta .wrapper'), 4, {x:'-33%', opacity:0, ease:Sine.easeOut}, 1 );
        tl.from( this.$el.find('#cta .wrapper'), 5, {} );
        return tl;
      }.bind(this);
      
      var createTL = function(i, el) {
        var $el = $(el);
        var tl = new TimelineLite({paused: true});
        tl.to( $el.find('.move-h div'), 5, {x:'-10%', ease:Sine.easeIn} );
        tl.to( $el.find('.move-v div'), 5, {y:'10%'}, 0 );
        tl.from( $el.find('.move-h div, .move-v div'), 1, {opacity:0}, 1 );

        this.timelines[$el.attr('id')] = tl;
      }.bind(this);

      if (Detectizr.device.type !== 'mobile') {
        // this.timelines['edu-title'] = createTitleTL();
        this.$el.find('section').not('#top, #cta').each(createTL)
        this.timelines['cta'] = createCtaTl();
      }
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
    },

  });

  return Schools;
});