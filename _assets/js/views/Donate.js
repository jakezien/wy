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
      _.bindAll(this, 'show', 'hide', 'toggle', 'onInputFocus', 'onInputBlur', 'validateForm', 'submitForm', 'onInputKeyUp');

      if (opts.donateBtn) {
        this.donateBtn = opts.donateBtn;
        this.donateBtn.click(this.toggle);
      }

      this.donateInput = $('#donate .donate-input input');
      this.form = $('#donate #paypal');

      $('#donate .trigger').click(function(){
        // this.donateInput.focus();
        this.form.submit();
        $('#donate .trigger').addClass('clicked');
      }.bind(this));
      this.donateInput.on('focus', this.onInputFocus);
      this.donateInput.on('blur', this.onInputBlur);
      this.donateInput.on('keyup', this.onInputKeyUp);

    },

    toggle: function(){
      if (this.isShowing) {
        this.hide(true);
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

    hide: function(resetUrl){
      if (!this.isShowing) return;
      if (resetUrl) {
        // Backbone.history.navigate('');
      }
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
    },

    onInputFocus: function(){
      this.$el.addClass('input-focus');
    },

    onInputBlur: function(){
      this.$el.removeClass('input-focus');
    },

    validateForm: function(){

    },

    submitForm: function(){
      $('#amount1')[0].value = this.donateInput[0].value;
      debugger
      this.form.submit();
    },

    onInputKeyUp: function(e){
      if (e.keyCode === 13) {
        this.submitForm();
      }
    }



  });

  return Donate;
});