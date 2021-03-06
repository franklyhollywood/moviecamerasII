const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
              ); 

              CREATE TABLE lenses (
                id SERIAL PRIMARY KEY NOT NULL,
                lens_type VARCHAR(512) NOT NULL
        
          );
                CREATE TABLE moviecamerasII (
                    id SERIAL PRIMARY KEY NOT NULL,
                    make VARCHAR(512) NOT NULL,
                    model VARCHAR(512) NOT NULL,
                    image VARCHAR(512) NOT NULL,
                    year_made INTEGER NOT NULL,
                    sound BOOLEAN NOT NULL,
                    lens_id INTEGER NOT NULL REFERENCES lenses(id)

              );
            
             
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
