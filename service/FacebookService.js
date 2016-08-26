import graph from 'fbgraph'
import { db } from '../db'
import cron from 'cron'

let access_token = "139610759813141|f928e2e59299981a997116c967a20b1d"
graph.setAccessToken(access_token);
let cronJob = cron.CronJob


export function getFbDetail(userID) {
    var params = {fields: "name,picture"}    
    return new Promise((resolve) =>{
        graph.get(userID,params, (err, res) => {
            resolve(res)
        })
    })
     
}

export function getFbComment(postID){

    let params = {summary : 1}
    return new Promise((resolve) => {
        graph.get(postID+"/comments",params,(err,res) => {
            resolve(res)
        })
    })

}

export function getFbFeed(userID,since,until) {

    var params = {fields: "message,created_time",since: "2016-08-01",limit: 100}
    
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
export function getComment(pageID){
    
    return new Promise((resolve,reject) => {
        db.fbComment.find({pageID: pageID},(err,docs)=>{
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
        db.fbFeed.find({pageID: userID},(err,docs)=>{
            if(err){
                reject(reject)
            }
            else{
                resolve(docs)
            }
        })
    })
}

export function getAllFeed(){
    
    return new Promise((resolve,reject) => {
        db.fbFeed.find({},(err,docs)=>{
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

    let pageID = postID.substring(0,postID.indexOf("_"))     
    getFbComment(postID)
    .then( comments => {
        for(let comment of comments.data){
            db.fbComment.find({postID: postID},
                {   
                    pageID: pageID,
                        comment:{
                            $elemMatch: {
                                postID: postID,
                                id: comment.id
                            }
                        }
                }, 
                (err,commentDBs) => {
                    
                    if(commentDBs.length==0||!(commentDBs[0].hasOwnProperty('comment'))){
                      
                        db.fbComment.update({pageID: pageID},
                                            {   
                                                $set:{
                                                    pageID: pageID
                                                },
                                                $push:
                                                    {
                                                         'comment': {
                                                            postID: postID,
                                                            created_time: comment.created_time,
                                                            from: {
                                                                name: comment.from.name,
                                                                id: comment.from.id
                                                            },
                                                            message: comment.message,
                                                            id: comment.id
                                                        }
                                                    }
                                                    
                                            },
                                            {upsert:true},
                                            err => {
                            if(err){
                                console.log(err)
                            }
                        })  
                        
                    
                }
                if(err){
                        console.log(err)                   
                }
            })

        
        }
    })
}

export function addFeed(pageID){
    getFbFeed(pageID)
    .then( feed => {
     
        let post = {
                pageID: pageID,
                feed : feed.data
        }
        db.fbFeed.update(
            {pageID: pageID},post,{upsert:true},err => {
            if(err){
                console.log(err)
            }
        })
    })
}

export function getLastedComment(pageID){
    return new Promise((resolve,reject) => {
     
        db.fbComment.aggregate(
            {
                 $match: {
                     pageID: pageID
                 }
            },
            {   $unwind: '$comment'},
            {
                $sort: {'comment.created_time': -1}
            })
        .limit(1
        ,(err,lastComment) =>{
           getFbDetail(lastComment[0].comment.from.id).then(user =>{
                let returnValue ={
                    picture: user.picture.data.url,
                    name: user.name,
                    comment: lastComment[0].comment.message,
                    created_time: lastComment[0].comment.created_time
                }
                resolve(returnValue)
            })
            
        })
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
    getAllFeed().then((allFeed) =>{

        for(var feed of allFeed){
            
            for(var message of feed.feed){
                addComment(message.id)
            }
            
        }
    })
}

export function getCountComment(){

        return new Promise((resolve,reject) => {  
            db.fbComment.aggregate(
            [
                {$match: {pageID : "1749829098634111"}},
                {
                    $project: {
                        comments_count: {$size: "$comment"}
                    }
                }
            ]
            ,(res)=> {
                console.log(res)
                resolve(res)

            })
        })

}

