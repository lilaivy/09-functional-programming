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


//whatever you return is what that function is going to evaluate to. we're telling it to return an instance of Article....whatever the function returns is the value that will go into the array that map asks
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
// ele is each item in the array that we're mapping, we know that because that's how map works, we're not calling a function, map is (that's why there are no parenthes there ();)...you give it a function without calling it.
//we're reutning ele (each article). body of each article and calling split on empty space
//what gets returned becomes the new index in the array.
//the entire map call evaluates to [['some', 'text']] for every item in the original array (articles)....next we're calling reduce on that.
//map produces an array of same length
//filter produces a smaller array
//reduce produces a single value
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
    //array here is the  array we just mapped, the one we're chaining off of, it's not the one we're creating.
    //index of, returns the index that a given item is at, returns the first index that an item is at, so it won't allow an author to have more than one index position...so if it's alreayd filtered into the array, it will evaluate as false and throw out any duplicate authors 
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
    // we're going through the all authors array and turning them into an object...we have an array of uniqu authors from above, and what we want is an array of objects with information for each of those objects
    //filtering down all the articles down to only the articles of those unique authors
    var rObj = {};
    rObj.authorName = currName;

    //don't need brackets, dot notation evaluates to the same thing.
    rObj['numWords'] = Article.all.filter(function (ele) {
      return ele.author === currName;
        // return ele;
  //inside the 
    }).map(function (ele) {
      return ele.body.split(' ');
    }).reduce(function (acc, curr) {
      return acc + curr.length;
    }, 0);
    return rObj;
  })
};

// re facturing the function from lines 86 to 99
// Article.numWordsByAuthor = () => {
//   return Article.allAuthors().map(currName => {
//     return {
//       authorName: currName,
//       numWords: Article.all.filter(function (ele) {
//         return ele.author === currName;
//       }).map(function (ele) {
//         return ele.body.split(' ');
//       }).reduce(function (acc, curr) {
//         return acc + curr.length;
//       }, 0)
//     };
//   });
// };

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
