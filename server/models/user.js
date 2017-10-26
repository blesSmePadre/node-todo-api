const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
    const access = 'auth';
    const token = jwt.sign({
      _id: user._id.toHexString(),
      access
    }, 'valarmorgulis').toString();

    user.tokens.push({
      access,
      token
    });

    return user.save().then(() => {
      return token;
    });
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

const User = mongoose.model('User', UserSchema);

module.exports = {
  User
};
