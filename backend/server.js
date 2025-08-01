const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./sat_study.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    total INTEGER,
    reading INTEGER,
    writing INTEGER,
    mathCalc INTEGER,
    mathNoCalc INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS wrong_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT,
    type TEXT,
    question TEXT,
    choices TEXT,
    correctAnswer TEXT,
    reviewed INTEGER DEFAULT 0
  )`);
});

app.post('/api/scores', (req, res) => {
  const { date, total, reading, writing, mathCalc, mathNoCalc } = req.body;
  db.run(`INSERT INTO scores (date, total, reading, writing, mathCalc, mathNoCalc)
          VALUES (?, ?, ?, ?, ?, ?)`, [date, total, reading, writing, mathCalc, mathNoCalc], function (err) {
    if (err) return res.status(500).send(err);
    res.send({ id: this.lastID });
  });
});

app.get('/api/scores', (req, res) => {
  db.all('SELECT * FROM scores ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.send(rows);
  });
});

app.post('/api/wrong-questions', (req, res) => {
  const { subject, type, question, choices, correctAnswer, reviewed } = req.body;
  db.run(`INSERT INTO wrong_questions (subject, type, question, choices, correctAnswer, reviewed)
          VALUES (?, ?, ?, ?, ?, ?)`,
    [subject, type, question, JSON.stringify(choices), correctAnswer, reviewed ? 1 : 0], function (err) {
    if (err) return res.status(500).send(err);
    res.send({ id: this.lastID });
  });
});

app.get('/api/wrong-questions', (req, res) => {
  db.all('SELECT * FROM wrong_questions ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.send(rows.map(row => ({ ...row, choices: JSON.parse(row.choices) })));
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
