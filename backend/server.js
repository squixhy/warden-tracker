require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const ALLOWED_LOCATIONS = [
  'Alwyn Hall',
  'Beech Glade',
  'Bowers Building',
  'Burma Road Student Village',
  'Centre for Sport',
  'Chapel',
  'The Cottage',
  'Fred Wheeler Building',
  'Herbert Jarman Building',
  'Holm Lodge',
  'Kenneth Kettle Building',
  'King Alfred Centre',
  'Martial Rose Library',
  'Masters Lodge',
  'Medecroft',
  'Medecroft Annexe',
  'Paul Chamberlain Building',
  'Queen’s Road Student Village',
  'St Alphege',
  'St Edburga',
  'St Elizabeth’s Hall',
  'St Grimbald’s Court',
  'St James’ Hall',
  'St Swithun’s Lodge',
  'The Stripe',
  'Business School',
  'Tom Atkinson Building',
  'West Downs Centre',
  'West Downs Student Village',
  'Winton Building',
  'Students’ Union'
];


let poolPromise;
async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
      database: process.env.DB_DATABASE,
      options: {
        encrypt: process.env.DB_ENCRYPT ? process.env.DB_ENCRYPT === 'true' : true,
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    });
  }
  return poolPromise;
}

function validatePayload(body) {
  const { staffNumber, firstName, surname, location } = body;
  if (!staffNumber || !firstName || !surname || !location) {
    return 'staffNumber, firstName, surname, and location are required';
  }
  if (!ALLOWED_LOCATIONS.includes(location)) {
    return 'location must be one of the allowed campus locations';
  }
  return null;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/warden/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('staffNumber', sql.NVarChar(50), id)
      .query('SELECT staff_number AS staffNumber, first_name AS firstName, surname, location, created_at AS createdAt, last_updated AS lastUpdated FROM Wardens WHERE staff_number = @staffNumber');
    if (result.recordset.length === 0) {
      return res.json({ found: false });
    }
    res.json({ found: true, warden: result.recordset[0] });
  } catch (err) {
    console.error('GET /api/warden/:id error', err);
    res.status(500).json({ message: 'Failed to check warden status' });
  }
});

app.get('/api/wardens', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .query('SELECT staff_number AS staffNumber, first_name AS firstName, surname, location, created_at AS createdAt, last_updated AS lastUpdated FROM Wardens ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error('GET /api/wardens error', err);
    res.status(500).json({ message: 'Failed to fetch wardens' });
  }
});

app.post('/api/register', async (req, res) => {
  const validationError = validatePayload(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const { staffNumber, firstName, surname, location } = req.body;

  try {
    const pool = await getPool();
    await pool
      .request()
      .input('staffNumber', sql.NVarChar(50), staffNumber)
      .input('firstName', sql.NVarChar(100), firstName)
      .input('surname', sql.NVarChar(100), surname)
      .input('location', sql.NVarChar(100), location)
      .query(
        `INSERT INTO Wardens (staff_number, first_name, surname, location)
         VALUES (@staffNumber, @firstName, @surname, @location)`
      );
    res.status(201).json({ message: 'Warden registered successfully' });
  } catch (err) {
    console.error('POST /api/register error', err);
    if (err.number === 2627) {
      return res.status(409).json({ message: 'Staff number already exists' });
    }
    res.status(500).json({ message: 'Failed to register warden' });
  }
});

app.put('/api/update', async (req, res) => {
  const { staffNumber, location } = req.body;
  if (!staffNumber || !location) {
    return res.status(400).json({ message: 'staffNumber and location are required' });
  }
  if (!ALLOWED_LOCATIONS.includes(location)) {
    return res.status(400).json({ message: 'location must be one of the allowed campus locations' });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('staffNumber', sql.NVarChar(50), staffNumber)
      .input('location', sql.NVarChar(100), location)
      .query(
        `UPDATE Wardens
         SET location = @location,
             last_updated = SYSUTCDATETIME()
         WHERE staff_number = @staffNumber`
      );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Warden not found' });
    }
    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error('PUT /api/update error', err);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

app.put('/api/amend', async (req, res) => {
  const { staffNumber, firstName, surname, location } = req.body;
  if (!staffNumber) {
    return res.status(400).json({ message: 'staffNumber is required' });
  }
  if (!firstName && !surname && !location) {
    return res.status(400).json({ message: 'At least one field (firstName, surname, or location) must be provided' });
  }
  if (location && !ALLOWED_LOCATIONS.includes(location)) {
    return res.status(400).json({ message: 'location must be one of the allowed campus locations' });
  }

  try {
    const pool = await getPool();
    const request = pool.request().input('staffNumber', sql.NVarChar(50), staffNumber);
    
    const updates = [];
    if (firstName) {
      request.input('firstName', sql.NVarChar(100), firstName);
      updates.push('first_name = @firstName');
    }
    if (surname) {
      request.input('surname', sql.NVarChar(100), surname);
      updates.push('surname = @surname');
    }
    if (location) {
      request.input('location', sql.NVarChar(100), location);
      updates.push('location = @location');
    }
    updates.push('last_updated = SYSUTCDATETIME()');

    const result = await request.query(
      `UPDATE Wardens SET ${updates.join(', ')} WHERE staff_number = @staffNumber`
    );
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Warden not found' });
    }
    res.json({ message: 'Details amended successfully' });
  } catch (err) {
    console.error('PUT /api/amend error', err);
    res.status(500).json({ message: 'Failed to amend details' });
  }
});

app.delete('/api/checkout/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('staffNumber', sql.NVarChar(50), id)
      .query('DELETE FROM Wardens WHERE staff_number = @staffNumber');
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Warden not found' });
    }
    res.json({ message: 'Warden clocked off successfully' });
  } catch (err) {
    console.error('DELETE /api/checkout error', err);
    res.status(500).json({ message: 'Failed to clock off warden' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
