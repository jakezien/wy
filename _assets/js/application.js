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
      
      $(document).on("click", "a[href]:not([data-bypass])", function(evt) {
        var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
        var root = location.protocol + "//" + location.host + '/';

        if (href.prop.slice(0, root.length) === root) {
          evt.preventDefault();
          Backbone.history.navigate(href.attr, true);
        }
      });
    }
  };

  $(function() {
    WY.init(); // Kick off the party
  });


  // Extensions 
  // ———————————————————————————————————————————

  WY.Extensions.View = Backbone.View.extend({

    initialize: function(options) {
      if (options.page) {
        this.className = this.page;
      }
    },

    buildEl: function(model){
      this.$el = model.get('template');
      this.beforeAppend();
    },

    beforeAppend: function() {},

    render: function(options) {
      options = options || {};
      return this;
    },

    transitionIn: function(callback) {
      var view = this, delay;
      var transitionIn = function() {
        view.$el.addClass('is-visible');
        view.$el.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
          if (_.isFunction(callback)) {
            callback();
          }
        });
      };

      _.delay(transitionIn, 20);
    },

    transitionOut: function(callback) {
      var view = this;
      view.$el.removeClass('is-visible');
      view.$el.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
        if (_.isFunction(callback)) {
          callback();
        }
      });
    },

    timelines: {},

    seekTimelines: function(currentScrollY){
      var windowHeight = window.innerHeight;
      if (!windowHeight) {
        windowHeight = document.documentElement.clientHeight;
      }

      for (var i in this.timelines) {
        var timeline = this.timelines[i];
        var $el = $('#' + i); 
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

  WY.Extensions.Router = Backbone.Router.extend({

    routes: {
      'qeros(/)': 'qeros',
      'qeros-old(/)': 'qerosOld',
      'projects(/)': 'projects',
      'schools(/)': 'schools',
      'expeditions(/)': 'expeditions',
      'about(/)': 'about',
      '': 'home'
    },

    home: function() {
      var view = new WY.Views.Home({page:'index'});
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
    }
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
      this.promise = $.ajax({
        url: '/' + page,
        type: 'GET',
        success: this.onRequestSuccess,
        error: this.onRequestError
      });
    }, 
    
    onRequestSuccess: function(data){
      var $dataDiv = $('<div />').html(data);
      var $page = $dataDiv.find('#content .page');
      var title = $dataDiv.find('title').text();

      this.set('rawHTML', data);
      this.set('template', $page);
      this.set('title', title);
    },
    
    onRequestError: function(data){
      var $dataDiv = $('<div />').html(data);
      $dataDiv.addClass('page');
      this.set('rawHTML', data);
      this.set('template', $dataDiv);
      this.set('title', '404');
      console.log('fail');
    }
  });


  // Views
  // ———————————————————————————————————————————

  WY.Views.AppView = WY.Extensions.View.extend({
    el: 'body',
    initialize: function(){
       _.bindAll(this, 'render', 'onScroll', 'onResize');

      this.menu = new WY.Views.Menu({el: $('#site-nav')});
      this.$contentEl = $(this.$el.children('#content'));

      this.latestKnownScrollY = 0;
      this.ticking = false;
      this.scrollEffects = true;
      this.firstLoad = true;

      this.hiDpi = Modernizr.hidpi;

      window.addEventListener('scroll', this.onScroll, false);
      window.addEventListener('resize', this.onResize, false);
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
      if (this.firstLoad) {
        this.firstLoad = false;
        view.$el = $('#content .page');
        view.hiDpi = this.hiDpi;
        view.beforeAppend();
        view.transitionIn();
        this.currentPageView = view;
        return;
      }

      var previousView = this.currentPageView || null;
      var nextView = view;

      this.currentPageModel = new WY.PageModel();
      this.currentPageModel.fetchHTML(nextView.page);

      var finishGoto = function(){
        WY.appInstance.transitionInNextView(nextView);
      };

      if (previousView) {
        previousView.transitionOut(function() {
          previousView.remove();
          WY.appInstance.currentPageModel.promise.then(finishGoto, finishGoto);
        });
      } else {
        this.currentPageModel.promise.then(finishGoto, finishGoto);
      }
    },

    transitionInNextView: function(nextView) {
      nextView.hiDpi = this.hiDpi;
      nextView.buildEl(this.currentPageModel);
      this.$contentEl.append(nextView.$el);
      window.scrollTo(0, 0);
      document.title = this.currentPageModel.get('title');
      nextView.transitionIn();
      this.currentPageView = nextView;
    },

    onScroll: function(){
      this.latestKnownScrollY = window.scrollY;
      if (this.scrollEffects) {
        this.requestTick();
      }
    },

    onResize: _.debounce(function(e) {
      this.currentPageView.onResizeDebounced();
    }, 100),

    requestTick: function() {
      if (!this.ticking) {
        requestAnimationFrame(this.render);
      }
      this.ticking = true;
    }
  });

  WY.Views.Home = WY.Extensions.View.extend({
    page: 'home'
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
      $('.frame-img').each(function(i, el){
        ZoomImg = new WY.Views.ZoomImg({ el: el });
      });
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
    initialize: function() {
      _.bindAll(this, 'createTimelines');
    },

    beforeAppend: function() {
      $('.photo').each(function(i, el){
        ZoomImg = new WY.Views.ZoomImg({ el: el });
      });
      this.createTimelines();
    },

    createTimelines: function() {
      var createTopTL = function(){

      }.bind(this);

      this.timelines.top = createTopTL();
    },

    render: function(currentScrollY) {
      this.seekTimelines(currentScrollY);
    }
  });

  WY.Views.Schools = WY.Extensions.View.extend({
    page: 'schools'
  });

  WY.Views.Expeditions = WY.Extensions.View.extend({
    page: 'expeditions',
    initialize: function(){
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

    onImgLoadCallback: function($el) {
      console.log($el)
    }
  });

  WY.Views.About = WY.Extensions.View.extend({
    page: 'about'
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
      var pageHeight = $('#content').innerHeight();
      var windowHeight = $(window).innerHeight();
      var st = Math.max(0, currentScrollY);
      if (st + windowHeight >= pageHeight - 100) {
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