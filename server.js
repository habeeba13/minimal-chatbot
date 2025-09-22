require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const { sequelize, User, Project, Prompt } = require('./database');
const jwt = require('jsonwebtoken');
// const OpenAI = require('openai'); // Removed OpenAI import
const axios = require('axios'); // Added axios import
const path = require('path');
// const multer = require('multer'); // For handling file uploads - Removed

const app = express();
const PORT = process.env.PORT || 3000;

// Set up multer for file uploads - Removed
// const upload = multer({ dest: 'uploads/' });

// Verify if API key is loaded
if (!process.env.OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY is not set. Please check your .env file.");
} else {
  console.log("OPENROUTER_API_KEY is loaded successfully.");
}

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, 'supersecretkey', (err, user) => { // Use the same secret as in login
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

app.use(express.json());
app.use(express.static('./')); // Serve static files from the root directory

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send('Error registering user');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).send('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id }, 'supersecretkey', { expiresIn: '1h' }); // Replace with a strong secret key
    res.json({ token });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

app.post('/projects', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await Project.create({ name, description, userId: req.user.userId });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).send('Error creating project');
  }
});

app.post('/projects/:projectId/prompts', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { title, content } = req.body;

  try {
    const project = await Project.findOne({ where: { id: projectId, userId: req.user.userId } });
    if (!project) {
      return res.status(404).send('Project not found or unauthorized');
    }

    const prompt = await Prompt.create({ title, content, projectId });
    res.status(201).json(prompt);
  } catch (error) {
    res.status(400).send('Error creating prompt');
  }
});

app.post('/chat', authenticateToken, async (req, res) => {
  const { messages, systemPrompt } = req.body; // Expecting an array of messages and systemPrompt

  try {
    // Dynamically prepend the system message if provided, otherwise use a default
    const systemMessageContent = systemPrompt || 'You are a helpful and friendly chatbot. Please provide detailed and engaging responses.';
    
    const fullConversation = [
      { role: 'system', content: systemMessageContent },
      ...messages
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct', // Switched to a reliable OpenRouter model
        messages: fullConversation, // Send the full conversation history
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("OpenRouter Response Data:", JSON.stringify(response.data, null, 2)); // Re-added console.log
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error communicating with OpenRouter:', error.response ? error.response.data : error.message);
    res.status(500).send('Error generating response from AI');
  }
});

// app.post('/upload-file', authenticateToken, upload.single('file'), async (req, res) => { // Removed upload-file route
//   // Note: OpenAI Files API is still used here. If you want a free alternative,
//   // you'd need to implement custom file storage or use another service.
//   try {
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }

//     const filePath = path.join(__dirname, req.file.path);
//     // This part still uses OpenAI's API. Keep this in mind for costs if you use it.
//     const file = await require('openai').files.create({
//       file: await require('fs').promises.readFile(filePath),
//       purpose: 'assistants',
//     });

//     // Optionally, delete the local file after uploading to OpenAI
//     await require('fs').promises.unlink(filePath);

//     res.status(200).json({ fileId: file.id, message: 'File uploaded to OpenAI successfully' });
//   } catch (error) {
//     console.error('Error uploading file to OpenAI:', error);
//     res.status(500).send('Error uploading file to OpenAI');
//   }
// });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { userId: req.user.userId } });
    res.json(projects);
  } catch (error) {
    res.status(500).send('Error fetching projects');
  }
});

// New endpoint to fetch prompts for a specific project
app.get('/projects/:projectId/prompts', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findOne({ where: { id: projectId, userId: req.user.userId } });
    if (!project) {
      return res.status(404).send('Project not found or unauthorized');
    }
    const prompts = await Prompt.findAll({ where: { projectId } });
    res.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    res.status(500).send('Error fetching prompts');
  }
});

// Sync database
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
