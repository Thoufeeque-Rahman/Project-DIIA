var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcryptjs')

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {

            let username = await db.get().collection(collection.CTRLER_COLLECTION).findOne({ username: userData.username })
            console.log(username)
            if (username) {
                resolve({ status: false })
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.CTRLER_COLLECTION).insertOne(userData).then((data) => {
                    userData.status = true
                    resolve(userData)

                })


            }
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.CTRLER_COLLECTION).findOne({ username: userData.username })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login Failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    editFeedgetFeed: (feedId) => {
        return new Promise(async (resolve, reject) => {
            let feed = await db.get().collection(collection.FEED_COLLECTION).findOne({ _id: feedId })
            resolve(feed)
        })
    },
    editFeed: (feed, callback) => {
        console.log(feed);
        db.get().collection(collection.FEED_COLLECTION).updateOne({ _id: feed.feedId },
            {
                $set: {
                    title: feed.title,
                    description: feed.description,
                    date: feed.date,
                    image: feed.image
                }
            }).then((response) => {
                callback(response)
            })
    },
    addFeed: (feed) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.FEED_COLLECTION).insertOne(feed).then((data) => {
                resolve(data)
            })
        })
    },
    getFeed: (feedId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.FEED_COLLECTION).findOne({ _id: feedId }).then((feed) => {
                console.log(feed);
                resolve(feed)
            })
        })
    },
    updateFeed: (feed) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.FEED_COLLECTION).updateOne({ _id: feed._id },
                {
                    $set: {
                        title: feed.title,
                        description: feed.description,
                        content: feed.content,
                        date: feed.date,
                        photo: feed.photo
                    }
                }).then((response) => {
                    resolve(response)
                })
        })
    },
    addPhoto: (photo) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PHOTO_COLLECTION).insertOne(photo).then((data) => {
                resolve(data)
            })
        })
    },
    getPhoto: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PHOTO_COLLECTION).find().sort({ _id: -1 }).toArray().then((photos) => {
                console.log(photos);
                resolve(photos)
            })
        })
    },
    addForm: (form) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.FORM_COLLECTION).insertOne(form).then((data) => {
                resolve(data)
            })
        })
    },
    addAnnouncement : (announcement) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ANNOUNCEMENT_COLLECTION).insertOne(announcement).then((data) => {
                resolve(data)
            })
        })
    },
    addNotification : (notification) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.NOTIFICATION_COLLECTION).insertOne(notification).then((data) => {
                resolve(data)
            })
        })
    },
    getNotification : (notiId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.NOTIFICATION_COLLECTION).find({_id: notiId}).sort({ _id: -1 }).toArray().then((notification) => {
                
                resolve(notification)
            })
        })
    },
    getAnnouncement : (annId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ANNOUNCEMENT_COLLECTION).find({_id: annId}).sort({ _id: -1 }).toArray().then((announcement) => {
                
                resolve(announcement)
            })
        })
    },

    //Computer Lab
    doSuperSignup:(userData)=>{
        return new Promise(async (resolve, reject) => {

            let username = await db.get().collection(collection.SUPERVISOR_COLLECTION).findOne({ username: userData.username })
            console.log(username)
            if (username) {
                resolve({ status: false })
            } else {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.SUPERVISOR_COLLECTION).insertOne(userData).then((data) => {
                    userData.status = true
                    resolve(userData)

                })


            }
        })
    }, 
    doSuperLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.SUPERVISOR_COLLECTION).findOne({ username: userData.username })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login Failed");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    // userSuggestion: (input, callback) => {
    //     const students = db.collection(collection.STUDENTS_COLLECTION);
    //     students.findOne({ 'ad.no': input }, (err, result) => {
    //         if (err) {
    //             console.error('Error querying MongoDB:', err);
    //             callback({ error: 'Internal server error' });
    //         } else if (!result) {
    //             callback({ error: 'Username not found' });
    //         } else {
    //             callback({ username: result.student.name });
    //         }
    //     });
    // },
    addData: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DATA_COLLECTIONS).insertOne(data).then((response) => {
                resolve(response)
            })
        })
    }
      

}