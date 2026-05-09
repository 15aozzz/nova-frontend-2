const db = require('../db');

const getLaboratorios = (req, res) => {
    db.query(`SELECT * FROM laboratorio ORDER BY nombre ASC`, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
};

const getCategorias = (req, res) => {
    db.query(`SELECT * FROM categoria ORDER BY nombre ASC`, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
};

const getPresentaciones = (req, res) => {
    db.query(`SELECT * FROM presentacion ORDER BY nombre ASC`, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
};

const getCargos = (req, res) => {
    db.query(`SELECT * FROM cargo ORDER BY nombre ASC`, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
};

module.exports = { getLaboratorios, getCategorias, getPresentaciones, getCargos };
