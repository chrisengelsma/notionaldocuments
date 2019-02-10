# Notional Documents

#### A propositional-logic approach to crafting documents

![Badge](https://img.shields.io/github/package-json/v/notionaldocuments/notionaldocuments.svg?style=flat) [![license](https://img.shields.io/github/license/notionaldocuments/notionaldocuments.svg)](https://github.com/notionaldocuments/notionaldocuments/blob/master/LICENSE) [![Build Status](https://travis-ci.org/notionaldocuments/notionaldocuments.svg?branch=master)](https://travis-ci.org/notionaldocuments/notionaldocuments) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/esta/issues)


![Overview gif](/assets/images/overview.gif)

#### What is Propositional Logic?

From Stanford's [Intro to Logic, Chapter 2](http://intrologic.stanford.edu/notes/chapter_02.html): 

**Propositional Logic is concerned with propositions and their interrelationships.**
Roughly speaking, a proposition is a possible condition of the world that is either true or false, e.g. the possibility that it is raining, the possibility that it is cloudy, and so forth. The condition need not be true in order for it to be a proposition. In fact, we might want to say that it is false or that it is true if some other proposition is true.

***

#### Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation Guide](#installation-guide)
  - [Installing Dependencies](#installing-dependencies)
  - [Connect to Firebase](#connect-to-firebase)
  - [Running](#running)
- [How To Use](#how-to-use)
  - [Punctuation](#punctuation)
  - [Paragraph / Idea Ownership](#paragraph--idea-ownership)
  - [Create New Sections](#questions-create-new-sections)
- [Roadmap](#roadmap)
- [API Documentation](#api-documentation)
- [Resources](#resources)

***

### Overview

Notional Documents is a propositional-logic approach to collaboration and document crafting.
Discuss a topic by trading sentences to build documents made up of sentences. 

### Features 

- Draft and edit at close-to messaging speed
- Feedback and debate to draw out ideas and develop paragraphs rationalistically
- Manage a library of different projects

### Installation Guide

Before installing ensure you hae the following:

* [Nodejs](https://nodejs.org/en/) 
* [npm](https://www.npmjs.com/)

### Installing Dependencies
Navigate to the project root and run the following command:

```bash
$ npm install
```

This will install all the necessary dependencies.

#### Connect to Firebase

Before you run, you'll need to set up your app's config to point to your Firebase database.

* Go to [https://firebase.google.com/]() and set up a new account.
* In the Firebase Console, select "+ Add Project" to start a new project. Name it whatever you like.
* Once initialized, select "</>" under "Get started by adding Firebase to your app" on the Overview screen. A modal window will pop up that will look similar to this:
```
<script src="https://www.gstatic.com/firebasejs/4.13.0/firebase.js"></script>
<script>
  // Initialize Firebase
  var config = {
    apiKey: "*",
    authDomain: "*",
    databaseURL: "*",
    projectId: "*",
    storageBucket: "*",
    messagingSenderId: "*"
  };
  firebase.initializeApp(config);
</script>
```
* Paste the information inside the modal's `var config = { ... };` into the appropriate place within the `index.html` file in this project.
* Next, go into Firebase settings and select "Service Accounts"
* With "Node.js" selected, paste the posted information into server/firebase-admin.js
* Then select "Generate new private key". Paste the key into config/serviceAccountKey.json
* Your project will now link to your firebase account.
* Finally, click "Authentication" on the left to configure auth.

#### Running

After installing and linking to Firebase, type this into a terminal: 

```bash
$ npm start
```

When the application finishes initializing, open up a browser and navigate to [http://localhost:3000]()

### How to use

#### Punctuation 

In discussion, we state information, as well as comment on and justify ourselves against, the sentences of others. We also ask questions. These interactions prompt others and make them aware of how we feel about common information, and why.

In notional documents, punctuation marks [ .  !  ? : ] serve like logical operators and provide these cues. They tell the software how to update common information - the document.

#### Paragraph / Idea Ownership

Conventional paragraphs start with a topic sentence that states a main idea, followed by supporting sentences that expand upon or justify it. An acceptable paragraph is often a more complete and complex thought than a single sentence.

In notional documents, an author has a kind of sovereignty over their own paragraphs just as they do over their own thoughts. By design, users may mark up sentences in another author's paragraph with remarks or criticisms, but the author can replace these with justifications or elaborations, thereby building up the paragraph.

#### Questions Create New Sections

In discussion, we use questions to prompt others to share information that is not already common knowledge. In a document, a new section explores information not already stated to the reader. Notional Documents connects the function of a question to the usefulness of supposing an additional section of a document about a complex idea.

One further avenue for development involves constructing an algorithm to parse any question into the noun phrase that titles the new section.  

### Roadmap

- Non-blocking collaboration: share the document's outline and settle with an unlimited number of co-authors over entire paragraphs of ideas rather than individual words (in development)
- Document drafting without the need to view the document (nearly there)

### API Documentation

[Api documentation can be found here](docs/README.md)

### Resources

* [Intro to Logic, Stanford](http://intrologic.stanford.edu/notes/chapter_02.html)
* ["Propositional Logic" from the Internet Encyclopedia of Philosophy](https://www.iep.utm.edu/prop-log/)
* ["Basic Concepts of Propositional Logic" Youtube video by Kevin De La Plante](https://www.youtube.com/watch?v=qV4htTfow-E)
