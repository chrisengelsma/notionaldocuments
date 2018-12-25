'use strict';

const admin = require('firebase-admin');

const serviceAccount = require('../config/serviceAccountKey.json');

admin.initializeApp({
	// Credentials go here
});

module.exports = admin;
