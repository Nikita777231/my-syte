require('dotenv').config();
const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { Pool } = require('pg');

// создаём папку uploads
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// подключение к PostgreSQL
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASS     || '', // пароль можно брать из .env
  database: process.env.DB_NAME     || 'mydb',
});

const app  = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json()); // для JSON
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, 'uploads'),
  filename:    (_, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// функция валидации чисел
function validateNumbers(...nums) {
  return nums.every(n => n !== undefined && n !== null && !isNaN(Number(n)));
}

/* ---------- ROUTES ---------- */

// 1. Получить заказ по номеру
app.get('/api/order/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM "Заказы" WHERE "Номер_Заказа" = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Не найдено' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET error', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 2. Создать заказ (с фото)
app.post('/api/order', upload.single('photo'), async (req, res) => {
  const { orderId, length, width, height, price, address } = req.body;
  if (!orderId) return res.status(400).json({ error: 'Номер заказа не указан' });

  if (!validateNumbers(length, width, height, price)) {
    return res.status(400).json({ error: 'Некорректные числовые значения' });
  }

  const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    await pool.query(
      `INSERT INTO "Заказы" ("Номер_Заказа","Высота","Ширина","Толщина","Цена","Адрес_Доставки","photo")
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [orderId, length, width, height, price, address, photoPath]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('POST error', e);
    res.status(e.code === '23505' ? 409 : 500)
       .json({ error: e.code === '23505' ? 'Заказ с таким номером уже есть' : e.message });
  }
});

// 3. Обновить заказ по номеру
app.put('/api/order/:id', upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const { orderId, length, width, height, price, address, oldPhoto } = req.body;

  if (!validateNumbers(length, width, height, price)) {
    return res.status(400).json({ error: 'Некорректные числовые значения' });
  }

  const photoPath = req.file
    ? `/uploads/${req.file.filename}`
    : (oldPhoto && oldPhoto.trim() !== '' ? oldPhoto : null);

  try {
    const { rowCount } = await pool.query(
      `UPDATE "Заказы"
       SET "Высота" = $1,
           "Ширина" = $2,
           "Толщина" = $3,
           "Цена" = $4,
           "Адрес_Доставки" = $5,
           "photo" = COALESCE($6, photo)
       WHERE "Номер_Заказа" = $7`,
      [length, width, height, price, address, photoPath, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Не найдено' });
    res.json({ ok: true });
  } catch (e) {
    console.error('UPDATE error', e);
    res.status(500).json({ error: e.message });
  }
});

// 4. Общий обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error', err);
  res.status(500).json({ error: err.message });
});

/* ---------- START ---------- */
app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));