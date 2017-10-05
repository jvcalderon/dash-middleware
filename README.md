Dash Middleware
==============

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