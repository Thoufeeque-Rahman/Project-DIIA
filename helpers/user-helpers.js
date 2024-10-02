const collection = require('../config/collection')
const bcrypt = require('bcryptjs')
const db = require('../config/connection')
const date = require('date-and-time');

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
    getPhotopage: () => {
        return new Promise(async (resolve, reject) => {
            let photo = await db.get().collection(collection.PHOTO_COLLECTION).find().sort({ _id: -1 }).toArray()
            resolve(photo)
        })
    },
    getForm: () => {
        return new Promise(async (resolve, reject) => {
            let Academics = await db.get().collection(collection.FORM_COLLECTION).find({formCategory: "ACADEMIC"}).sort({ _id: 1 }).toArray()
            let General = await db.get().collection(collection.FORM_COLLECTION).find({formCategory: "GENERAL"}).sort({ _id: 1 }).toArray()
            let Exam = await db.get().collection(collection.FORM_COLLECTION).find({formCategory: "EXAM"}).sort({ _id: 1 }).toArray()
            let form = await {Academics, General, Exam}
            console.log(form);
            resolve(form)
        })
    },
    getAnnouncement: () => {
        return new Promise(async (resolve, reject) => {
            
            let announcement = await db.get().collection(collection.ANNOUNCEMENT_COLLECTION).find({annStatus: "true"}).sort({ _id: -1 }).limit(3).toArray()
            for (let i = 0; i < announcement.length; i++) {
                console.log(announcement[i].date);
                const annDate = new Date(announcement[i].date);
                const todayDate = new Date();
                console.log(annDate);
                console.log(todayDate);
            
                const diffTime = Math.abs(todayDate - annDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
                console.log(diffDays);
                announcement[i].date = diffDays;
            }
            resolve(announcement)
        })
    },
    getCarousel: () => {
        return new Promise(async (resolve, reject) => {
            let carousel = await db.get().collection(collection.NOTIFICATION_COLLECTION).find({notiStatus: "true"}).sort({ _id: -1 }).limit(5).toArray()
            resolve(carousel)
        })
    },
    getSlide: () => {   
    return new Promise(async (resolve, reject) => {
        let carousel = await db.get().collection(collection.MEDIA_COLLECTION).find({slideStatus: "true"}).sort({ _id: -1 }).limit(5).toArray()
        resolve(carousel)
    }) 
}
}