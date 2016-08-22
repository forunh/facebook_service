import graph from 'fbgraph'
import { db } from '../db'
import cron from 'cron'

let access_token = "139610759813141|f928e2e59299981a997116c967a20b1d"
graph.setAccessToken(access_token);
let cronJob = cron.CronJob


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

export function getAllPage(){
    
    return new Promise((resolve,reject) => {
        db.fbPage.find((err,docs)=>{
            if(err){
                reject(reject)
            }
            else{
                resolve(docs)
            }
        })
    })
}

export function getAllPost(){
    
    return new Promise((resolve,reject) => {
        db.fbPost.find((err,docs)=>{
            if(err){
                reject(reject)
            }
            else{
                resolve(docs)
            }
        })
    })
}
export function getComment(postID){
    
    return new Promise((resolve,reject) => {
        db.fbComment.find((err,docs)=>{
            if(err){
                reject(reject)
            }
            else{
                resolve(docs)
            }
        })
    })
}

export function getFeed(userID){
    
    return new Promise((resolve,reject) => {
        db.facebookFeed.find((err,docs)=>{
            if(err){
                reject(reject)
            }
            else{
                resolve(docs)
            }
        })
    })
}

export function addPage(pageID){

    getFbDetail(pageID)
    .then( result => {
        let page ={
            pageID: result.id,
            name: result.name
        } 
        

        db.fbPage.update({pageID: pageID},page,{upsert:true},err => {
            if(err){
                console.log(err)
            }
        })
              
    })  
}
export function addPost(postID){
    let post ={
        pageID: postID.substring(0,postID.indexOf("_")),
        postID: postID
    } 
    db.fbPost.update({postID: postID},post,{upsert:true},err => {
        if(err){
            console.log(err)
        }
    })
}

export function deletePage(pageID){
    db.fbPage.remove(
        {   pageID: pageID  },
        {
            justOne: false
        }
    )
}

export function addComment(postID){

    getFbComment(postID)
    .then( comment => {
        db.fbComment.update({postID: postID},
                            {postID: postID,comment: comment.data},
                            {upsert:true},
                            err => {
            if(err){
                console.log(err)
            }
        })
    })
}

export function addFeed(pageID){
    getFbFeed(pageID,since,until)
    .then( feed => {

        for(var data of feed.data){
            if(data.message){
                let post = {
                    userID: data.id.substring(0,data.id.indexOf("_")),
                    postID: data.id,
                    message: data.message,
                    postCreatedTime: data.created_time
                }
                db.facebookFeed.update({postID: data.id},post,{upsert:true},err => {
                    if(err){
                        console.log(err)
                    }
                })
                
            }
        }
    })
}

let saveFbJob = new cronJob('* */2 * * * *', () => {
   updateFeed()
   updateComment()
},
() => {
    console.log('saveFbJob has stopped')
},
    true
)

export function updateFeed(){
 getAllPage().then((allPage) =>{

        for(var page of allPage){
            addFeed(page.pageID)
        }
    })
}

export function updateComment(){
    getAllPost().then((allPost) =>{

        for(var post of allPost){
            addComment(post.postID)
        }
    })
}