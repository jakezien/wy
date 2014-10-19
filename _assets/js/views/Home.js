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
        var tl = new TimelineLite({paused:true});
        tl.to($('.bg video'), 5, {opacity:0});
        return tl;
      }

      this.timelines['top'] = createTopTL()
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
    },
  });

  return Home;
});