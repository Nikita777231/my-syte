// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');

// соединение с PostgreSQL
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || 'postgres',
  database: process.env.DB_NAME     || 'mydb',
});

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Express ----------
// --- важный порядок middleware ---
// раздаём статику (index.html, css, js)
app.use(express.json()); // 1) парсим JSON
app.use(express.static('public')); // 2) раздаём статику

// ---------- Multer: приём файлов ----------
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, './public/uploads'),
  filename: (_, file, cb) => {
    // имя файла: <номер заказа>.<расширение>
    const ext = path.extname(file.originalname);
    cb(null, fieldname + ext); // "photo.jpg"
  }
});
const upload = multer({ storage });

// ---------- Статическая раздача картинок ----------
app.use('/uploads', express.static('uploads'));

// --- маршруты ---
// 1) получить заказ по номеру
app.get('/api/order/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM Заказы WHERE Номер_Заказа = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Не найдено' });
    res.json(rows[0]);                // первый найденный
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


// 2) создать новый заказ
app.post('/api/order', upload.single('photo'), async (req, res) => {
    const {Номер_Заказа, Высота, Ширина, Толщина, Цена, Адрес_Доставки} = req.body;
    const photoPath = req.file ? '/uploads/${req.file.filename}' : null;

    try {
        await pool.query(
            `INSERT INTO Заказы ("Номер_Заказа","Длинна","Ширина","Толщина","Цена","Адрес_Доставки","photo") VALUES ($1, $2, $3, $4, $5, $6, $7)`,[Номер_Заказа, Высота, Ширина, Толщина, Цена, Адрес_Доставки, photoPath]
        );
        res.json({ok: true});
    }catch (err) {
        console.error(err);
        if (err.code === '23505') {
            res.status(409).json({error: 'Такой заказ уже существует'});
        }else {
            res.status(500).json({error: 'Ошибка сервера'});
        }
    }
});

app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));