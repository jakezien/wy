define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view'
], function($, _, Backbone, Modernizr, View){

  var Donate = Backbone.View.extend({
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

      $('#donate .trigger').click(function(){
        $('#donate form')[0].submit();
      });

      $('#donate .hide-btn').click(this.hide);
    },

    show: function(){
          console.log('show')

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
          console.log('hide')

      this.isTransitioning = true;
      this.$el.removeClass('show');
      $('body').removeClass('donate-show');
      this.donateBtn.removeClass('active');
      this.$el.one(whichTransitionEvent(), function(){
        _.delay(function(){
          console.log('reset')
          this.$el.removeClass('block');
          this.isShowing = false;
          this.isTransitioning = false;
        }.bind(this), 600)
      }.bind(this));
    }
  });

  return Donate;
});