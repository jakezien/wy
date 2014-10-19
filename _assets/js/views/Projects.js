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
      if(window.stop !== undefined)
      {
           window.stop();
           console.log('stopped!')
      }
      else if(document.execCommand !== undefined)
      {
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

          if ($bgEl.hasClass('schools')) {
            tl.call(function(){ 
              $('.bg-gradient').css({opacity:0});
            });
          }

          tl.to($bgEl, 5, {opacity:1});
          
          if ($bgEl.hasClass('schools')) {
            tl.to($('.bg-gradient'), 5, {opacity:1}, '-=5');
            tl.call(function(){ 
              $('.bg-gradient').css({opacity:1});
            });
          }

          tl.call(function(){
            // $('.bg-cover').css({opacity:0});
            if (video.readyState > 3) {
              video.play();
              console.log('play');
            } else {
              $(video).one('canplay canplaythrough', function(){
                console.log('PLAY THRU')
                this.play();
              });
              console.log('readyState: ' + video.readyState)
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

      this.$el.find('section').not('#top, .cta').each(createTL);
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
      this.lastKnownScrollY = this.latestKnownScrollY;
      this.latestKnownScrollY = currentScrollY;
      if (this.snapScrollTimeout) {
        clearTimeout(this.snapScrollTimeout);
      }
      if (Detectizr.device.type !== 'mobile') {
        this.snapScrollTimeout = setTimeout(this.snapScroll, 100);
      }
    },

    snapScroll: function(){
      var $window = $(window);
      var windowHeight = $window.innerHeight();
      var sections = this.$el.find('section').not('.cta');

      var endSnap = function($el){
        _.delay(function(){
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
            tl.to(window, 1, {scrollTo:{y: 0}, ease:Back.easeOut});
          } else {
            tl.to(window, 1, {scrollTo:{y: elTop}, ease:Back.easeOut});
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