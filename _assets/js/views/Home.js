define([
  'view',
  'detectizr',
], function(View, Detectizr){

  var Home = View.extend({
    page: 'home',
    initialize: function(options) {
      if (options.page) {
        this.page = options.page;
      }
      if (options.url) {
        this.url = options.url;
      }
      _.bindAll(this, 'createTimelines');
    },

    beforeAppend: function() {

      if (Modernizr.video && Detectizr.device.model !== "iphone" && Detectizr.device.model !== "ipad") {
        this.$el.find('.no-video').remove();
      } else {
        this.$el.find('video').remove();
      }

      this.$el.find('div[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));

      this.createTimelines();
    },

    createTimelines: function() {
      this.timelines = {};

      var createTopTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('.bg video'), 5, {opacity:0});
        tl.to(this.$el.find('#intro .text'), 5, {color:'#F22E60'}, '-=5');
        tl.to(this.$el.find('#intro .keyline'), 5, {backgroundColor:'#F22E60'}, '-=5');
        // tl.set(this.$el.find('.bg video'), {display: 'block'});
        tl.call(function(){
          this.$el.find('.bg video')[0].play();
        }.bind(this));
        // tl.set(this.$el.find('.bg video'), {display: 'none'});
        tl.call(function(){
          this.$el.find('.bg video')[0].pause();
        }.bind(this));
        

        return tl;
      }.bind(this);

      var createQerosTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-qeros .caption'), 5, {transform:'translateY(40vh)'}, Sine.easeInOut);
        return tl;
      }.bind(this);

      var createProjectsTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-projects .caption'), 5, {transform:'translateY(40vh)'}, Sine.easeInOut);
        return tl;
      }.bind(this);

      var createSchoolsTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-schools .caption'), 5, {transform:'translateY(40vh)'}, Sine.easeInOut);
        return tl;
      }.bind(this);


      this.timelines['top'] = createTopTL();
      this.timelines['home-qeros'] = createQerosTL();
      this.timelines['home-projects'] = createProjectsTL();
      this.timelines['home-schools'] = createSchoolsTL();
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
    },
  });

  return Home;
});