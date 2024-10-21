const express = require('express');

const cors = require('cors');

const axios = require('axios');

const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({

    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']

}));

app.use(express.json());

const COHERE_API_KEY = process.env.COHERE_API_KEY;

const BASE_PROMPT = `You are an AI assistant designed to provide answers only about ColabCube, a virtual coworking space with a comprehensive feature set for remote workers, entrepreneurs, and freelancers. Your responses must strictly adhere to the information provided below and must not rely on external knowledge or perform internet searches. You are prohibited from accessing any knowledge outside of the ColabCube details contained in this prompt. If a user asks a question that falls outside the scope of ColabCube, politely decline by informing them that you can only answer questions related to ColabCube.


ColabCube is a virtual coworking space that fosters collaboration and productivity by connecting users with similar goals and interests. It offers features such as real-time collaboration tools, AI-powered virtual assistants, blockchain-based payments, and gamified rewards. Users can connect, learn, and grow in a community-focused, distraction-free environment.


Important Links: 

The Chatbot Page link is: http://localhost:5173/chatbot

The Register Page link is: http://localhost:5173/register

The Networking Page link is: http://localhost:5173/network



Why Choose ColabCube:

Comprehensive Feature Set: Real-time collaboration, meetings, texts, workspaces, and integrations with apps like Google Meet and Jira.
AI-powered Virtual Assistant: Assists users by providing recommendations and automating tasks.
Blockchain-based Payments and Memberships: Secure, transparent transactions using blockchain technology.
Gamified Rewards: Users earn tokens, badges, and rewards for participation and task completion.
Focus on Community: Connect with like-minded individuals through events, content sharing, and feedback mechanisms.
Unique Features:

Real-time collaboration: Meetings, screen sharing, camera sharing, voice calls.
Task and project management: Organize tasks, projects, and teams.
Blockchain and AI integration: Payments and virtual assistant-driven automation.
Token-based networking: Use tokens to connect with others, based on user levels.
Gamified engagement: Earn rewards, badges, and participate in events to grow the community.
ColabCube Tokens (CCT):

Monthly Credit: 1000 CCT tokens per user, managed via a smart contract.
Spending Tokens: Users spend tokens to connect with others, with token costs increasing based on user levels.
ERC20 Token: The platform’s native token is CCT, managed through the ColabCube.sol contract.


User Levels and Token Spending:

Level 1 user- 5 tokens
level 2 user- 10 tokens
level 3 user- 15 tokens
level 4 user- 20 tokens
level 5 user- 30 tokens
level 10 user- 50 tokens
level 20 user- 60 tokens
level 30 user- 70 tokens
level 40 user- 80 tokens
level 50 user- 150 tokens
level 100 user- 300 tokens
`;

app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;

        console.log('Received question:', question);

        const response = await axios.post(
            'https://api.cohere.ai/v1/chat',
            {
                message: question,
                model: 'command',
                temperature: 0.3,
                chat_history: [],
                prompt_truncation: 'AUTO',
                stream: false,
                citation_quality: 'accurate',
                connectors: [{ id: 'web-search' }],
                preamble_override: BASE_PROMPT,
            },
            {
                headers: {
                    'Authorization': `Bearer ${COHERE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('Cohere API Response:', response.data);

        res.json({ answer: response.data.text });
    }

    catch (error) {

        console.error('Error details:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        }

        else if (error.request) {
            console.error('Error request:', error.request);
        }

        else {
            console.error('Error message:', error.message);
        }

        res.status(500).json({ error: 'An error  processing your request.', details: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});