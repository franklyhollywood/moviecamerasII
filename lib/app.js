const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});



// route #1 get all cameras
app.get('/moviecamerasII', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT 
moviecamerasII.id, 
moviecamerasII.make,
moviecamerasII.model,
moviecamerasII.image,
moviecamerasII.year_made,
moviecamerasII.sound,
lenses.lens_type

FROM moviecamerasII
JOIN lenses
ON moviecamerasII.lens_id = lenses.id`);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});



// route #2 get all Lenses
app.get('/lenses', async(req, res) => {
  try {
    const data = await client.query('SELECT * from lenses');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// route #3 get one Lens by ID
app.get('/lenses/:id', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT * from lenses
    WHERE id = $1`, [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


// Route #4 - Get one camera
app.get('/moviecamerasII/:id', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT 
moviecamerasII.id, 
moviecamerasII.make,
moviecamerasII.model, 
moviecamerasII.image,
moviecamerasII.year_made,
moviecamerasII.sound,
lenses.lens_type,
moviecamerasII.lens_id

FROM moviecamerasII
JOIN lenses
ON moviecamerasII.lens_id = lenses.id WHERE moviecamerasII.id=$1`, [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// route 5 post new Lenses
app.post('/lenses', async(req, res) => {
  try {
    const data = await client.query(`INSERT into lenses (lens_type)
    VALUES ($1) RETURNING *`, ([req.body.lens_type]));
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// route #6 post new camera
app.post('/moviecamerasII', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT into moviecamerasII (make, model, image, year_made, sound, lens_id)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, ([req.body.make, req.body.model, req.body.image, req.body.year_made, req.body.sound, req.body.lens_id]));
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});



// Route #7 - delete Single camera /id
app.delete('/moviecamerasII/:id', async(req, res) => {
  try {
    const data = await client.query('DELETE from moviecamerasII where id=$1 RETURNING *', [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


// route #8 edit camera
app.put('/moviecamerasII/:id', async(req, res) => {
  try {
    const data = await client.query(`
    UPDATE moviecamerasII 
    SET make = $1, model = $2, image = $3, year_made = $4, sound = $5
    WHERE id = $6 RETURNING *`, ([req.body.make, req.body.model, req.body.image, req.body.year_made, req.body.sound, req.params.id]));
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));
 
module.exports = app;


//route 9 delete lens
//route 10 edit lens