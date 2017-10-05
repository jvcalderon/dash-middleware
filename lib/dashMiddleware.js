"use strict";

const Sequelize = require("sequelize")

const DB_NAME = 'main'
const DIALECT = 'sqlite'

/**
 * Models to handle Dash database by Sequelize ORM
 * @param {string} dashFile Dash DB file
 * @constructor
 */
let DashMiddleware = function(dashFile) {

    this.connection = new Sequelize(DB_NAME, null, null, {
        dialect: DIALECT,
        storage: dashFile
    });

    this.Tag = this.connection.define('tags', {
        tid: {
            type      : Sequelize.INTEGER,
            primaryKey: true
        },
        tag: Sequelize.TEXT
    }, {
        timestamps: false
    })

    this.Snippet = this.connection.define('snippets', {
            sid       : {
                type      : Sequelize.INTEGER,
                primaryKey: true
            },
            title     : Sequelize.TEXT,
            body      : Sequelize.TEXT,
            syntax    : Sequelize.STRING,
            usageCount: Sequelize.INTEGER
        }, {
            timestamps: false
        }
    )

    this.TagsIndex = this.connection.define('tagsIndex',
        {},
        {
            timestamps     : false,
            freezeTableName: true
        }
    )

    this.Tag.belongsToMany(this.Snippet, {through: this.TagsIndex, foreignKey: 'tid'})
    this.Snippet.belongsToMany(this.Tag, {through: this.TagsIndex, foreignKey: 'sid'})
}

module.exports = DashMiddleware
module.exports.DashMiddleware = DashMiddleware;
module.exports.default = DashMiddleware;
