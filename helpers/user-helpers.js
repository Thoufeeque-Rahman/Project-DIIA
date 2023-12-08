const collection = require('../config/collection')
const bcrypt = require('bcryptjs')
const db = require('../config/connection')

module.exports = {
    readFeed: (id) => {
        return new Promise(async (resolve, reject) => {
            let feed = await db.get().collection(collection.FEED_COLLECTION).find(id).toArray()
            let relatedFeeds = await db.get().collection(collection.FEED_COLLECTION).find().sort({ _id: -1 }).limit(15).toArray()

            console.log(feed);
            console.log(relatedFeeds);
            resolve({ feed, relatedFeeds })
        })
    },
    getFeed: () => {
        return new Promise(async (resolve, reject) => {
            let feed = await db.get().collection(collection.FEED_COLLECTION).find().sort({ _id: -1 }).limit(4).toArray()
            resolve(feed)
        })
    },
    getPhoto: () => {
        return new Promise(async (resolve, reject) => {
            let photo = await db.get().collection(collection.PHOTO_COLLECTION).find().sort({ _id: -1 }).limit(8).toArray()
            resolve(photo)
        })
    },
    getForm: () => {
        return new Promise(async (resolve, reject) => {
            let form = await db.get().collection(collection.FORM_COLLECTION).find().sort({ _id: 1 }).limit(4).toArray()
            resolve(form)
        })
    },
}