var express = require('express');
var translateBook = require('translate-book');
var router = express.Router();
var fs = require('fs').promises;
var uuid = require('uuid');

var booksProcess = {};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Translate your book' });
});

router.post('/translate', function(req, res, next) {
    var rate = req.body.rate;
    var filePath = req.files.bookFile.path;
    var fileName = req.files.bookFile.name;
    var maxFileSize = 1024 * 1025 * 3;
    var processId = uuid.v4();
    if (req.files.bookFile.size < maxFileSize) {
        return fs.readFile(filePath, 'utf8')
            .then((data) => {
                booksProcess[processId] = {
                    ready: false,
                    filePath,
                    fileName
                };
                res.redirect('/' + processId);
                return translateBook.translateBook(data, {maxRate: rate})
            }) 
            .then((newBook) => {
                return fs.writeFile(filePath, newBook)
                // booksProcess[processId] = filePath
                // fs.unlink(filePath, function() {
                //     res.send(newBook);
                // })
            })
            .then(() => {
                booksProcess[processId].ready = true;
            })
            .catch(next)
    } else {
      res.status(400).send('Invalid File')
    }
})

router.get('/:id', function(req, res, next) {
    var processId = req.params.id;
    if (processId in booksProcess) {
        var book = booksProcess[processId];

        if (book.ready) {
            fs.readFile(book.filePath)
                .then((data) => {
                    var fileName = 'enru_' + book.fileName
                    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                    res.setHeader('Content-Transfer-Encoding', 'binary');
                    res.setHeader('Content-Type', 'application/octet-stream');
                    res.send(data);

                    return fs.unlink(book.filePath);
                })
                .then(() => {
                    delete booksProcess[processId];
                });
        }
        else {
            res.render('book', { title: 'Processing your book' });
        }

    } else {
        res.redirect('/')
    }
});

module.exports = router;
