'use strict';

// REVIEW: Check out all of the functions that we've cleaned up with arrow function syntax.

// DONE TODO: Wrap the entire contents of this file in an IIFE.
// Pass in to the IIFE a module, upon which objects can be attached for later access.
function Article(opts) {
  // REVIEW: Lets review what's actually happening here, and check out some new syntax!!
  Object.keys(opts).forEach(e => this[e] = opts[e]);
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

Article.loadAll = rows => {
  rows.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)));
  // DONE TODO: Refactor this forEach code, by using a `.map` call instead, since want we are trying to accomplish
  // is the transformation of one colleciton into another.

  //  OLD forEach():
//   rawData.forEach(function(ele) {
//   Article.all.push(new Article(ele));
// });

  Article.all = rows.map(function(article){
    return new Article(article);
  })
};

Article.fetchAll = callback => {
  $.get('/articles')
  .then(
    results => {
      Article.loadAll(results);
      callback();
    }
  ).catch(console.error);
};

// DONE TODO: Chain together a `map` and a `reduce` call to get a rough count of all words in all articles.
Article.numWordsAll = () => {
  return Article.all.map(function(ele){
    return ele.body.split(' ');

  }).reduce(function(acc,curr){
    return acc + curr.length;
  },0)
};

// DONE TODO: Chain together a `map` and a `filter` call to produce an array of unique author names.
Article.allAuthors = () => {
  return Article.all.map(function (ele) {
    return ele.author;
  }).filter(function (author, i, array) {
    return array.indexOf(author) === i;
  });
};

Article.numWordsByAuthor = () => {
  return Article.allAuthors().map(currName => {
    // DONE TODO: Transform each author string into an object with properties for
    // the author's name, as well as the total number of words across all articles
    // written by the specified author.
    // .split()
    var rObj = {};
    rObj.authorName = currName;
    rObj['numWords'] = Article.all.filter(function (ele) {
      if (ele.author === currName) {
        return ele;
      }
    }).map(function (ele) {
      return ele.body.split(' ');
    }).reduce(function (acc, curr) {
      return acc + curr.length;
    }, 0);
    return rObj;
  })
};

Article.truncateTable = callback => {
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  .then(console.log) // REVIEW: Check out this clean syntax for just passing 'assumend' data into a named function!
  .then(callback);
};

Article.prototype.insertRecord = function(callback) {
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  .then(console.log)
  .then(callback);
};

Article.prototype.deleteRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  .then(console.log)
  .then(callback);
};

Article.prototype.updateRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title,
      author_id: this.author_id
    }
  })
  .then(console.log)
  .then(callback);
};
