/* ========================================
   Greenviro Farewell Site - Backend Server
   ========================================

   Simple Express server with SQLite database
   for persistent message storage across users.

   ======================================== */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new sqlite3.Database('./greenviro.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            text TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating messages table:', err);
        } else {
            console.log('Messages table ready');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_id TEXT UNIQUE,
            first_visit DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating visitors table:', err);
        } else {
            console.log('Visitors table ready');
        }
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rate limiting for message posting
const messageRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 messages per windowMs
    message: { error: 'Too many messages from this IP, please try again later.' }
});

/* ========================================
   API Routes
   ======================================== */

// Get all messages
app.get('/api/messages', (req, res) => {
    db.all(
        'SELECT id, name, text, timestamp FROM messages ORDER BY id DESC LIMIT 100',
        [],
        (err, rows) => {
            if (err) {
                console.error('Error fetching messages:', err);
                res.status(500).json({ error: 'Failed to fetch messages' });
            } else {
                res.json(rows);
            }
        }
    );
});

// Post a new message
app.post('/api/messages', messageRateLimit, (req, res) => {
    const { name, text } = req.body;

    // Validation
    if (!name || !text) {
        return res.status(400).json({ error: 'Name and message are required' });
    }

    if (name.trim().length === 0 || name.trim().length > 50) {
        return res.status(400).json({ error: 'Name must be between 1 and 50 characters' });
    }

    if (text.trim().length === 0 || text.trim().length > 200) {
        return res.status(400).json({ error: 'Message must be between 1 and 200 characters' });
    }

    // Check total message count
    db.get('SELECT COUNT(*) as count FROM messages', [], (err, row) => {
        if (err) {
            console.error('Error counting messages:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row.count >= 100) {
            return res.status(429).json({ error: 'Maximum number of messages reached' });
        }

        // Insert message
        const timestamp = new Date().toISOString();
        db.run(
            'INSERT INTO messages (name, text, timestamp) VALUES (?, ?, ?)',
            [name.trim(), text.trim(), timestamp],
            function(err) {
                if (err) {
                    console.error('Error inserting message:', err);
                    res.status(500).json({ error: 'Failed to save message' });
                } else {
                    res.status(201).json({
                        id: this.lastID,
                        name: name.trim(),
                        text: text.trim(),
                        timestamp: timestamp
                    });
                }
            }
        );
    });
});

// Track visitor
app.post('/api/visitors', (req, res) => {
    const { visitorId } = req.body;

    if (!visitorId) {
        return res.status(400).json({ error: 'Visitor ID is required' });
    }

    // Try to insert visitor (will fail silently if already exists)
    db.run(
        'INSERT OR IGNORE INTO visitors (visitor_id) VALUES (?)',
        [visitorId],
        (err) => {
            if (err) {
                console.error('Error tracking visitor:', err);
            }

            // Get total visitor count
            db.get('SELECT COUNT(*) as count FROM visitors', [], (err, row) => {
                if (err) {
                    console.error('Error counting visitors:', err);
                    res.status(500).json({ error: 'Failed to get visitor count' });
                } else {
                    res.json({ count: row.count });
                }
            });
        }
    );
});

// Get visitor count
app.get('/api/visitors/count', (req, res) => {
    db.get('SELECT COUNT(*) as count FROM visitors', [], (err, row) => {
        if (err) {
            console.error('Error counting visitors:', err);
            res.status(500).json({ error: 'Failed to get visitor count' });
        } else {
            res.json({ count: row.count });
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
