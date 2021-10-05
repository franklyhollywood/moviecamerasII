require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns moviecameras', async() => {

      const expectation = [ 
        {
          'id': 1,
          'make': 'Beaulieu',
          'model': '9008S',
          'image': 'https://i.pinimg.com/originals/d6/d5/d0/d6d5d0583a32a1dbfe50e3551729588c.jpg',
          'year_made': 1993,
          'sound': true
          ''
        },
        
        {
          'id': 2,
          'make': 'Cannon',
          'model': '1014XLS',
          'image': 'https://global.canon/ja/c-museum/wp-content/uploads/2015/05/cine300_b.jpg',
          'year_made': 1979,
          'sound': true
        },
        
        {
          'id': 3,
          'make': 'Elmo',
          'model': '1012SXL',
          'image': 'http://www.mondofoto.com/cameras/Elmo_1012S-XL_2a.jpg',
          'year_made': 1978,
          'sound': true
        },
        
        {
          'id': 4,
          'make': 'Leicina',
          'model': 'Special',
          'image': 'https://lhsa.org/wp-content/uploads/2019/03/Leicina-Special-with-6-66mm-f_1.8-Leitz-Optivaron-zoom-lens-960x430.jpg',
          'year_made': 1972,
          'sound': true
        },
        
        {
          'id': 5,
          'make': 'Nizo',
          'model': '6080',
          'image': 'https://www.super8camera.com/images/nizo-6080.jpg',
          'year_made': 1980,
          'sound': true
           
        }
      ]; 

      const data = await fakeRequest(app)
        .get('/moviecamerasII')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });



    test('returns one moviecameras', async() => {

      const expectation =  
        {
          'id': 1,
          'make': 'Beaulieu',
          'model': '9008S',
          'image': 'https://i.pinimg.com/originals/d6/d5/d0/d6d5d0583a32a1dbfe50e3551729588c.jpg',
          'year_made': 1993,
          'sound': true
        };
        
      const data = await fakeRequest(app)
        .get('/moviecamerasII/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    


    test('returns one edited moviecamera', async() => {

      const expectation =  
        {
          'id': 2,
          'make': 'testmake',
          'model': 'testmodel',
          'image': 'testimage',
          'year_made': 1993,
          'sound': true
        };
      const body = {
        'make': 'testmake',
        'model': 'testmodel',
        'image': 'testimage',
        'year_made': 1993,
        'sound': true
      }; 
      const data = await fakeRequest(app)
        .put('/moviecamerasII/2')
        .send(body)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('returns one newly entered camera', async() => {

      const expectation =  
        {
          'id': expect.any(Number),
          'make': 'testsuper8',
          'model': 'testmodel',
          'image': 'https://www.google.com/imgres?imgurl=http%3A%2F%2Fsuper8wiki.com%2Fimages%2F9%2F98%2FBeaulieu9008S_16-9.JPG&imgrefurl=http%3A%2F%2Fsuper8wiki.com%2Findex.php%2FBeaulieu_9008_S_16%3A9&tbnid=IJn4xG5_yRJ-MM&vet=12ahUKEwjTqdm366fzAhWzAzQIHR80BZoQMygAegUIARCEAQ..i&docid=jXpgENO0Jw8Y0M&w=500&h=375&itg=1&q=beaulieu%209008S&ved=2ahUKEwjTqdm366fzAhWzAzQIHR80BZoQMygAegUIARCEAQ',
          'year_made': 1993,
          'sound': true
        };
      const body = {
        
        'make': 'testsuper8',
        'model': 'testmodel',
        'image': 'https://www.google.com/imgres?imgurl=http%3A%2F%2Fsuper8wiki.com%2Fimages%2F9%2F98%2FBeaulieu9008S_16-9.JPG&imgrefurl=http%3A%2F%2Fsuper8wiki.com%2Findex.php%2FBeaulieu_9008_S_16%3A9&tbnid=IJn4xG5_yRJ-MM&vet=12ahUKEwjTqdm366fzAhWzAzQIHR80BZoQMygAegUIARCEAQ..i&docid=jXpgENO0Jw8Y0M&w=500&h=375&itg=1&q=beaulieu%209008S&ved=2ahUKEwjTqdm366fzAhWzAzQIHR80BZoQMygAegUIARCEAQ',
        'year_made': 1993,
        'sound': true
      }; 
      const data = await fakeRequest(app)
        .post('/moviecamerasII')
        .send(body)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes one camera', async() => {

      const expectation =  
        {
          'id': 5,
          'make': 'Nizo',
          'model': '6080',
          'image': 'https://www.super8camera.com/images/nizo-6080.jpg',
          'year_made': 1980,
          'sound': true
        };
      
      const data = await fakeRequest(app)
        .delete('/moviecamerasII/5')
        .expect('Content-Type', /json/)
        .expect(200);

      const deletedEntry = await fakeRequest(app)
        .get('/moviecamerasII/5')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
      expect(deletedEntry.body).toEqual('');
    });

  });
});
