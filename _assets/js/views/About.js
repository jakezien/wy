define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view'
], function($, _, Backbone, Modernizr, View){
  var About = View.extend({
    page: 'about',
    beforeAppend: function(){
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
      this.createTimelines();
      // this.scrollNaggerEnabled = true;
    },

    createTimelines: function() {
      this.timelines = {};

      var createTopTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('.bg .frame-img'), 4, {opacity:0}, 0.5);
        tl.to(this.$el.find('.bg .frame-img div'), 4.5, {y:'-5%'}, 0);
        tl.fromTo(this.$el.find('#story .text'), 5, {color:'#FAFAFF'}, {color:'#533B3A'}, 0);
        tl.to(this.$el.find('#story .keyline'), 5, {backgroundColor:'#533B3A'}, 0);
        return tl;
      }.bind(this);

      this.timelines['top'] = createTopTL();
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
    },

  });

  return About;
});