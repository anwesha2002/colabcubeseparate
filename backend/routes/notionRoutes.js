const {getNotionAuthUrl, notionAuthCallback, searchPages, retrievePage, retrieveDatabase, createPage} = require("../controllers/notionController")
const express = require('express');
const notionRouter = express.Router();
const verifyToken = require('../middlewares/auth');

notionRouter.get('/notion/auth', getNotionAuthUrl);
notionRouter.get('/notion_callback', notionAuthCallback); 
notionRouter.get('/notion/search', verifyToken, searchPages);
notionRouter.get('/notion/pages/:pageId', verifyToken, retrievePage)
notionRouter.get('/notion/databases/:databaseId', verifyToken, retrieveDatabase)
notionRouter.post('/notion/pages', verifyToken, createPage)


module.exports = notionRouter;