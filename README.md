[![NPM](https://nodei.co/npm/dash-middleware.png?downloads=true&stars=true)](https://nodei.co/npm/dash-middleware/)

Dash Middleware
==============

[![Build Status](https://travis-ci.org/jvcalderon/dash-middleware.svg?branch=master)](https://travis-ci.org/jvcalderon/dash-middleware)
[![Coverage Status](https://coveralls.io/repos/github/jvcalderon/dash-middleware/badge.svg?branch=master)](https://coveralls.io/github/jvcalderon/dash-middleware?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/jvcalderon/dash-middleware/badge.svg)](https://snyk.io/test/github/jvcalderon/dash-middleware)

Simple module who provides Sequelize models to use [Dash](https://kapeli.com/dash)'s snippet database (SQLite DB file)

## Installation

<pre><code>$ npm install --save dash-middleware</code></pre>

## Basic use

Dash middleware is just an object who contains all Dash models for [Sequelize](http://docs.sequelizejs.com/). 

<pre><code>
//Require Dash middleware
const DashMiddleware = require('dash-middleware')
    
//Construct with Dash file DB
const dash =  new DashMiddleware('snippets.dash')
    
//Find all snippets
let allSnippets = dash.Snippet.findAll({include: [dash.Tag]}).then((result) => {
    //Do something
})
    
//You also use Tag model
// dash.Snippet.findAll(...
</code></pre>

Read Sequelize doc to get more info about querying and other DB operations.