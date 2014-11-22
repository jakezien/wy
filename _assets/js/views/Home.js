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
      this.scrollNaggerEnabled = true;
      this.scrollNaggerDelay = 6000;
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
        var $video = this.$el.find('.bg video');
        if ($video[0]) {
          tl.call(function(){
            $video[0].play();
          }.bind(this));          
        }
        tl.to($video, 4, {opacity:0}, 0.5);
        tl.to(this.$el.find('.bg .no-video'), 4, {opacity:0}, 0.5);
        tl.to(this.$el.find('.bg .no-video div'), 4.5, {y:'-10%f'}, 0);
        tl.to(this.$el.find('#intro .text'), 3.5, {color:'#F22E60'}, 1.5);
        tl.to(this.$el.find('#intro .keyline'), 5, {backgroundColor:'#F22E60'}, 0);

        tl.call(function(){
          this.$el.find('.bg video')[0].play();
        }, null, this, 5);

        tl.call(function(){
          this.$el.find('.bg video')[0].pause();
        }, null, this, 5.1);
        

        return tl;
      }.bind(this);

      var createQerosTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-qeros .caption'), 5, {transform:'translateY(50vh)'}, Quint.easeInOut);
        tl.to(this.$el.find('#home-qeros .move-h div'), 5, {x:'-4%', ease:Sine.easeOut}, 0 );
        tl.to(this.$el.find('#home-qeros .move-v div'), 5, {y:'10%'}, 0 );
        tl.from(this.$el.find('#home-qeros .move-h div, .move-v div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);


      var createProjectsTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-projects .caption'), 5, {transform:'translateY(50vh)'}, Quint.easeInOut);
        tl.to(this.$el.find('#home-projects .move-h div'), 5, {x:'-4%', ease:Sine.easeOut}, 0 );
        tl.to(this.$el.find('#home-projects .move-v div'), 5, {y:'10%'}, 0 );
        tl.from(this.$el.find('#home-projects .move-h div, .move-v div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);

      var createSchoolsTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-schools .caption'), 5, {transform:'translateY(50vh)'}, Quint.easeInOut);
        tl.to(this.$el.find('#home-schools .move-h div'), 5, {x:'-4%', ease:Sine.easeOut}, 0 );
        tl.to(this.$el.find('#home-schools .move-v div'), 5, {y:'10%'}, 0 );
        tl.from(this.$el.find('#home-schools .move-h div, .move-v div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);

      var createAboutTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-about .caption'), 5, {transform:'translateY(50vh)'}, Quint.easeInOut);
        tl.to(this.$el.find('#home-about .move-h div'), 5, {x:'-4%', ease:Sine.easeOut}, 0 );
        tl.to(this.$el.find('#home-about .move-v div'), 5, {y:'10%'}, 0 );
        tl.from(this.$el.find('#home-about .move-h div, .move-v div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);

      var createShopTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-shop .caption'), 5, {transform:'translateY(50vh)'}, Quint.easeInOut);
        tl.fromTo(this.$el.find('#home-shop .frame-img'), 5, {rotation:5}, {rotation:-10}, Quad.easeInOut, 0);
        tl.from(this.$el.find('#home-shop .frame-img div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);

      var createDonateTL = function(i, el) {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('#home-donate .caption'), 5, {transform:'translateY(50vh)'}, Quint.easeInOut);
        tl.to(this.$el.find('#home-donate .move-h div'), 5, {x:'-4%', ease:Sine.easeOut}, 0 );
        tl.to(this.$el.find('#home-donate .move-v div'), 5, {y:'10%'}, 0 );
        tl.from(this.$el.find('#home-donate .move-h div, .move-v div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);


      this.timelines['top'] = createTopTL();
      
      if (Detectizr.device.type !== 'mobile') {
        this.timelines['home-qeros'] = createQerosTL();
        this.timelines['home-projects'] = createProjectsTL();
        this.timelines['home-schools'] = createSchoolsTL();
        this.timelines['home-about'] = createAboutTL();
        this.timelines['home-shop'] = createShopTL();
        this.timelines['home-donate'] = createDonateTL();
      }
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
    },
  });

  return Home;
});