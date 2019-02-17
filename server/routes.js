module.exports = function(admin, express) {
  'use strict';

  const router = express.Router(),
        moment = require('moment'),
        firebaseMiddleware = require('express-firebase-middleware');

  let db = admin.database();

  function errorHandler (err, req, res, next) {
    console.error(err.message);
    res.status(500).end(err.message);
  }

  router.use('/', firebaseMiddleware.auth);
  router.use(errorHandler);
  router.use((req, res, next) => { next(); });

// user =====================================================================

  router.get(`/user/:uid/profile`, (req, res, next) => {
    let uid = req.params.uid;
    db.ref('users/' + uid).once('value').then((snap) => {
      res.end(JSON.stringify(snap.val()));
    }).catch((error) => {
      next(error);
    });
  });

  router.post(`/user/:uid/profile`, (req, res, next) => {
    let uid = req.params.uid;

    const u = 'users/' + uid;

    const p = req.body;
    const displayName = (p.hasOwnProperty('displayName')) ? p.displayName : null;
    const firstName = (p.hasOwnProperty('firstName')) ? p.firstName : null;
    const lastName = (p.hasOwnProperty('lastName')) ? p.lastName : null;
    const emailAddress = (p.hasOwnProperty('emailAddress')) ? p.emailAddress : null;
    const lastEditedBook = (p.hasOwnProperty('lastEditedBook')) ? p.lastEditedBook : null;
    const books = (p.hasOwnProperty('books')) ? p.books : null;

    let updates = {};
    updates[u + '/displayName'] = displayName;
    updates[u + '/lastEditedBook'] = lastEditedBook;
    updates[u + '/lastModified'] = moment().unix();
    updates[u + '/firstName'] = firstName;
    updates[u + '/lastName'] = lastName;
    updates[u + '/emailAddress'] = emailAddress;
    updates[u + '/books'] = books;

    db.ref().update(updates).then(() => {
      db.ref(u).once('value').then((snap) => {
        return res.end(JSON.stringify(snap.val()));
      }).catch((error) => {
        next(error);
      });

    }).catch((error) => {
      next(error);
    });
  });

// books ====================================================================

  router.post(`/library/book`, (req, res, next) => {
    const newKey = db.ref().child('books').push().key;
    db.ref('books/' + newKey).set(req.body.book).then(() => {
      res.status(201).end(newKey);
    }).catch((error) => {
      next(error);
    });
  });

  router.get(`/library/book/:uid`, (req, res, next) => {
    db.ref('books/' + req.params.uid).once('value').then((snap) => {
      res.end(JSON.stringify(snap.val()));
    }).catch((error) => {
      next(error);
    });
  });

  router.get(`/library`, (req, res, next) => {
    db.ref('books').once('value').then((snap) => {
      if (snap.val() === null) {
        return res.end();
      } else {
        return res.end(JSON.stringify(snap.val()));
      }
    }).catch((error) => {
      return next(error);
    });
  });

  router.post(`/library/book/:uid/update`, (req, res, next) => {
    const bookId = req.params.uid;
    const book = Object.assign({}, req.body.book);
    const now = moment().unix();

    book.lastModified = now;

    db.ref('books/' + bookId).set(book).then(() => {
      db.ref('books/' + bookId).once('value').then((snap) => {
        res.end(JSON.stringify(snap.val()));
      }).catch((error) => {
        next(error);
      });

    }).catch((error) => {
      next(error);
    });
  });

  router.delete(`/library/book/:id`, (req, res, next) => {
    const bookId = req.params.id;
    const bookRef = db.ref('books/'+bookId);
    bookRef.remove().then(() => {
      return res.end();
    }).catch((error) => {
      next(error);
    });
  });

  // propositions ============================================================

  router.post(`/library/props/:uid`, (req, res, next) => {
    const bookId = req.params.uid;
    const propositions = Object.assign({}, req.body.propositions);

    db.ref('propositions/' + bookId).set(propositions).then(() => {
      db.ref('propositions/' + bookId).once('value').then((snap) => {
        return res.end(JSON.stringify(snap.val()));
      }).catch((error) => {
        next(error);
      });
    }).catch((error) => {
      next(error);
    });
  });

  router.get(`/library/props/:uid`, (req, res, next) => {
    const bookId = req.params.uid;
    db.ref('propositions/' + bookId).once('value').then((snap) => {
      let result = (snap.val() === null) ? [] : snap.val();
      return res.end(JSON.stringify(result));
    }).catch((error) => {
      next(error);
    });
  });

  return router;
};
