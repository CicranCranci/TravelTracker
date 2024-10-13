import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pkg from 'pg';
const { Pool } = pkg;


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set up database connection using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

// Configure multer for file uploads
const upload = multer({ dest: 'public/uploads/' });

// Set rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure Helmet for security
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "https://api.unsplash.com"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", "https://api.unsplash.com"],
    imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
  },
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Render homepage with visited countries
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT country_code FROM visited_countries');
    const countryCodes = result.rows.map(row => row.country_code);

    const visitedCountriesResult = await pool.query(
      'SELECT country_name FROM countries WHERE country_code = ANY($1::text[])',
      [countryCodes]
    );
    const visitedCountries = visitedCountriesResult.rows.map(row => row.country_name);

    res.render('index', {
      countries: countryCodes,
      total: countryCodes.length,
      visitedCountries,
      error: null
    });
  } catch (err) {
    console.error(err);
    res.render('index', { countries: [], total: 0, visitedCountries: [], error: 'Error fetching countries' });
  }
});

// Add country to visited countries with validation
app.post('/add', [
  body('country').trim().notEmpty().withMessage('Country name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userInput = req.body.country.trim().toLowerCase();
  try {
    const result = await pool.query(
      'SELECT country_code FROM countries WHERE LOWER(country_name) = $1',
      [userInput]
    );

    if (result.rows.length > 0) {
      const countryCode = result.rows[0].country_code;
      await pool.query(
        'INSERT INTO visited_countries (country_code) VALUES ($1) ON CONFLICT DO NOTHING',
        [countryCode]
      );
    }

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Get country name suggestions based on input
app.get('/suggestions', async (req, res) => {
  const query = req.query.q.trim().toLowerCase();
  try {
    const result = await pool.query(
      `SELECT country_name FROM countries WHERE country_name ILIKE '%' || $1 || '%' LIMIT 10`,
      [query]
    );
    const suggestions = result.rows.map(row => row.country_name);
    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching suggestions');
  }
});

// Get list of visited countries
app.get('/visited-countries', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT country_name FROM countries WHERE country_code IN (SELECT country_code FROM visited_countries) LIMIT 100'
    );
    const visitedCountries = result.rows.map(row => row.country_name);
    res.json(visitedCountries);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching visited countries');
  }
});

// Get country info by name
app.get('/country-info', async (req, res) => {
  const countryName = req.query.name.trim().toLowerCase();
  try {
    const result = await pool.query(
      'SELECT country_name, capital, population FROM infoCountries WHERE LOWER(country_name) = $1',
      [countryName]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Country not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching country info');
  }
});

// Get country code by country name
app.get('/country-code', async (req, res) => {
  const countryName = req.query.name.trim().toLowerCase();
  try {
    const result = await pool.query(
      'SELECT country_code FROM infoCountries WHERE LOWER(country_name) = $1',
      [countryName]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Country not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching country code');
  }
});

// Handle image upload for countries
app.post('/upload-image', upload.single('image'), async (req, res) => {
  const countryName = req.body.country;
  const file = req.file;

  const countryDir = path.join(__dirname, 'public', 'uploads', countryName);
  if (!fs.existsSync(countryDir)) {
    fs.mkdirSync(countryDir, { recursive: true });
  }

  const newPath = path.join(countryDir, file.originalname);
  fs.renameSync(file.path, newPath);

  res.json({ message: 'Image uploaded successfully' });
});

// Serve images for a country
app.get('/country-images', async (req, res) => {
  const countryName = req.query.name;
  const countryDir = path.join(__dirname, 'public', 'uploads', countryName);

  if (!fs.existsSync(countryDir)) {
    return res.json({ images: [] });
  }

  const images = fs.readdirSync(countryDir).map(file => `/uploads/${countryName}/${file}`);
  res.json({ images });
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});










