const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/task_management_nosql')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

const taskEmbeddingSchema = new mongoose.Schema({
    taskId: { type: Number, unique: true },
    title: String,
    description: String,
    embedding: [Number]
});

const TaskEmbedding = mongoose.model('TaskEmbedding', taskEmbeddingSchema);

function generateEmbedding(text) {
    const embedding = new Array(128).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
        let hash = 0;
        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) - hash) + word.charCodeAt(i);
        }
        const index = Math.abs(hash) % 128;
        embedding[index] = (embedding[index] || 0) + 1;
    });
    
    const mag = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
    if (mag > 0) embedding.forEach((v, i) => embedding[i] = v / mag);
    return embedding;
}

function cosineSimilarity(a, b) {
    let dot = 0, ma = 0, mb = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        ma += a[i] * a[i];
        mb += b[i] * b[i];
    }
    return dot / (Math.sqrt(ma) * Math.sqrt(mb));
}

app.post('/api/sync', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8082/api/tasks');
        const tasks = response.data;
        
        for (const task of tasks) {
            const text = `${task.title} ${task.description || ''}`;
            const embedding = generateEmbedding(text);
            
            await TaskEmbedding.findOneAndUpdate(
                { taskId: task.taskId },
                { taskId: task.taskId, title: task.title, description: task.description, embedding },
                { upsert: true }
            );
        }
        
        res.json({ message: `Synced ${tasks.length} tasks` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        const queryEmbedding = generateEmbedding(query);
        const allTasks = await TaskEmbedding.find();
        
        const results = allTasks.map(task => ({
            taskId: task.taskId,
            title: task.title,
            similarity: cosineSimilarity(queryEmbedding, task.embedding)
        }));
        
        results.sort((a, b) => b.similarity - a.similarity);
        res.json({ query, results: results.slice(0, 5) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 });
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`========================================`);
    console.log(`   POST /api/sync - Sync tasks`);
    console.log(`   POST /api/search - Search`);
    console.log(`   GET  /health - Health check`);
    console.log(`========================================`);
});