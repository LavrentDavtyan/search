require('dotenv').config();
const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const defaultPortNumber = 3000;
const PORT = process.env.PORT || defaultPortNumber;
const client = new MongoClient('mongodb://localhost:27017');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

client.connect()

client.connect()
.then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
});

const db = client.db('engine');
const collection = db.collection('pages');

app.get('/search', async (req, res) => {
    const term = req.query.q;
    try {
        const page = await collection.find({ terms: term }).toArray();
        if (page.length > 0) {
            res.json(page);
        } else {
            res.status(404).send('No results found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/crawl', async (req, res) => {
    const { title, content } = req.body;
    if (title && content) {
        if (typeof content === 'string') {
            try {
                await collection.insertOne({ title, terms: content.split(' ') });
                res.send('done');
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        } else {
            res.status(400).send('Content must be a string');
        }
    } else {
        res.status(400).send('Title and content are required');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
    client.close().then(() => {
        console.log('MongoDB client disconnected');
        process.exit(0);
    });
});
