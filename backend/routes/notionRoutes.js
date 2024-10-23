const {getNotionAuthUrl, notionAuthCallback} = require("../controllers/notionController")
const express = require('express');
const notionRouter = express.Router();

notionRouter.get('/notion/auth', getNotionAuthUrl);
notionRouter.get('/notion_callback', notionAuthCallback); 


module.exports = notionRouter;