(function() {

  var WY = { 
    Views: {},
    Extensions: {},
    appRouter: null,
    appInstance: null,

    init: function() {
      this.appRouter = new WY.Extensions.Router();
      this.appInstance = new WY.Views.AppView();

      Backbone.history.start({pushState: true, root: '/'});

      if (Backbone.history.location.href.indexOf('#donate') > -1) {
        _.delay(function(){
          this.appInstance.showDonate();
        }.bind(this), 1250);
      }
      
      $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
        var href = { 
          prop: $(this).prop("href"), 
          attr: $(this).attr("href") 
        };
        var root = location.protocol + "//" + location.host + '/';

        if (href.prop.slice(0, root.length) === root) {
          evt.preventDefault();
          Backbone.history.navigate(href.attr, true);
        }
      });



      Modernizr.load([ {
        test: Modernizr.raf,
        nope: ['/assets/js/polyfill-requestAnimationFrame.js'] 
      } ]);
    }
  };

  $(function() {
    WY.init(); // Kick off the party
  });


  // Model
  // ———————————————————————————————————————————

  WY.PageModel = Backbone.Model.extend({
    defaults: {template: null, rawHTML: null},

    initialize: function() {
      _.bindAll(this, 'onRequestSuccess', 'onRequestError');
    },

    getUrl: function(page) {
      return window.location.host + '/' + page;
    },

    fetchHTML: function(page){
      console.log('fetch: ' + page);
      this.promise = $.ajax({
        url: '/' + page,
        type: 'GET',
      })
      .done(this.onRequestSuccess)
      .fail(this.onRequestError)
      .always(function(){console.log('FUCK')});
      console.log(this.promise)
    }, 
    
    onRequestSuccess: function(data){
      console.log('success');

      var $dataDiv = $('<div />').html(data);
      var $page = $dataDiv.find('#content .page');
      var title = $dataDiv.find('title').text();

      this.set('rawHTML', data);
      this.set('template', $page);
      this.set('title', title);
      
      console.log('success: ' + title);
    },
    
    onRequestError: function(data){
      console.log('error');
      var $dataDiv = $('<div />').html(data);
      $dataDiv.addClass('page');
      this.set('rawHTML', data);
      this.set('template', $dataDiv);
      this.set('title', '404');
      console.log('fail');
    }
  });



  // Extensions 
  // ———————————————————————————————————————————

  WY.Extensions.Router = Backbone.Router.extend({

    initialize: function() {
      this.last = null;
      _.bindAll(this, 'storeRoute', 'previous');
      this.on('all', this.storeRoute);
    },

    routes: {
      'qeros(/)': 'qeros',
      'qeros-old(/)': 'qerosOld',
      'projects(/)': 'projects',
      'schools(/)': 'schools',
      'expeditions(/)': 'expeditions',
      'about(/)': 'about',
      // 'donate(/)': 'donate',
      'blog/*id': 'blog',
      'blog(/)': 'blog',
      'shop/*id': 'shop',
      'shop(/)': 'shop',
      '': 'home',
      // '*default': 'blog'
    },

    storeRoute: function(){
      this.last = Backbone.history.fragment;
      console.log('store ' + this.last)
    },

    previous: function() {
      if (this.last) {
        this.navigate(this.last);
      }
    },

    home: function() {
      var view = new WY.Views.Home({page:'home', url:'index.html'});
      WY.appInstance.goto(view);
    },

    qeros: function() {
      var view = new WY.Views.Qeros({page:'qeros'});
      WY.appInstance.goto(view);
    },

    qerosOld: function() {
      var view = new WY.Views.QerosOld({page:'qeros-old'});
      WY.appInstance.goto(view);
    },

    projects: function() {
      var view = new WY.Views.Projects({page:'projects'});
      WY.appInstance.goto(view);
    },

    blog: function(id) {
      var view;
      if (id) {
        view = new WY.Views.Blog({page:'post-page', url:'blog/' + id});
      } else {
        view = new WY.Views.Blog({page:'blog'});
      }
      WY.appInstance.goto(view);
    },

    shop: function(id) {
      var view;
      if (id) {
        view = new WY.Views.Blog({page:'item-page', url:id});
      } else {
        view = new WY.Views.Blog({page:'shop'});
      }
      WY.appInstance.goto(view);
    },

    schools: function() {
      var view = new WY.Views.Schools({page:'schools'});
      WY.appInstance.goto(view);
    },

    expeditions: function() {
      var view = new WY.Views.Expeditions({page:'expeditions'});
      WY.appInstance.goto(view);
    },

    about: function() {
      var view = new WY.Views.About({page:'about'});
      WY.appInstance.goto(view);
    },

    donate: function() {
      WY.appInstance.showDonate();
    }
  });


  WY.Extensions.View = Backbone.View.extend({

    initialize: function(options) {
      if (options.page) {
        this.page = options.page;
      }
      if (options.url) {
        this.url = options.url;
      }
    },

    buildEl: function(model){
      this.$el = model.get('template');
      this.$el.addClass(this.page);
      this.beforeAppend();
    },

    beforeAppend: function() {},

    willTransitionOut: function() {},

    render: function(options) {
      options = options || {};
      return this;
    },

    transitionIn: function() {
      var view = this, delay;
      var transitionIn = function() {
        view.render(window.scrollY);        
        view.$el.addClass('is-visible');
        view.$el.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
          view.transitionInCallback();
        });
      };

      _.delay(transitionIn, 20);
    },

    transitionInCallback: function(){},

    transitionOut: function(callback) {
      var view = this;
      view.$el.removeClass('is-visible');
      view.$el.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
        if (_.isFunction(callback)) {
          callback();
        }
        view.transitionOutCallback();
      });
    },

    transitionOutCallback: function(){},

    timelines: {},

    seekTimelines: function(currentScrollY){
      var windowHeight = window.innerHeight;
      if (!windowHeight) {
        windowHeight = document.documentElement.clientHeight;
      }

      for (var i in this.timelines) {
        var timeline = this.timelines[i];
        var $el = $('#' + i);
        if (!$el[0]) return;

        var elTop = $el.offset().top;
        var elHeight = $el.outerHeight();
        var range = Math.max( 0, (currentScrollY - Math.max(0, elTop - windowHeight)) / (Math.min(windowHeight, elTop) + elHeight) );
        timeline.seek(range * timeline.totalDuration(), false);
      }
    },

    preloadImg: function(el) {
      var $el;
      if (el.jquery) {
        $el = el;
      } else {
        $el = $(el);
      }

      var isImg = $el.is('img');
      var src = $el.data('src');

      if (this.hiDpi && Detectizr.device.type !== 'mobile') {
        src = src.replace('.', '@2x.');
      }

      $el.addClass('loading');
      
      if (isImg) {
        $el.load(this.onImgLoad.bind(this));
        $el.attr('src', src);
      } else {
        var tmpImg = new Image();
        $(tmpImg).load({$el:$el}, this.onImgLoad.bind(this));
        tmpImg.src = src;
        $('#backstage').append(tmpImg)
      }
    },

    preloadVideo: function(el) {
      var $el;
      if (el.jquery) {
        $el = el;
      } else {
        $el = $(el);
      }

      if ($el.children().length > 0) return;
      console.log(el)
      var src = $el.data('src');
      $el.append('<source src="' + src + '.mp4" type="video/mp4" >');
      $el[0].play();
      // _.delay(function(){
      //   $el[0].pause();
      // });
    },

    onImgLoad: function(e) {
      if (!e.target.complete || typeof e.target.naturalWidth == "undefined" || e.target.naturalWidth == 0) {
        // handle error  
      } 
      if (e.data && e.data.$el) {
        e.data.$el.css('background-image', 'url(' + e.target.src + ')');
        e.data.$el.removeClass('loading');
        this.onImgLoadCallback(e.data.$el);
      } else {
        $(e.target).removeClass('loading');
        this.onImgLoadCallback($(e.target)); 
      }
    },

    onImgLoadCallback: function($el) {},

    onResizeDebounced: function() {}
  });



  // Views
  // ———————————————————————————————————————————

  WY.Views.AppView = WY.Extensions.View.extend({
    el: 'body',
    initialize: function(){
       _.bindAll(this, 'render', 'onScroll', 'onResize', 'hideDonate');

      this.menu = new WY.Views.Menu({el: $('#site-nav')});
      this.donate = new WY.Views.Donate({
        el: $('#donate'), 
        donateBtn:$('.donate-btn a')
      });

      this.$contentEl = $(this.$el.children('#content'));

      this.latestKnownScrollY = 0;
      this.ticking = false;
      this.scrollEffects = true;
      this.firstLoad = true;

      this.hiDpi = Modernizr.hidpi;

      window.addEventListener('scroll', this.onScroll, false);
      window.addEventListener('resize', this.onResize, false);

      this.menu.on('nav-clicked', function(){
        if (this.donate.isShowing && !$('.donate-btn a').hasClass('active')) {
          this.hideDonate();
        }
      }.bind(this));
    },

    createTimelines: function() {},

    render: function(){
      this.ticking = false;
      var currentScrollY = this.latestKnownScrollY;
      // tell subviews to render
      this.menu.render(currentScrollY);
      this.currentPageView.render(currentScrollY);
    },

    goto: function(view){
      if (this.isTransitioning) {
        console.log('nope')
        // return;
      }

      this.isTransitioning = true;

      if (this.firstLoad) {
        this.firstLoad = false;
        view.$el = $('#content .page');
        view.hiDpi = this.hiDpi;
        view.beforeAppend();
        view.$el.addClass(view.page);
        this.currentPageView = view;
        this.currentPageView.transitionIn();
        window.scrollTo(0, 0);
        this.isTransitioning = false;
        return;
      }

      var previousView = this.currentPageView || null;
      var nextView = view;

      previousView.willTransitionOut();

      this.currentPageModel = new WY.PageModel();
      if (nextView.url) {
        console.log(nextView.url);
        this.currentPageModel.fetchHTML(nextView.url);
      } else {
        this.currentPageModel.fetchHTML(nextView.page);
      }

      var finishGoto = function(){
        console.log('finishGoto');
        WY.appInstance.transitionInNextView(nextView);
      };

      if (previousView) {
        previousView.transitionOut(function() {
          previousView.remove();
          this.currentPageModel.promise.always(function(){finishGoto();});
          // WY.appInstance.currentPageModel.promise.always(finishGoto);
        }.bind(this));
      } else {
        this.currentPageModel.promise.always(finishGoto);
      }
    },

    transitionInNextView: function(nextView) {
      console.log('transitionIn')
      this.currentPageView = nextView;
      nextView.hiDpi = this.hiDpi;
      nextView.buildEl(this.currentPageModel);
      this.$contentEl.append(nextView.$el);
      window.scrollTo(0, 0);
      document.title = this.currentPageModel.get('title');
      nextView.transitionIn();
      this.isTransitioning = false;
    },

    onResize: _.debounce(function(e) {
      this.currentPageView.onResizeDebounced();
    }, 100),
    
    onScroll: function(){
      this.latestKnownScrollY = window.scrollY;
      if (this.scrollEffects) {
        this.requestTick();
      }
    },

    showDonate: function(){
      this.donate.show();
    },

    hideDonate: function(){
      this.donate.hide();
    },

    requestTick: function() {
      if (!this.ticking) {
        requestAnimationFrame(this.render);
      }
      this.ticking = true;
    }
  });

  WY.Views.Home = WY.Extensions.View.extend({
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

  WY.Views.QerosOld = WY.Extensions.View.extend({
    initialize: function(){
      this.render(0);
    },
    page: 'qeros-old',
    render: function(currentScrollY){
      var pageHeight = $('#content').innerHeight();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, currentScrollY);

      $('.multiply .container').css('transform', 'translateY(' + -.95 * currentScrollY + 'px)');

      $('.page section').each(function(i,el){
        var $el = $(el);
        var $bgEl = $($('.bg-imgs div')[i]);
        var elTop = $el.offset().top;
        var elHeight = $el.outerHeight();
        var viewBottom = st + windowHeight;
        
        var rangeMin = elTop + elHeight * .1;
        var rangeMax = elTop + elHeight * 0.66;

        var opacityRatio = (viewBottom - rangeMin) / (rangeMax - rangeMin);
        var transformRatio = (viewBottom - rangeMin) / (rangeMax + elHeight/2 - rangeMin);
        if (opacityRatio > 5) {
          $bgEl.css('opacity', 0);
        } else {
          opacityRatio = Math.max(0, Math.min(opacityRatio, 1));
          $bgEl.css({ 
                      opacity: opacityRatio, 
                      transform: 'translateY(-' + Math.min(2, transformRatio) * 5 + 'vh)'
                    });
        }
      });
    }
  });

  WY.Views.Qeros = WY.Extensions.View.extend({
    
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
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
    },

    render: function(currentScrollY){
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
    }
  });

  WY.Views.Projects = WY.Extensions.View.extend({
    page: 'projects',
    initialize: function(options) {
      if (options.page) {
        this.page = options.page;
      }
      if (options.url) {
        this.url = options.url;
      }
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

  WY.Views.Schools = WY.Extensions.View.extend({
    page: 'schools',
    beforeAppend: function() {
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
    },
    onImgLoadCallback: function($el) {
      console.log('loaded')
    }
  });

  WY.Views.Expeditions = WY.Extensions.View.extend({
    page: 'expeditions',
    initialize: function(){
      this.constructor.__super__.initialize.apply(this, arguments);
      _.bindAll(this, 'createTimelines');
    },

    beforeAppend: function(){
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
      this.createTimelines();
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
      console.log('expeditions create tl')
    },

    onImgLoadCallback: function($el) {
      console.log($el)
    }
  });

  WY.Views.About = WY.Extensions.View.extend({
    page: 'about',
    beforeAppend: function(){
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
    }
  });

  WY.Views.Blog = WY.Extensions.View.extend({
    page: 'blog'
  });

  WY.Views.Shop = WY.Extensions.View.extend({
    page: 'shop',
    beforeAppend: function(){
      // WY.appInstance.menu.transparent();
    }
  });

  WY.Views.Menu = Backbone.View.extend({

    isShowing: false,
    events: {
      'click #menu-btn': 'toggleMenu',
      'click li': 'navClicked'
    },
    initialize: function(){
      _.bindAll(this, 'show', 'hide', 'toggleMenu', 'navClicked');
      this.lastScrollTop = 0;
    },
    render : function(currentScrollY){
      if (!WY.appInstance.currentPageView || WY.appInstance.currentPageView.isSnapping) return;

      var pageHeight = $('#content').innerHeight();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, currentScrollY);

      if (st <= 50 || st + windowHeight >= pageHeight - 100) {
        // always show at top and bottom
        this.scrollShow();
        return;
      }

      if (Math.abs(st - this.lastScrollTop) < 20) return;
      if (st > this.lastScrollTop){
        this.scrollHide();
      } else {
        this.scrollShow();
      }
      this.lastScrollTop = st;
    },
    show: function(){
      $(this.el).addClass('show');
      $('body').addClass('menu-show');
      this.isShowing = true;
    },
    hide: function(){
      $(this.el).removeClass('show');
      $('body').removeClass('menu-show');
      this.isShowing = false;
    },
    scrollHide: function(){
      $(this.el).addClass('scroll-hide');
    },
    scrollShow: function(){
      $(this.el).removeClass('scroll-hide');
    },
    transparent: function(){
      $(this.el).addClass('transparent');
    },
    opaque: function(){
      $(this.el).removeClass('transparent');
    },
    toggleMenu: function(){
      if (this.isShowing) {
        this.hide();
      } else {
        this.show();
      }
    },
    navClicked: function(e){
      this.$el.find('a').removeClass('active');
      $(e.target).addClass('active');
      if (this.isShowing) {
        this.hide();
      }
      this.trigger('nav-clicked');
    }
  });

  WY.Views.Donate = Backbone.View.extend({
    isShowing: false,

    initialize: function(opts){
      this.$el.find('h1').click(function(){
        WY.appRouter.previous();
        this.hide();
      }.bind(this));

      _.bindAll(this, 'show', 'hide');

      if (opts.donateBtn) {
        this.donateBtn = opts.donateBtn;
        this.donateBtn.click(this.show);
      }

      $('#donate .half-r').bind('mousewheel', function(e){
        var scrollTo = -1 * e.originalEvent.wheelDelta + $('#donate .half-l').scrollTop();
        $("#donate .half-l").scrollTop(scrollTo);
      });

      $('#donate .trigger').click(function(){
        $('#donate form')[0].submit();
      });

      $('#donate .hide-btn').click(this.hide);
    },

    show: function(){
      if (this.isTransitioning)
        return;

      this.isShowing = true;
      this.$el.addClass('block');
      this.donateBtn.addClass('active');
      _.delay(function(){
        this.$el.addClass('show');
        $('body').addClass('donate-show');
      }.bind(this));
    },

    hide: function(){
      this.isTransitioning = true;
      this.$el.removeClass('show');
      $('body').removeClass('donate-show');
      this.donateBtn.removeClass('active');
      this.$el.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
        _.delay(function(){
          this.$el.removeClass('block');
          this.isShowing = false;
          this.isTransitioning = false;
        }.bind(this), 600)
      }.bind(this));
    }
  });

  WY.Views.ZoomImg = Backbone.View.extend({
    initialize: function () {
      _.bindAll(this, 'onMouseenter', 'onMouseleave', 'onMousemove');
      this.$imgEl = this.$el.children().first();
      // this.$el.hover(this.onMouseenter, this.onMouseleave);
      // this.$el.on('mousemove', this.onMousemove);
    },

    onMouseenter: function() {
      this.$el.addClass('zoom');
      this.lastTransform = this.$imgEl.css('transform');
      var transEvent = whichTransitionEvent();
      var afterDelay = function() {
        this.$el.removeClass('zoom');
        console.log('remove')
      }.bind(this);
      _.delay(afterDelay, 500);
    },

    onMousemove: function(e) {
      var elOffset = this.$el.offset();
      var x = e.pageX - elOffset.left;
      var y = e.pageY - elOffset.top;
      var w = this.$el.outerWidth();
      var h = this.$el.outerHeight();

      var xOffset = (1 - x/w) * 100 - 50;
      var yOffset = (1 - y/h) * 100 - 50;

      this.$imgEl.css({ transform: 'translateX(' + xOffset + '%) translateY(' + yOffset + '%) scale(1.66)' });
    },

    onMouseleave: function() {
      this.$el.addClass('zoom');
      this.$imgEl.css({transform: 'scale(1)'});
      var transEvent = whichTransitionEvent();
      this.$el.one(transEvent, function(){
          $(this).removeClass('zoom');
      });

    }
  });
}());