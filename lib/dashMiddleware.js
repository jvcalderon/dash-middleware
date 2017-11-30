"use strict"

const Sequelize = require("sequelize")
const co = require("co")

const DB_NAME = 'main'
const DIALECT = 'sqlite'
const TABLES = ['tags', 'snippets', 'tagsIndex']

/**
 * Models to handle Dash database by Sequelize ORM
 * @param {string} dashFile Dash DB file
 * @param {object} configData Configuration data object. Could be used to activate additional schema features
 * @constructor
 */
let DashMiddleware = function (dashFile, configData = {}) {

    const config = {
        timestamps: !!configData.timestamps
    }

    const connection = new Sequelize(DB_NAME, null, null, {
        dialect: DIALECT,
        storage: dashFile
    })

    //TAG MODEL *****************************************

    const tagDefinition = {
        tid: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true
        },
        tag: Sequelize.DataTypes.TEXT
    }
    this.Tag = connection.define('tags', tagDefinition, {timestamps: config.timestamps})

    //SNIPPET MODEL *************************************

    const snippetDefinition = {
        sid       : {
            type      : Sequelize.DataTypes.INTEGER,
            primaryKey: true
        },
        title     : Sequelize.DataTypes.TEXT,
        body      : Sequelize.DataTypes.TEXT,
        syntax    : Sequelize.DataTypes.STRING,
        usageCount: Sequelize.DataTypes.INTEGER
    }
    this.Snippet = connection.define('snippets', snippetDefinition, {timestamps: config.timestamps})

    //TAGS INDEX MODEL ***********************************

    this.TagsIndex = connection.define('tagsIndex',
        {
            sid: { type: Sequelize.DataTypes.INTEGER, primaryKey: true },
            tid: { type: Sequelize.DataTypes.INTEGER, primaryKey: true }
        },
        {timestamps: false, freezeTableName: true}
    )

    this.sync = (configData = {}) => {
        const keyFixing = true === configData.keyFixing
        return co(function* () {
            for (let i = 0; i < TABLES.length; i++) {
                let table = TABLES[i]
                yield config.timestamps ? _addTimestampsFields(table) : _removeTimestampsFields(table)
            }
            yield keyFixing ? connection.sync({force: true}) : _revertKeyFixing()
            return this
        })
    }

    this.Tag.belongsToMany(this.Snippet, {through: this.TagsIndex, foreignKey: 'tid', name: 'tagsIndex_tid_fk'})
    this.Snippet.belongsToMany(this.Tag, {through: this.TagsIndex, foreignKey: 'sid', name: 'tagsIndex_id_fk'})

    const _removeTimestampsFields = function* (table) {
        const tableFields = yield _getTableFields(table)
        if (tableFields.indexOf('updatedAt') >= 0)
            yield connection.queryInterface.removeColumn(table, 'updatedAt')
        if (tableFields.indexOf('createdAt') >= 0)
            yield connection.queryInterface.removeColumn(table, 'createdAt')
    }

    const _addTimestampsFields = function* (table) {
        const tableFields = yield _getTableFields(table)
        if (tableFields.indexOf('updatedAt') < 0) {
            yield connection.queryInterface.addColumn(table, 'updatedAt', Sequelize.DataTypes.DATE)
            yield connection.query(_getTimestampTriggerQuery(table, 'updatedAt'))
        }
        if (tableFields.indexOf('createdAt') < 0) {
            yield connection.queryInterface.addColumn(table, 'createdAt', Sequelize.DataTypes.DATE)
            yield connection.query(_getTimestampTriggerQuery(table, 'createdAt'))
        }
    }

    const _getTimestampTriggerQuery = (table, column) => {
        const idName = 'snippets' === table ? 'sid' : 'tid'
        const operation = 'updatedAt' === column ? 'UPDATE' : 'INSERT'
        const reference = 'INSERT' === operation ? 'new' : 'old'
        return `CREATE TRIGGER [${table}_${operation.toLowerCase()}_at] AFTER ${operation} ON ${table} FOR EACH ROW
        BEGIN
            UPDATE '${table}' SET ${column} = CURRENT_TIMESTAMP WHERE ${table}.${idName} = ${reference}.${idName};
        END;`
    }

    const _getTableFields = function* (table) {
        return yield connection.query(`PRAGMA table_info(${table})`)
            .then(results => results[0].map(fieldInfo => fieldInfo.name))
    }

    const _revertKeyFixing = function* () {
        
    }

    const _hasForeignKey = function* (tableName, fkColName) {
        return yield !!connection.query(`SELECT * FROM sqlite_master WHERE tbl_name = '${tableName}' AND sql LIKE '%FOREIGN KEY(${fkColName})%'`)
    }
}

module.exports = DashMiddleware
module.exports.DashMiddleware = DashMiddleware;
module.exports.default = DashMiddleware;
