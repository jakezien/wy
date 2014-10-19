define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
], function($, _, Backbone, Modernizr){

  var PageModel = Backbone.Model.extend({
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
      })
      .done(this.onRequestSuccess)
      .fail(this.onRequestError)
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
      console.log('error');
      var $dataDiv = $('<div />').html(data);
      $dataDiv.addClass('page');
      this.set('rawHTML', data);
      this.set('template', $dataDiv);
      this.set('title', '404');
    }
  });

  return PageModel;

});