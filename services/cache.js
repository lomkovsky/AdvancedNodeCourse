const mongoose = require('mongoose');
const redis = require('redis');
const client = redis.createClient();
const util = require('util');
client.hget = util.promisify(client.hget);
client.hset = util.promisify(client.hset);
client.on("error", function(error) {
  console.error(error);
});

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = async function (options = {}) {  
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || 'default');
  return this;
};

mongoose.Query.prototype.exec = async function () {  
  try {
  if(!this.useCache) return exec.apply(this, arguments);
  const filter = this.getFilter()
  const collection = this.mongooseCollection.name;
  const key = JSON.stringify({...filter, collection  });
  const cachedQuery = await client.hget(this.hashKey, key) 
    if (cachedQuery) {
      console.log('in redis');
      const doc = JSON.parse(cachedQuery);
      return Array.isArray(doc) 
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
    }
  console.log('in mongo');
  const result = await exec.apply(this, arguments);
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10)
  return result;
  } catch (e) {console.log('e ===', e)}; 
}

module.exports = {

clearHash(hashKey) {
  console.log('in clearHash')  
  client.del(JSON.stringify(hashKey));
}
}