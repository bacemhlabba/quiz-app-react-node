const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Adjust if needed
  database: 'test'
});

// Connect to MySQL
db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Récupérer toutes les questions (avec enonce et reponse)
app.get('/questions', (req, res) => {
  db.query('SELECT * FROM questions', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results); // Must include 'reponse' so Quiz can compare answers
  });
});

// Ajouter une question (enonce + reponse)
app.post('/questions', (req, res) => {
  const { enonce, reponse } = req.body;
  const sql = 'INSERT INTO questions (enonce, reponse) VALUES (?, ?)';
  db.query(sql, [enonce, reponse], (err) => {
    if (err) {
      res.json({ error: 'Erreur lors de l\'ajout de la question' });
    } else {
      res.json({ message: 'Question ajoutée avec succès' });
    }
  });
});

// Mettre à jour une question avec un paramètre :num
app.put('/questions/:num', (req, res) => {
  const { enonce, reponse } = req.body;
  const { num } = req.params;
  const sql = 'UPDATE questions SET enonce = ?, reponse = ? WHERE num = ?';
  db.query(sql, [enonce, reponse, num], (err, result) => {
    if (err) {
      res.json({ error: 'Erreur lors de la modification de la question' });
    } else if (result.affectedRows === 0) {
      res.json({ message: 'Question non trouvée' });
    } else {
      res.json({ message: 'Question modifiée avec succès' });
    }
  });
});

// Mettre à jour la question sans paramètre :num (front end usage)
app.put('/questions', (req, res) => {
  const { num, enonce, reponse } = req.body;
  const sql = 'UPDATE questions SET enonce = ?, reponse = ? WHERE num = ?';
  db.query(sql, [enonce, reponse, num], (err, result) => {
    if (err) {
      res.json({ error: 'Erreur lors de la modification de la question' });
    } else if (result.affectedRows === 0) {
      res.json({ message: 'Question non trouvée' });
    } else {
      res.json({ message: 'Question modifiée avec succès' });
    }
  });
});

// Supprimer une question
app.delete('/questions/:num', (req, res) => {
  const { num } = req.params;
  const sql = 'DELETE FROM questions WHERE num = ?';
  db.query(sql, [num], (err, result) => {
    if (err) {
      res.json({ error: 'Erreur lors de la suppression de la question' });
    } else if (result.affectedRows === 0) {
      res.json({ message: 'Aucune question trouvée avec ce numéro' });
    } else {
      res.json({ message: 'Question supprimée avec succès' });
    }
  });
});

// Rechercher des questions par mot-clé
app.get('/questions/recherche', (req, res) => {
  const { motCle } = req.query;
  const sql = 'SELECT * FROM questions WHERE enonce LIKE ?';
  db.query(sql, [`%${motCle}%`], (err, results) => {
    if (err) {
      res.json({ error: 'Erreur lors de la recherche' });
    } else {
      res.json(results);
    }
  });
});

// Lancement du serveur
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));