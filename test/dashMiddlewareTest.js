"use strict"

const assert = require("assert")
const co = require("co")
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

    describe('#sync()', () => {
        it('Should create updateAt and createdAt fields', () => {
            const dash = new DashMiddleware(TMP_DIR + '/' + TEST_MOCK_FILE, {timestamps: true})
            return co(function *() {
                yield dash.sync()
                return dash.Snippet.findAll({include: [dash.Tag]}).then((result) => {
                    assert.equal(result[0].createdAt, null)
                    assert.equal(result[0].updatedAt, null)
                })
            })
        })
        it('Should remove updateAt and createdAt fields', () => {
            let dash = new DashMiddleware(TMP_DIR + '/' + TEST_MOCK_FILE, {timestamps: true})
            return co(function *() {
                yield dash.sync()
                yield dash.Snippet.findAll({include: [dash.Tag]}).then((result) => {
                    assert.equal(result[0].createdAt, null)
                    assert.equal(result[0].updatedAt, null)
                })
                dash = new DashMiddleware(TMP_DIR + '/' + TEST_MOCK_FILE, {timestamps: false})
                yield dash.sync()
                return dash.Snippet.findAll({include: [dash.Tag]}).then((result) => {
                    assert.equal(result[0].createdAt, undefined)
                    assert.equal(result[0].updatedAt, undefined)
                })
            })
        })
        it('Should update updatedAt field on update', () => {
            let dash = new DashMiddleware(TMP_DIR + '/' + TEST_MOCK_FILE, {timestamps: true})
            return co(function *() {
                yield dash.sync()
                const snippet = yield dash.Snippet.findOne({title: 'selectsql-'})
                return yield snippet.updateAttributes({
                    title: 'mock-',
                    body: 'Mock body',
                    syntax: 'text/plain',
                    tags: [],
                    usageCount: 0
                }).then((result) => {
                    assert.equal(result.createdAt, null)
                    assert.notEqual(result.updatedAt, null)
                })
            })
        })
        it('Should set createdAt and updatedAt field on create', () => {
            let dash = new DashMiddleware(TMP_DIR + '/' + TEST_MOCK_FILE, {timestamps: true})
            return co(function *() {
                yield dash.sync({keyFixing: true})
                dash = new DashMiddleware(TMP_DIR + '/' + TEST_MOCK_FILE, {timestamps: true})
                return yield dash.Snippet.create({
                    title: 'newMock-',
                    body: 'Mock body new',
                    syntax: 'text/plain',
                    usageCount: 0
                }).then((result) => {
                    assert.notEqual(result.createdAt, null)
                    assert.notEqual(result.updatedAt, null)
                })
            })
        })
        it('Should fix/unfix wrong foreign keys', () => {
            let dash = new DashMiddleware(TMP_DIR + '/' + TEST_MOCK_FILE)
            return co(function *() {
                yield dash.sync({keyFixing: true})
                yield dash.sync({keyFixing: false})
                console.log('asdsad')
            })
        })
    })

})