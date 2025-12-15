const { MongoClient } = require("mongodb")

const state = {
  db: null,
};

// const password = encodeURIComponent("MARAMKULAMBIL");

// mongodb connection string
// const url = "mongodb://0.0.0.0:27017";
const url = process.env.MONGODB_URI || process.env.DB_URL || '';
// database name
const dbName = "DIIA-Website";

if (!url) {
  console.error('[WARNING] MONGODB_URI environment variable is not set. Database operations will fail.');
}

// create a new mongodb client object
const client = new MongoClient(url);

// function to establish mongodb connection
const connect = async (cb) => {
  if (state.db) {
    return cb ? cb() : Promise.resolve();
  }

  if (!url) {
    const err = new Error('MONGODB_URI is not defined');
    return cb ? cb(err) : Promise.reject(err);
  }

  try {
    // connecting to mongodb
    await client.connect();
    // setting up database name to the connected client
    const db = client.db(dbName);
    // setting up database name to the state
    state.db = db;
    // callback after connected
    return cb ? cb() : Promise.resolve();
  } catch (err) {
    // callback when an error occurs
    return cb ? cb(err) : Promise.reject(err);
  }
};



// function to get the database instance
const get = () => state.db;

// exporting functions
module.exports = {
  connect,
  get,
};


