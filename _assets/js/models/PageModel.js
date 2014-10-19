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

  return PageModel;

});