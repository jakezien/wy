define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view'
], function($, _, Backbone, Modernizr, View){

  var Schools = View.extend({
    page: 'schools',
    beforeAppend: function() {
      this.$el.find('*[data-src]').each(function(i, el){
        this.preloadImg(el);
      }.bind(this));
      this.scrollNaggerEnabled = true;
    },
    onImgLoadCallback: function($el) {
      console.log('loaded')
    }
  });

  return Schools;
});