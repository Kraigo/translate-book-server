var express = require('express');
var translateBook = require('translate-book');
var router = express.Router();
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Translate your book' });
});

router.post('/translate', function(req, res) {
    var rate = req.body.rate;
    var filePath = req.files.bookFile.path;
    var maxFileSize = 1024 * 1025 * 3;
    if (req.files.bookFile.size < maxFileSize) {
        fs.readFile(filePath, 'utf8', function(err, data) {
            if (err) throw err;
            translateBook.translateBook(data, {maxRate: rate})
                .then(function(newBook) {
                    fs.unlink(filePath, function() {
                        res.send(newBook);
                    })
                })
        })
    } else {
      res.status(400).send('Invalid File')
    }
})

module.exports = router;
