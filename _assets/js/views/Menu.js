define([
  'view'
], function(View){

  var Menu = Backbone.View.extend({

    isShowing: false,
    events: {
      'click #menu-btn': 'toggleMenu',
      'click li': 'navClicked',
      'click .logotype': 'navClicked',
    },
    initialize: function(){
      _.bindAll(this, 'show', 'hide', 'toggleMenu', 'navClicked');
      this.lastScrollTop = 0;
      this.isWatchingScroll = true;
      this.menuBtn = this.$el.find('#menu-btn');
    },
    render : function(currentScrollY){
      if (!this.isWatchingScroll) return;

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
      if (this.isTransitioning)
        return;

      this.isShowing = true;
      this.$el.addClass('block');
      this.menuBtn.addClass('active');
      _.delay(function(){
        this.$el.addClass('show');
        $('body').addClass('menu-mobile-show');
      }.bind(this));
    },

    hide: function(){
      console.log('hide')
      this.isTransitioning = true;
      this.$el.removeClass('show');
      $('body').removeClass('menu-mobile-show');
      this.menuBtn.removeClass('active');
      this.$el.one(whichTransitionEvent(), function(){
        _.delay(function(){
          this.$el.removeClass('block');
          this.isShowing = false;
          this.isTransitioning = false;
          console.log('reset')
        }.bind(this), 600);
      }.bind(this));
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
      console.log('toggle')
      if (this.isShowing) {
        this.hide();
      } else {
        this.show();
      }
    },
    
    navClicked: function(e){
      if (this.isShowing) {
        this.hide();
      }
      if ( $(e.target).closest('a').attr('data-bypass') ) {
        return;
      }

      this.trigger('nav-clicked');
    },

    update: function(route){
      if (!route) return;

      this.$el.find('a').removeClass('active');
      this.$el.find('a[href*="'+ route + '"]').addClass('active');
    },

    watchScroll: function(){
      this.isWatchingScroll = true;
    },

    ignoreScroll: function(){
      this.isWatchingScroll = false;
    }

  });

  return Menu;
});