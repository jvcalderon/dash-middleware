"use strict"

const assert = require("assert")
const fs = require("file-system")
const TMP_DIR = __dirname + '/TMP'
const ORIGINAL_MOCK_FILE = __dirname + '/dashFileMock.dash'
const TEST_MOCK_FILE = 'dashFileMockTest.dash'
const DashMiddleware = require("../lib/dashMiddleware")

describe('DashMiddleware', () => {

    beforeEach(() => {
        fs.copyFileSync(ORIGINAL_MOCK_FILE, TMP_DIR + '/' + TEST_MOCK_FILE)
    })

    afterEach(() => {
        fs.rmdirSync(TMP_DIR)
    })

    describe('#findAll()', () => {
        it('Should find all snippets with tags', () => {
            const dash = new DashMiddleware(TMP_DIR + '/' + TEST_MOCK_FILE)
            return dash.Snippet.findAll({include: [dash.Tag]}).then((result) => {
                assert.equal(result.length, 1)
                assert.equal(result[0].title, 'selectsql-')
                assert.equal(result[0].body, 'SELECT * FROM __tableName__ #Select all rows in table')
                assert.equal(result[0].syntax, 'SQL')
                assert.equal(result[0].usageCount, 0)
                const tags = result[0].tags
                assert.equal(tags.length, 2)
                assert.equal(tags[0].get('tag'), 'SQL')
                assert.equal(tags[1].get('tag'), 'DB')
            })
        })
    })

})