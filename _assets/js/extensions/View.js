define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'util'
], function($, _, Backbone, Modernizr){

  var View = Backbone.View.extend({

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
        view.$el.one(whichTransitionEvent(), function(){
          view.transitionInCallback();
        });
      };

      _.delay(transitionIn, 20);
    },

    transitionInCallback: function(){},

    transitionOut: function(callback) {
      var view = this;
      view.$el.removeClass('is-visible');
      view.$el.one(whichTransitionEvent(), function(){
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

  return View;
});