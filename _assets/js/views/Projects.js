define([
  'view',
], function(View){

  var Projects = View.extend({
    page: 'projects',
    initialize: function(options) {
      if (options.page) {
        this.page = options.page;
      }
      if (options.url) {
        this.url = options.url;
      }
      this.opts = options;
      _.bindAll(this, 'createTimelines', 'snapScroll');
      this.isScrolling = false;
      this.scrollNaggerEnabled = true;
      this.scrollNaggerDelay = 1000;
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

    willTransitionOut: function() {
      if(window.stop !== undefined) {
           window.stop();
      }
      else if(document.execCommand !== undefined) {
           document.execCommand("Stop", false);
      }
    },

    createTimelines: function() {
      this.timelines = {};
    
      var createTL = function(i, el) {
        var $el = $(el);
        var $bgEl = this.$el.find('.bg .bg-imgs .' + $el.attr('id'));
        var $textEl = $el.find('.text');
        var video = $bgEl.find('video')[0];
        var $bgGradient = this.$el.find('.bg .bg-gradient');
        var tl = new TimelineLite({paused:true});

        if (!video) {
          tl.to($bgEl, 5, {opacity:1});
          tl.to($textEl, 5, {opacity:1});
        } else {
          tl.call(function(){
            this.preloadVideo(video);
          }.bind(this));

          tl.call(function(){
            if (video.readyState > 1) {
              video.currentTime = 0;
              video.pause();
            }
            $(video).off();
          });

          tl.to($bgEl, 5, {opacity:1});
          
          if ($bgEl.hasClass('schools')) {
            tl.to($bgGradient, 5, {opacity:1}, '-=5');
          }

          tl.call(function(){
            // $('.bg-cover').css({opacity:0});
            if (video.readyState > 3) {
              video.play();
            } else {
              $(video).one('canplay canplaythrough', function(){
                this.play();
              });
            }
          });
          tl.to($textEl, 5, {opacity:0});
          tl.call(function(){
            if (video.readyState > 1) {
              video.pause();
              video.currentTime = 0;
            }
            $(video).off();
          });
          tl.call(function(){
            this.preloadVideo(video);
          }.bind(this));
        }

        this.timelines[$el.attr('id')] = tl;
      }.bind(this);

      var createCtaTl = function() {
        var tl = new TimelineLite({paused: true});
        tl.from( this.$el.find('#cta .wrapper'), 4, {x:'-33%', opacity:0, ease:Sine.easeOut}, 1 );
        tl.from( this.$el.find('#cta .wrapper'), 5, {} );
        return tl;
      }.bind(this);

      this.$el.find('section').not('#top, .cta').each(createTL);
      this.timelines['cta'] = createCtaTl();
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
      this.lastKnownScrollY = this.latestKnownScrollY;
      this.latestKnownScrollY = currentScrollY;
      if (this.snapScrollTimeout) {
        clearTimeout(this.snapScrollTimeout);
      }
      if (Detectizr.device.type !== 'mobile' && Detectizr.device.type !== 'tablet') {
        this.snapScrollTimeout = setTimeout(this.snapScroll, 100);
      }
    },

    snapScroll: function(){
      var $window = $(window);
      var windowHeight = $window.innerHeight();
      var sections = this.$el.find('section').not('.cta');

      var endSnap = function($el){
        _.delay(function(){
          $('body').removeClass('stop-scroll');
          this.isSnapping = false;
          this.opts.menu.watchScroll();
        }.bind(this), 500);
      }.bind(this);

      var checkSection = function(i, el){
        if (this.isSnapping) return;

        var $el = $(el);
        var rangeTop, rangeBottom;
        var offset = $el.offset();
        var elTop = offset.top;

        if (this.lastKnownScrollY === this.latestKnownScrollY) {}

        if (this.lastKnownScrollY < this.latestKnownScrollY) {
          rangeTop = elTop - windowHeight;
          rangeBottom = elTop;
        } else if (this.lastKnownScrollY > this.latestKnownScrollY) {
          rangeTop = elTop;
          rangeBottom = elTop + windowHeight;
        }

        // console.log('rangeTop: ' + rangeTop + '  scrollY: ' + this.latestKnownScrollY);
        if (rangeTop <= this.latestKnownScrollY && this.latestKnownScrollY < rangeBottom) {
          this.isSnapping = true;
          this.opts.menu.ignoreScroll();
          var tl = new TimelineLite();

          if (this.latestKnownScrollY <= 30) {
            console.log('yep')
            tl.to(window, 1, {scrollTo:{y: 0}, ease:Back.easeOut});
          } else {
            $('body').addClass('stop-scroll');
            tl.to(window, 1, {scrollTo:{y: elTop}, ease:Back.easeOut});
            var video = $('.bg .bg-imgs .' + $el.attr('id') + ' video')[0];
            if (video) {
              video.play();
            }
          }

          tl.call(endSnap, [$el]);
        } else {
          // console.log(rangeTop)
          // console.log(this.latestKnownScrollY)
          // console.log(rangeBottom)
          // console.log('\n')
        }
      }.bind(this);

      sections.each(checkSection);
    }
  });

  return Projects;
});