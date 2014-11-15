define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view'
], function($, _, Backbone, Modernizr, View){

  var ScrollNagger = Backbone.View.extend({

    initialize: function(){
      _.bindAll(this, 'show', 'hide', 'render', 'startCountdown');
      this.isWatchingScroll = true;
      this.isTransitioning = false;
    },

    events: {
      'click': 'onClick'
    },

    onClick: function(){
      var tl = new TimelineLite();
      var $window = $(window);
      var scrollTop = $window.scrollTop() + $window.innerHeight() * 0.75;
      tl.to(window, 1, {scrollTo:scrollTop, ease:Sine.easeOut});
      this.hide();
    },

    startCountdown: function(duration){
      console.log(duration)
      this.showDelay = _.delay(this.show, duration ? duration : 3500);
    },

    stopCountdown: function(){
      clearTimeout(this.showDelay);
    },

    show: function() {
      var tl = new TimelineLite();
      this.isTransitioning = true;
      tl.to(this.$el, 0.66, {y: -200, ease:Back.easeOut});
      tl.call(function(){this.isTransitioning = false;}.bind(this));
    },

    hide: function() {
      var tl = new TimelineLite();
      this.isTransitioning = true;
      tl.to(this.$el, 0.5, {y: 0, ease:Sine.easeIn});
      tl.call(function(){this.isTransitioning = false;}.bind(this));
    }, 

    render: function(currentScrollY){
      if (!this.isWatchingScroll || this.isTransitioning) return;
      
      if (!this.lastScrollTop) {
        this.lastScrollTop = currentScrollY;
      }

      var pageHeight = $('#content').innerHeight();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, currentScrollY);

      if (st <= 30 )  {
        return;    // always show at top and bottom
      }

      if (Math.abs(st - this.lastScrollTop) < 20) return;
      
      if (st > this.lastScrollTop) {
        this.hide();
      } 
      this.stopCountdown();
      this.lastScrollTop = st;
    }

  });

  return ScrollNagger;

});