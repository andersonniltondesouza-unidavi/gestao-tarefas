const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432
});

pool.query(`
    CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        status VARCHAR(50) DEFAULT 'Pendente'
    );
`).catch(err => console.error(err));

app.get('/api/tarefas', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM tarefas ORDER BY id DESC');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/tarefas', async (req, res) => {
    const { titulo, descricao } = req.body;
    try {
        const resultado = await pool.query(
            'INSERT INTO tarefas (titulo, descricao) VALUES ($1, $2) RETURNING *',
            [titulo, descricao]
        );
        res.status(201).json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tarefas/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE tarefas SET titulo = $1, descricao = $2 WHERE id = $3 RETURNING *',
            [titulo, descricao, id]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/tarefas/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const resultado = await pool.query(
            'UPDATE tarefas SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/tarefas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM tarefas WHERE id = $1', [id]);
        res.json({ message: 'Removida com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});