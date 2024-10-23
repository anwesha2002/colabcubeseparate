const User = require("../models/User")

const getNotionAuthUrl = async (req, res) => {
    try {
        const authUrl = process.env.NOTION_AUTH_URL;
        res.status(200).json({message: "success", authUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const notionAuthCallback = async (req, res) => {
    try {
        const { code } = req.query;
        const secret = btoa(process.env.NOTION_CLIENT_ID + ":" + process.env.NOTION_CLIENT_SECRET);
        console.log(process.env.NOTION_REDIRECT_URI)
        const response = await fetch("https://api.notion.com/v1/oauth/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${secret}`
            },
            body: JSON.stringify({ code, grant_type: "authorization_code", redirect_uri: process.env.NOTION_REDIRECT_URI })
        });
        const data = await response.json();
        const owner_email = data.owner.user.person.email;
        console.log(owner_email)
        const user = await User.findOne({ email: owner_email });
        if (!user) {
            return res.status(404).json({ message: "Please go and register with your notion email" });
        }
        // update user with the notion details
        user.notionDetails = data
        await user.save();
        res.status(200).json({message: "success", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const searchPages = async (req, res) => {
    try {
        const { query } = req.query;
        console.log(req.user)
        const user = await User.findById(req.user._id);
        if (!user.notionDetails) {
            return res.status(404).json({ message: "Notion details not found" });
        }
        let filterValue;
        if (!query) {
            filterValue = "page";
        } else {
            filterValue = query;
        }
        const queryData = {
            "filter": {
                "value": `${filterValue}`,
                "property": "object"
            },
            "sort":{
            "direction":"ascending",
            "timestamp":"last_edited_time"
            }
        }
        const response = await fetch("https://api.notion.com/v1/search", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.notionDetails.access_token}`,
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify(queryData)
        });
        const data = await response.json();
        res.status(200).json({message: "success", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const retrievePage = async (req, res) => {
    try {
        const { pageId } = req.params;
        const user = await User.findById(req.user._id);
        if (!user.notionDetails) {
            return res.status(404).json({ message: "Notion details not found" });
        }
        const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.notionDetails.access_token}`,
                'Notion-Version': '2022-06-28'
            }
        });
        const data = await response.json();
        res.status(200).json({message: "success", data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getNotionAuthUrl,
    notionAuthCallback,
    searchPages,
    retrievePage
}