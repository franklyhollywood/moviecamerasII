const bcrypt = require('bcryptjs');
const client = require('../lib/client');
// import our seed data:
const { moviecamerasII } = require('./moviecamerasII.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');
const { lenses } = require('./lenses.js');
run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        const hash = bcrypt.hashSync(user.password, 8);
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, hash]);
      })
    );
      
    const user = users[0].rows[0];
    
    await Promise.all(
      lenses.map(lens => {
        return client.query(`
                    INSERT INTO lenses (lens_type)
                    VALUES ($1);
                `,
        [lens.lens_type]);
      })
    );

    await Promise.all(
      moviecamerasII.map(camera => {
        return client.query(`
                    INSERT INTO moviecamerasII (make, model, image, year_made, sound, lens_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [camera.make, camera.model, camera.image, camera.year_made, camera.sound, camera.lens_id]);
      })
    );
    


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
