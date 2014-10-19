define([
  'jquery',
  'underscore',
  'backbone',
  'modernizr',
  'view'
], function($, _, Backbone, Modernizr, View){

  var Blog = View.extend({
    page: 'blog'
  });

  return Blog;
});