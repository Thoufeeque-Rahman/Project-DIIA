var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcryptjs')
const { ObjectId } = require('mongodb')
const userHelpers = require('./user-helpers')
const { response } = require('express')
const { promises } = require('nodemailer/lib/xoauth2')
const { ObjectID } = require('mongodb'); 

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
    addFestDocs: (docs) => {
        return new Promise((resolve, reject) => {
            // Merge formName, formSection, and formCategory to create formNames
            docs.formNames = `${docs.formTitle}-${docs.formSection}-${docs.formCategory}`;
            
    
            db.get().collection(collection.FEST_COLLECTION).insertOne(docs).then((data) => {
                resolve(data);
            })
        });
    },
    // // updateFestDocs : (docs) => {
    // //     return new Promise((resolve, reject) => {
    // //         try {
    // //             // Update the document in the database
    // //             db.get().collection(collection.FEST_COLLECTION).updateOne(
    // //                 { _id: docs._id },
    // //                 {
    // //                     $set: {
    // //                         formTitle: docs.formTitle,
    // //                         formSection: docs.formSection,
    // //                         formCategory: docs.formCategory,
    // //                         fileURL: docs.fileURL,
    // //                         formNames: docs.formNames,
    // //                         updatedAt: docs.updatedAt // Ensure updatedAt is set
    // //                     }
    // //                 },
    // //                 (err, result) => {
    // //                     if (err) {
    // //                         console.error('Error updating document:', err);
    // //                         return reject(err);
    // //                     }
    // //                     resolve(result);
    // //                 }
    // //             );
    // //         } catch (error) {
    // //             console.error('Caught error in updateFestDocs:', error);
    // //             reject(error);
    // //         }
    // //     });
    // // }
    // ,
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
    addData: (data) => {
        return new Promise((resolve, reject) => {
          db.get().collection(collection.DATA_COLLECTIONS).insertOne(data)
            .then(async (response) => {
              if (data.userpurpose === "Personal" || data.userpurpose === "Class") {
                try {
                  const userIdStr = data.userId;
                  const userIdInt = parseInt(data.userId);
      
                  // Attempt to find user data using userId as string
                  let userData = await db.get().collection(collection.DATABASE_COLLECTIONS).findOne({ userId: userIdStr });
      
                  // If not found, attempt to find user data using userId as integer
                  if (!userData && !isNaN(userIdInt)) {
                    userData = await db.get().collection(collection.DATABASE_COLLECTIONS).findOne({ userId: userIdInt });
                  }
      
                  if (userData) {
                    // Add 5 to the rent
                    const updatedRent = (userData.rent || 0) + 5;
                    const updateResult = await db.get().collection(collection.DATABASE_COLLECTIONS).updateOne(
                      { _id: userData._id },
                      { $set: { rent: updatedRent } }
                    );
      
                    console.log(`Rent updated for userId ${userData.userId}: New rent is ${updatedRent}`);
                    console.log("Update result:", updateResult);
                  } else {
                    // If no userData, initialize rent with 5 rupees
                    const initialRent = 5;
                    const newUserId = isNaN(userIdInt) ? userIdStr : userIdInt;
                    const insertResult = await db.get().collection(collection.DATABASE_COLLECTIONS).insertOne({
                      userId: newUserId,
                      rent: initialRent
                    });
      
                    console.log(`Initialized rent for userId ${newUserId} with ${initialRent} rupees`);
                  }
                } catch (error) {
                  console.error("Error updating/inserting rent:", error);
                  reject(error);
                }
              }
              resolve(response);
            })
            .catch((error) => {
              console.error("Error inserting data:", error);
              reject(error);
            });
        });
      },
      
    //   updateRent: (data) => {
    //     return new Promise((resolve, reject) => {
    //       let userId = data.userId;
      
    //       // Convert userId to integer if possible
    //       if (typeof userId === 'string' && !isNaN(userId)) {
    //         userId = parseInt(userId);
    //       }
      
    //       // Find user data by userId
    //       db.get().collection(collection.DATABASE_COLLECTIONS).findOne({ userId })
    //         .then(async (userData) => {
    //           if (userData) {
    //             // Check if userpurpose is "Personal" or "Class"
    //             if (data.userpurpose === "Personal" || data.userpurpose === "Class") {
    //               // Reduce rent by 5
    //               const reducedRent = (userData.rent || 0) - 5;
      
    //               // Update the rent in the database
    //               const updateResult = await db.get().collection(collection.DATABASE_COLLECTIONS).updateOne(
    //                 { _id: userData._id },
    //                 { $set: { rent: reducedRent } }
    //               );
      
    //               console.log(`Rent reduced by 5 for userId ${userId}: New rent is ${reducedRent}`);
    //               console.log("Update result:", updateResult);
      
    //               resolve(updateResult);
    //             } else {
    //               // No rent reduction needed, resolve with null
    //               console.log(`No rent reduction needed for userId ${userId}`);
    //               resolve(null);
    //             }
    //           } else {
    //             console.log(`No data found for userId ${userId}`);
    //             resolve(null); // Resolve with null if no user data found
    //           }
    //         })
    //         .catch((error) => {
    //           console.error("Error updating rent:", error);
    //           reject(error);
    //         });
    //     });
    //   },

    deleteData: (data) => {
        return new Promise((resolve, reject) => {
            const dataId = data._id; // Directly use data._id since it's already an ObjectId
    
            // Ensure dataId is provided
            if (!dataId) {
                reject(new Error('Missing _id in data'));
                return;
            }
    
            // Convert dataId to ObjectId if it's a string
            const objectId = typeof dataId === 'string' ? new ObjectId(dataId) : dataId;
    
            // Delete document from DATA_COLLECTIONS based on _id
            db.get().collection(collection.DATA_COLLECTIONS).deleteOne({ _id: objectId })
                .then(async (deleteResult) => {
                    if (deleteResult.deletedCount > 0) {
                        console.log(`Deleted document with _id ${dataId}`);
    
                        // Reduce rent if userpurpose is "Personal" or "Class"
                        if (data.userpurpose === "Personal" || data.userpurpose === "Class") {
                            try {
                                const userId = data.userId;
    
                                // Try to find user data by userId (as string first)
                                let userData = await db.get().collection(collection.DATABASE_COLLECTIONS).findOne({ userId: userId });
    
                                // If not found, try userId as integer
                                if (!userData) {
                                    const userIdInt = parseInt(userId);
                                    if (!isNaN(userIdInt)) {
                                        userData = await db.get().collection(collection.DATABASE_COLLECTIONS).findOne({ userId: userIdInt });
                                    }
                                }
    
                                if (userData) {
                                    // Reduce rent by 5
                                    const reducedRent = (userData.rent || 0) - 5;
    
                                    // Update the rent in the database
                                    const updateResult = await db.get().collection(collection.DATABASE_COLLECTIONS).updateOne(
                                        { _id: userData._id },
                                        { $set: { rent: reducedRent } }
                                    );
    
                                    console.log(`Rent reduced by 5 for userId ${userId}: New rent is ${reducedRent}`);
                                    console.log("Update result:", updateResult);
                                } else {
                                    console.log(`No user data found for userId ${userId}`);
                                }
                            } catch (error) {
                                console.error("Error reducing rent:", error);
                                reject(error);
                            }
                        }
    
                        resolve(deleteResult);
                    } else {
                        console.log(`No document found with _id ${dataId}`);
                        resolve(null); // Resolve with null if no document was deleted
                    }
                })
                .catch((error) => {
                    console.error("Error deleting document:", error);
                    reject(error);
                });
        });
    },
      
            })
            .catch((error) => {
              console.error("Error inserting data:", error);
              reject(error);
            });
        });
      },
      
    //   updateRent: (data) => {
    //     return new Promise((resolve, reject) => {
    //       let userId = data.userId;
      
    //       // Convert userId to integer if possible
    //       if (typeof userId === 'string' && !isNaN(userId)) {
    //         userId = parseInt(userId);
    //       }
      
    //       // Find user data by userId
    //       db.get().collection(collection.DATABASE_COLLECTIONS).findOne({ userId })
    //         .then(async (userData) => {
    //           if (userData) {
    //             // Check if userpurpose is "Personal" or "Class"
    //             if (data.userpurpose === "Personal" || data.userpurpose === "Class") {
    //               // Reduce rent by 5
    //               const reducedRent = (userData.rent || 0) - 5;
      
    //               // Update the rent in the database
    //               const updateResult = await db.get().collection(collection.DATABASE_COLLECTIONS).updateOne(
    //                 { _id: userData._id },
    //                 { $set: { rent: reducedRent } }
    //               );
      
    //               console.log(`Rent reduced by 5 for userId ${userId}: New rent is ${reducedRent}`);
    //               console.log("Update result:", updateResult);
      
    //               resolve(updateResult);
    //             } else {
    //               // No rent reduction needed, resolve with null
    //               console.log(`No rent reduction needed for userId ${userId}`);
    //               resolve(null);
    //             }
    //           } else {
    //             console.log(`No data found for userId ${userId}`);
    //             resolve(null); // Resolve with null if no user data found
    //           }
    //         })
    //         .catch((error) => {
    //           console.error("Error updating rent:", error);
    //           reject(error);
    //         });
    //     });
    //   },

    deleteData: (data) => {
        return new Promise((resolve, reject) => {
            const dataId = data._id; // Directly use data._id since it's already an ObjectId
    
            // Ensure dataId is provided
            if (!dataId) {
                reject(new Error('Missing _id in data'));
                return;
            }
    
            // Convert dataId to ObjectId if it's a string
            const objectId = typeof dataId === 'string' ? new ObjectId(dataId) : dataId;
    
            // Delete document from DATA_COLLECTIONS based on _id
            db.get().collection(collection.DATA_COLLECTIONS).deleteOne({ _id: objectId })
                .then(async (deleteResult) => {
                    if (deleteResult.deletedCount > 0) {
                        console.log(`Deleted document with _id ${dataId}`);
    
                        // Reduce rent if userpurpose is "Personal" or "Class"
                        if (data.userpurpose === "Personal" || data.userpurpose === "Class") {
                            try {
                                const userId = data.userId;
    
                                // Try to find user data by userId (as string first)
                                let userData = await db.get().collection(collection.DATABASE_COLLECTIONS).findOne({ userId: userId });
    
                                // If not found, try userId as integer
                                if (!userData) {
                                    const userIdInt = parseInt(userId);
                                    if (!isNaN(userIdInt)) {
                                        userData = await db.get().collection(collection.DATABASE_COLLECTIONS).findOne({ userId: userIdInt });
                                    }
                                }
    
                                if (userData) {
                                    // Reduce rent by 5
                                    const reducedRent = (userData.rent || 0) - 5;
    
                                    // Update the rent in the database
                                    const updateResult = await db.get().collection(collection.DATABASE_COLLECTIONS).updateOne(
                                        { _id: userData._id },
                                        { $set: { rent: reducedRent } }
                                    );
    
                                    console.log(`Rent reduced by 5 for userId ${userId}: New rent is ${reducedRent}`);
                                    console.log("Update result:", updateResult);
                                } else {
                                    console.log(`No user data found for userId ${userId}`);
                                }
                            } catch (error) {
                                console.error("Error reducing rent:", error);
                                reject(error);
                            }
                        }
    
                        resolve(deleteResult);
                    } else {
                        console.log(`No document found with _id ${dataId}`);
                        resolve(null); // Resolve with null if no document was deleted
                    }
                })
                .catch((error) => {
                    console.error("Error deleting document:", error);
                    reject(error);
                });
        });
    },
    addMediaSlide : (slide) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MEDIA_COLLECTION).insertOne(slide).then((data) => {
                resolve(data)
            })
        })
    },
    getMediaSlide : (slideId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.MEDIA_COLLECTION).find({_id: slideId}).sort({ _id: -1 }).toArray().then((slides) => {
                
                resolve(slides)
            })
        })
    },
    getSlide: () => {   
        return new Promise(async (resolve, reject) => {
            let carousel = await db.get().collection(collection.MEDIA_COLLECTION).find({slideStatus: "true"}).sort({ _id: -1 }).limit(5).toArray()
            resolve(carousel)
        })
    }      






    }


