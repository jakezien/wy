define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view'
], function($, _, Backbone, Modernizr, View){

  var Expeditions = View.extend({
    page: 'expeditions',
    initialize: function(){
      this.constructor.__super__.initialize.apply(this, arguments);
      _.bindAll(this, 'createTimelines', 'triggerForm');
      this.scrollNaggerEnabled = true;
    },

    beforeAppend: function(){
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
      this.createTimelines();
      this.setupForm();
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
    },

    createTimelines: function() {
      this.timelines = {};
      var vh = 0.01 * $(window).innerHeight();
      var vw = 0.01 * $(window).innerWidth();

      var createTopTL = function() {
        var topTL = new TimelineLite({paused:true});
        // buildTL.to($('#bg-container'), 5, {left:'50%', ease:Power2.easeOut});
        topTL.to(this.$el.find('#top .bg .sky'), 5, {y:80 * vh, ease:Power0.easeOut}, 0);
        topTL.to(this.$el.find('#top .bg .mountains'), 5, {y:6 * vw, ease:Power2.easeOut}, 0);
        topTL.to(this.$el.find('#top .cell h1'), 5, {y:60 * vh, opacity:0, ease:Power0.easeIn}, 0);
        topTL.to(this.$el.find('#top .cell p'), 1.2, {y:15 * vh, opacity:0, ease:Power0.easeIn}, 0);
        // topTL.to({}, 12);
        return topTL;
      }.bind(this);

      this.timelines.top = createTopTL();
    },

    setupForm: function(){
      this.$el.find('#form .form-trigger').click(this.triggerForm);
    },

    triggerForm: function() {
      this.$el.find('#form .typeform-share').click();
    },

    onImgLoadCallback: function($el) {
    }
  });

  return Expeditions;
});