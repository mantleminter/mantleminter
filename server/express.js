const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// DB connect
const db = new sqlite3.Database('wallets.db', (err) => {
    if (err) {
        console.error('❌ Ошибка подключения к БД:', err.message);
    } else {
        console.log('✅ Подключено к базе данных wallets.db');
    }
});

// Check score
app.post('/api/check_wallet', (req, res) => {
    const { wallet_address } = req.body;
    if (!wallet_address) {
        return res.status(400).json({ error: 'wallet_address is required' });
    }

    db.get('SELECT score FROM wallets WHERE wallet_address = ?', [wallet_address], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (row) {
            console.log(`wallet_address: ${wallet_address}, score: ${row.score}`);
            res.json({ wallet_address, score: row.score });
        } else {
            res.json({ wallet_address, score: 0 });
        }
    });
});

app.post('/api/check_token', (req, res) => {
    const { wallet_address } = req.body;
    if (!wallet_address) {
        return res.status(400).json({ error: 'wallet_address is required' });
    }

    db.get(
        'SELECT token_address FROM tokens WHERE wallet_address = ? ORDER BY rowid DESC LIMIT 1',
        [wallet_address],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (row) {
                console.log(`wallet_address: ${wallet_address}, token_address: ${row.token_address}`);
                res.json({ wallet_address, token: row.token_address });
            } else {
                res.json({ wallet_address, token: "no data" });
            }
        }
    );
});





app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Express сервер запущен на http://localhost:${PORT}`);
});
