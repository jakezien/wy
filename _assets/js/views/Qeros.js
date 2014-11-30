define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view',
  'vendor/chroma.min'
], function($, _, Backbone, Modernizr, View, chroma){

  var Qeros = View.extend({
    
    page: 'qeros',
    
    beforeAppend: function() {
      if (Modernizr.video && Detectizr.device.model !== "iphone") {
        this.$el.find('.no-video').remove();
      } else {
        this.$el.find('video').remove();
      }
      $('body').on('touchend', function(){
        $('video').play();
      });
      this.$el.find('div[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
      this.scrollNaggerEnabled = true;
      this.createTimelines();
    },


    createTimelines: function() {

      var createTopTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('.bg .frame-img'), 5, {opacity:0});
        tl.to(this.$el.find('.bg .frame-img div'), 5, {y:'-5%'}, 0);
        tl.to(this.$el.find('.bg .frame-img div'), 5, {});
        // tl.to(this.$el.find('#intro .text'), 3.5, {color:'#F22E60'}, 1.5);
        // tl.to(this.$el.find('#intro .keyline'), 5, {backgroundColor:'#F22E60'}, 0);
        return tl;
      }.bind(this);

      var createIntroTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to( this.$el.find('#intro .move-h div'), 10, {x:'-10%', ease:Sine.easeIn} );
        tl.to( this.$el.find('#intro .move-v div'), 10, {y:'-10%'}, 0 );
        tl.from( this.$el.find('#intro .move-h div, #intro .move-v div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);


     var createSkywalkTL = function() {
        var tl = new TimelineLite({paused: true});
        
        tl.call(function(){
          var video = $('.bg .offering video')[0];
          if (video) {
            this.preloadVideo(video);
          }
        }.bind(this));
        
        tl.to( this.$el.find('#skywalk .move-h div'), 10, {x:'-10%', ease:Sine.easeIn} );
        tl.to( this.$el.find('#skywalk .move-v div'), 10, {y:'-30%'}, 0 );
        tl.from( this.$el.find('#skywalk .move-h div, #skywalk .move-v div'), 1, {opacity:0}, 1 );
        
        return tl;
      }.bind(this);


      var createOfferingTL = function() {
        var tl = new TimelineLite({paused: true});

        tl.to( this.$el.find('#offering .move-h div'), 10, {x:'-10%', ease:Sine.easeIn}, 0);
        tl.to( this.$el.find('#offering .move-v div'), 10, {y:'-30%'}, 0 );
        tl.from( this.$el.find('#offering .move-h div, #offering .move-v div'), 1, {opacity:0}, 1 );
        
        tl.to(this.$el.find('.bg .offering'), 2.5, {opacity:1}, 1.5);
        tl.to(this.$el.find('#offering .big-text div'), 10, {y:'180%', ease:Sine.easeOut}, 0);
        tl.fromTo(this.$el.find('#offering .big-text p'), 1.5, {color:'#F22E60'}, {color:'#fafaff'}, 2);

        return tl;
      }.bind(this);

     var createAyniTL = function() {
        var tl = new TimelineLite({paused: true});

        tl.to( this.$el.find('#ayni .move-h div'), 10, {x:'-10%', ease:Sine.easeIn}, 0);
        tl.to( this.$el.find('#ayni .move-v div'), 10, {y:'-30%'}, 0 );

        tl.to(this.$el.find('.bg .offering'), 2.5, {opacity:0}, 0);
        return tl;
      }.bind(this);

     var createLoveTL = function() {
        var tl = new TimelineLite({paused: true});

        tl.call(function(){
          var video = $('.bg .where video')[0];
          if (video) {
            this.preloadVideo(video);
          }
        }.bind(this));

        tl.to( this.$el.find('#love .move-h div'), 10, {x:'-10%', ease:Sine.easeIn}, 0);
        tl.to( this.$el.find('#love .move-v div'), 10, {y:'-30%'}, 0 );
        tl.from( this.$el.find('#love .move-h div, #love .move-v div'), 1, {opacity:0}, 1 );
        
        return tl;
      }.bind(this);

      var createWhereTL = function() {
        var tl = new TimelineLite({paused: true});

        tl.to( this.$el.find('#where .move-h div'), 10, {x:'-10%', ease:Sine.easeIn}, 0);
        tl.to( this.$el.find('#where .move-v div'), 10, {y:'-30%'}, 0 );
        tl.from( this.$el.find('#where .move-h div, #where .move-v div'), 1, {opacity:0}, 1 );
        
        tl.to(this.$el.find('.bg .where'), 2.5, {opacity:1}, 1.5);
        tl.to(this.$el.find('#where .big-text div'), 10, {y:'110%', ease:Sine.easeOut}, 0);
        tl.fromTo(this.$el.find('#where .big-text p, #where .big-text h2'), 1.5, {color:'#F22E60'}, {color:'#fafaff'}, 2);
        
        return tl;
      }.bind(this);

      var createTravelTL = function() {
        var tl = new TimelineLite({paused: true});

        tl.to(this.$el.find('.bg .where'), 2.5, {opacity:0}, 0);

        tl.to( this.$el.find('#travel .move-h div'), 10, {x:'-10%', ease:Sine.easeIn}, 0);
        tl.to( this.$el.find('#travel .move-v div'), 6, {y:'-15%'}, 3 );
        tl.from( this.$el.find('#travel .move-h div, #travel .move-v div'), 1, {opacity:0}, 1 );

        return tl;
      }.bind(this);

      var createLlamasTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to( this.$el.find('#llamas .move-h div'), 10, {x:'-10%', ease:Sine.easeIn} );
        tl.to( this.$el.find('#llamas .move-v div'), 10, {y:'-10%'}, 0 );
        tl.from( this.$el.find('#llamas .move-h div, #llamas .move-v div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);

      var createEndTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to( this.$el.find('#end .move-h div'), 10, {x:'-10%', ease:Sine.easeIn} );
        tl.to( this.$el.find('#end .move-v div'), 10, {y:'-10%'}, 0 );
        tl.from( this.$el.find('#end .move-h div, #end .move-v div'), 1, {opacity:0}, 1 );
        return tl;
      }.bind(this);

      var createCtaTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.from( this.$el.find('#cta .wrapper'), 4, {x:'-33%', opacity:0, ease:Sine.easeOut}, 1 );
        tl.from( this.$el.find('#cta .wrapper'), 5, {} );
        return tl;
      }.bind(this);

      this.timelines['top'] = createTopTL();
      this.timelines['intro'] = createIntroTL();
      this.timelines['skywalk'] = createSkywalkTL();
      this.timelines['offering'] = createOfferingTL();
      this.timelines['ayni'] = createAyniTL();
      this.timelines['love'] = createLoveTL();
      this.timelines['where'] = createWhereTL();
      this.timelines['travel'] = createTravelTL();
      this.timelines['llamas'] = createLlamasTL();
      this.timelines['end'] = createEndTL();
      this.timelines['cta'] = createCtaTL();
    },


    render: function(currentScrollY){
      this.seekTimelines(currentScrollY);
    }
  });

  return Qeros;
});