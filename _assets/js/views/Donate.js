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
      _.bindAll(this, 'show', 'hide', 'toggle');

      if (opts.donateBtn) {
        this.donateBtn = opts.donateBtn;
        this.donateBtn.click(this.toggle);
      }

      $('#donate .trigger').click(function(){
        $('#donate form')[0].submit();
      });

      $('#donate .hide-btn').click(this.hide);
    },

    toggle: function(){
      if (this.isShowing) {
        this.hide();
      } else {
        this.show();
      }
    },

    show: function(){
      if (this.isTransitioning)
        return;
      console.log('show')

      this.isShowing = true;
      this.$el.addClass('block');
      this.donateBtn.addClass('active');
      _.delay(function(){
        this.$el.addClass('show');
        $('body').addClass('donate-show');
      }.bind(this));
    },

    hide: function(){
      if (!this.isShowing) return;
      console.log('hide')
      this.isTransitioning = true;
      this.$el.removeClass('show');
      $('body').removeClass('donate-show');
      this.donateBtn.removeClass('active');
      this.$el.one(whichTransitionEvent(), function(){
        this.$el.off(whichTransitionEvent())
        _.delay(function(){
          console.log('reset')
          this.$el.removeClass('block');
          this.isShowing = false;
          this.isTransitioning = false;
        }.bind(this), 1000)
      }.bind(this));
    }
  });

  return Donate;
});