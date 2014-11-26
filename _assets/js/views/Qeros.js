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
        this.$el.find('.video').next().addClass('post-video');
      } else {
        this.$el.find('.video').remove();
      }
      $('body').on('touchend', function(){
        $('video')[0].play();
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


     var createSkywalkTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.call(function(){
          this.preloadVideo($('.bg .offering video')[0]);
        }.bind(this));
        return tl;
      }.bind(this);


      var createOfferingTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('.bg .offering'), 5, {opacity:1});
        tl.fromTo(this.$el.find('#offering .cell p'), 2.5, {color:'#F22E60'}, {color:'#fafaff'}, 2.5);
        tl.to(this.$el.find('.bg .offering'), 5, {});
        return tl;
      }.bind(this);

     var createAyniTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.to(this.$el.find('.bg .offering'), 2.5, {opacity:0});
        tl.to(this.$el.find('.bg .offering'), 7.5, {});
        return tl;
      }.bind(this);

      var createCtaTL = function() {
        var tl = new TimelineLite({paused: true});
        tl.from( this.$el.find('#cta .wrapper'), 4, {x:'-33%', opacity:0, ease:Sine.easeOut}, 1 );
        tl.from( this.$el.find('#cta .wrapper'), 5, {} );
        return tl;
      }.bind(this);

      this.timelines['top'] = createTopTL();
      this.timelines['skywalk'] = createSkywalkTL();
      this.timelines['offering'] = createOfferingTL();
      this.timelines['ayni'] = createAyniTL();
      this.timelines['cta'] = createCtaTL();
    },


    render: function(currentScrollY){

      this.seekTimelines(currentScrollY);
/*
      var pageHeight = $('#content').innerHeight();
      var pageWidth = $('#content').innerWidth();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, currentScrollY);

      $('.multiply .container').css('transform', 'translateY(' + -.95 * currentScrollY + 'px)');

      $('.page section').each(function(i,el){
        var $el = $(el);
        var $imgEl = $el.find('.frame-img div, .bg .img, video');
        var $captionEl = $el.find('.caption');
        if (!$imgEl[0]) {
          return;
        }

        var elTop = $el.offset().top;
        var imgTop = $imgEl.offset().top;
        var elHeight = $el.outerHeight();
        var imgHeight = $imgEl.outerHeight();
        var viewBottom = st + windowHeight;

        var rangeMin = imgTop;
        var rangeMax = imgTop + imgHeight + windowHeight;

        var ratio = (viewBottom - rangeMin) / (rangeMax - rangeMin);

        // Hide the top section if it's not scrolled into view
        if ($el.attr('id') === 'top') {
          var topRatio = (viewBottom - windowHeight) / (windowHeight * 2);
          if (topRatio < -0.2 || topRatio > 1) {
            $el.css({opacity: 0});
          } else {
            $el.css({opacity: 1});
          }
          return;
        }

        if (ratio < -0.2 || ratio > 1) {
          return;
        }

        var opacityRatio = Math.max(0, Math.min(1, ratio * 3.5  -.3));
        
        if (pageWidth >= 768) {
          $captionEl.css({
            transform: 'translateY(' + ratio * 25 + '%)',  
          });
        }

        // $captionEl.children().css({
        //   opacity: Math.min(1, ratio * 3 - .5)
        // });


        if ($imgEl.parent().hasClass('move-h')) {
          $imgEl.css({transform: 'translateX(-' + ratio * 8 + '%)'});
          if (Detectizr.os.name === 'ios' && Detectizr.os.version.major < 8) {
            return;
          } else {
            $imgEl.css({opacity: opacityRatio});
          }
        } 
        if ($imgEl.parent().hasClass('move-v')) {
          $imgEl.css({transform: 'translateY(-' + ratio * 15 + '%)'});
          if (Detectizr.os.name === 'ios' && Detectizr.os.version.major < 8) {
            return;
          } else {
            $imgEl.css({opacity: opacityRatio});
          }
        }

        if (i === 1) {
          var $stringEl = $('.string');
          $stringEl.css({transform: 'translateY(' + ratio * 10 + '%)'});
        }

        if ($el.hasClass('video')) {
          rangeMin = elTop;
          rangeMax = elTop + imgHeight + windowHeight;
          transformRatio = (viewBottom - rangeMin) / (rangeMax - rangeMin);

          rangeMin = elTop + elHeight * 0.33;
          rangeMax = elTop + elHeight * 0.4;
          opacityRatio = (viewBottom - rangeMin) / (rangeMax - rangeMin);

          rangeMin = elTop - windowHeight;
          rangeMax = elTop + elHeight + windowHeight;
          captionRatio = (viewBottom - rangeMin) / (rangeMax - rangeMin);
          $captionEl.css({transform: 'translateY(' + Math.max(0, captionRatio) * 200 + '%)'});

          scale = chroma.scale(['F22E60', '#fff']).mode('lab');
          $captionEl.children('p').css({color: scale(opacityRatio).hex()});
          
          rangeMin = elTop + elHeight * 0.8;
          rangeMax = elTop + elHeight;
          opacityRatio2 = (viewBottom - rangeMin) / (rangeMax - rangeMin);

          $imgEl.css({
            transform: 'translateX(-50%) translateY(-' + transformRatio * 8 + '%)',
            opacity: opacityRatio2 > 0 ? (1 - opacityRatio2) : opacityRatio/2
          });
        }


      });
*/
    }
  });

  return Qeros;
});