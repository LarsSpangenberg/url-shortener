var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dns = require('dns');

let UrlEntrySchema = new Schema({
  url: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

let CounterSchema = new Schema({
  count: {
    type: Number,
    default: 1
  }
});

let UrlEntries = mongoose.model('UrlEntries', UrlEntrySchema);
let Counters = mongoose.model('Counters', CounterSchema);


exports.newUrl = function(req, res) {
  
  const urlRegExp = /^https?:\/\/(.*)/i;
  const hostRegExp = /([a-z0-9\-_]+\.)+[a-z0-9\-_]+/i;
  
  let url = req.body.url;
  if(/\/$/.test(url)) {
    url = url.slice(0, -1);
  }
  
  let urlProtocol = url.match(urlRegExp);
  if(!urlProtocol) {
    return res.json({error: 'Invalid URL'});
  }
  
  let host = urlProtocol[1].match(hostRegExp);
  if(host) {
    dns.lookup(host[0], function(err) {
      if(err) {
        res.json({error: "Invalid Hostname"})
      } else {
        UrlEntries.findOne({url}, function(err, storedUrl) {
          if(err) {return};
          if(storedUrl) {
            res.json({
              originalUrl: url, 
              shortUrl: storedUrl.index
            });
          } else {
            handleCount(req, res, function(count) {
              let newUrlEntry = new UrlEntries({
                url,
                index: count
              });
              newUrlEntry.save(function(err) {
                if(err) {return}
                res.json({
                  originalUrl: url, 
                  shortUrl: count
                });
              });
            });
          }
        });
      }
    });
  } else {
    res.json({error: 'Incorrect Hostname Format'})
  }  
}

exports.getShortUrl = function(req, res) {
  const shortUrl = req.params.shorturl;
  if(!parseInt(shortUrl, 10)) {
    return res.json({error: 'Wrong Format'})
  }
  UrlEntries.findOne({index: shortUrl}, function(err, data) {
    if(err) {return}
    if(data) {
      res.redirect(data.url);
    }  else {
      res.json({error: 'No short url found for given input'});
    }
  });
};

function handleCount(req, res, callback) {
  Counters.findOneAndUpdate({}, {$inc: {count: 1}}, function(err, data) {
    if(err) {return}
    if(data) {
      callback(data.count);
    } else {
      let newCounter = new Counters();
      newCounter.save(function(err) {
        if(err) {return}
        Counters.findOneAndUpdate({}, {$inc: {count: 1}}, function(err, data) {
          if(err) {return}
          callback(data.count);
        });
      });
    }
  });
}