jest.setTimeout(30000);
require('../models/User');
require('../models/Blog');
const keys = require('../config/keys');

const mongoose = require('mongoose');
// mongoURITest = 'mongodb://taskapp:21122012@cluster0-shard-00-00.vax7t.mongodb.net:27017,cluster0-shard-00-01.vax7t.mongodb.net:27017,cluster0-shard-00-02.vax7t.mongodb.net:27017/blog_everyone_test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',

mongoose.Promise = global.Promise;
// mongoose.connect(mongoURITest, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });