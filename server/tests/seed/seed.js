const jwt = require('jsonwebtoken');

const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'userone@example.com',
  password: 'useronepassword',
  tokens: [{
    access: 'auth',
    token: jwt.sign({
      _id: userOneId.toHexString(),
      access: 'auth'
    }, 'valarmorgulis').toString()
  }]
}, {
  _id: userTwoId,
  email: 'usertwo@example.com',
  password: 'usertwopassword'
}];

const todos = [
  {
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId,
  },
  {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 1507972380851,
    _creator: userTwoId
  }
];

const populateTodos = done => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  })
  .then(() => done());
};

const populateUsers = done => {
  User.remove({}).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
};
