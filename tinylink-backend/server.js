require('dotenv').config();
const express = require('express');
const db = require('./db');
const cors = require("cors")
const validUrl = require('valid-url');
const { customAlphabet } = require('nanoid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 7);

//health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: process.env.APP_VERSION || '1.0' });
});

// helper validate code
function isValidCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

// create link
app.post('/api/links', async (req, res) => {
  try {
    const { url, code } = req.body;
    if (!url || typeof url !== 'string' || !validUrl.isWebUri(url)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    let finalCode = code ? String(code).trim() : nano();
    if (code) {
      if (!isValidCode(finalCode)) {
        return res.status(400).json({ error: 'Custom code must be 6-8 alphanumeric characters' });
      }
    }
        // check duplicate
    const { rows: existing } = await db.query(
      'SELECT id, deleted FROM short_links WHERE code = $1',
      [finalCode]
    );
    if (existing.length > 0 && !existing[0].deleted) {
      return res.status(409).json({ error: 'Code already exists' });
    }

    if (existing.length > 0 && existing[0].deleted) {
      // if previously deleted, update
      await db.query(
        `UPDATE short_links SET url=$1, deleted=false, clicks=0, last_clicked=NULL WHERE code=$2`,
        [url, finalCode]
      );
      const row = (await db.query('SELECT * FROM short_links WHERE code=$1', [finalCode])).rows[0];
      return res.status(201).json(row);
    }
        // insert new
    const insertRes = await db.query(
      `INSERT INTO short_links(code, url) VALUES($1, $2) RETURNING *`,
      [finalCode, url]
    );
    return res.status(201).json(insertRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// list all links
app.get('/api/links', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT code, url, clicks, last_clicked, created_at FROM short_links WHERE deleted=false ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// get stats for one code
app.get('/api/links/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const { rows } = await db.query('SELECT code, url, clicks, last_clicked, created_at FROM short_links WHERE code=$1 AND deleted=false', [code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// delete link
app.delete('/api/links/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const { rowCount } = await db.query('UPDATE short_links SET deleted=true WHERE code=$1 AND deleted=false', [code]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// redirect endpoint - must be last (so /api routes don't intercept)
app.get('/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const { rows } = await db.query('SELECT url, deleted FROM short_links WHERE code=$1', [code]);
    if (rows.length === 0 || rows[0].deleted) return res.status(404).send('Not found');

    const url = rows[0].url;
    // increment clicks & update last_clicked
    await db.query('UPDATE short_links SET clicks = clicks + 1, last_clicked = now() WHERE code=$1', [code]);

    // 302 redirect
    res.redirect(302, url);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal error');
  }
});

app.listen(PORT, () => {
  console.log(`TinyLink server listening on ${PORT}`);
});