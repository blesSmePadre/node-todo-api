const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    required: true,
    trim: true,
    type: String,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      requried: true,
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.generateAuthToken = function() {
  try {
    const user = this;
    const token = user.tokens.find(token => token.access === 'auth');

    if (!token) {
      const access = 'auth';
      const token = jwt.sign({
        _id: user._id.toHexString(),
        access
      }, process.env.JWT_SECRET).toString();

      user.tokens.push({
        access,
        token
      });

      return user.save().then(() => {
        return token;
      });
    } else {
      return Promise.resolve(token.token);
    }
  }
  catch(e) {
    console.log(e);
  }
}

UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['_id', 'email']);
}

UserSchema.methods.removeToken = function(token) {
  const user = this;

  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
}

UserSchema.statics.findByToken = function(token) {
  const User = this;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return User.findOne({
      '_id': decodedToken._id,
      'tokens.token': token,
      'tokens.access': 'auth'
    });
  }
  catch(e) {
    return Promise.reject(e);
  }
}

UserSchema.statics.findByCredentials = function(email, password) {
  const User = this;

  return User.findOne({email})
    .then(user => {
      if (!user) {
        return Promise.reject(new Error('no user'));
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err || !result) {
            reject(new Error('invalid password'));
          } else {
            resolve(user);
          }
        });
      });
    });
}

UserSchema.pre('save', function (next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  }
  else {
    next();
  }
})

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};
