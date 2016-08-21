import graph from 'fbgraph'
import { db } from '../db'
import cron from 'cron'

let access_token = "139610759813141|f928e2e59299981a997116c967a20b1d"
graph.setAccessToken(access_token);
let cronJob = cron.cronJob


export function getFbDetail(userID) {

    return new Promise((resolve) =>{
        graph.get(userID, (err, res) => {
            resolve(res)
        })
    })
     
}

export function getFbComment(postID){

    return new Promise((resolve) => {
        graph.get(postID+"/comments",(err,res) => {
            resolve(res)
        })
    })

}




export function getFbFeed(userID,since,until) {

    var params = {fields: "",since: since,until: until}
    
    return new Promise((resolve,reject) => {

        graph.get(userID+"/feed",params,(err ,res) =>{
                resolve(res)
        })
       
    })
     
}

export function updateDB(since,until){
    

    getPageID().then((pageID) =>{

        for(var userID of pageID){
            getFeed(userID,since,until)
            .then( result => {

                for(var data of result.data){
                    if(data.message){
                        Facebook.findOrCreate({
                            where:{
                                postID: data.id
                            },
                            defaults:{
                                userID: data.id.substring(0,data.id.indexOf("_")),
                                postID: data.id,
                                message: data.message,
                                postCreatedTime: data.created_time
                            }
                        })
                        .then(() => {
                            console.log('save complete');
                        })
                        .catch((err) => {
                            console.log(err.stack);
                        })
                    }
                }
            })
        }

    })
    
    
}
export function getPageID(){
    
    var userID =[]
    return new Promise((resolve,reject) => {
        PageID.findAll({
            attributes: ['userID'],
            group: ['userID']
            
        }).then( (feeds) =>{
            for(var feed of feeds){
                userID.push(feed.dataValues.userID)
            }
        }).then(() => {
            resolve(userID)
        })
    })
}

export function addPage(pageID){
    
    
    getDetail(pageID)
    .then( result => {
        
        PageID.findOrCreate({
            where:{
                userID: result.id
            },
            defaults:{
                userID: result.id,
                name: result.name
            }
        })
        .then(() => {
            console.log('add complete');
        })
        .catch((err) => {
            console.log(err.stack);
        })
    })  
}