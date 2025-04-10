const bcrypt = require('bcryptjs');

const plainPassword = 'Admin@123';

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(plainPassword, salt, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password:', hash);
  });
});
