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
    const data = await client.query('SELECT * from moviecamerasII');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// Route #2 - Single camera /id
app.get('/moviecamerasII/:id', async(req, res) => {
  try {
    const data = await client.query('SELECT * from moviecamerasII where id=$1', [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// route #3 post new cameras
app.post('/moviecamerasII', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT into moviecamerasII (make, model, image, year_made, sound)
    VALUES ($1, $2, $3, $4, $5)`, ([req.body.make, req.body.model, req.body.image, req.body.year_made, req.body.sound]));
    
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// Route #4 - delete Single camera /id
app.delete('/moviecamerasII/:id', async(req, res) => {
  try {
    const data = await client.query('DELETE from moviecamerasII where id=$1 RETURNING *', [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

// route #5 put new cameras
app.put('/moviecamerasII/:id', async(req, res) => {
  try {
    const data = await client.query(`
    UPDATE moviecamerasII 
    SET make = $1, model = $2, image = $3, year_made = $4, sound = $5
    WHERE id = $6`, ([req.body.make, req.body.model, req.body.image, req.body.year_made, req.body.sound, req.params.id]));
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));
 
module.exports = app;
