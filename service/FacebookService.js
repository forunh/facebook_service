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

    let params = {summary : 1}
    return new Promise((resolve) => {
        graph.get(postID+"/comments",params,(err,res) => {
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
        db.fbComment.find({postID: postID},(err,docs)=>{
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
        db.facebookFeed.find({pageID: userID},(err,docs)=>{
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
    .then( comments => {
        for(let comment of comments.data){
            // comment = {
            //     message: "Wow Fantastic!!!",
            //     id: "1234"
            // }
            db.fbComment.find({postID: postID},
                {   
                    postID: postID,
                        comment:{
                            $elemMatch: {
                                id: comment.id
                            }
                        }
                }, 
                (err,commentDBs) => {

                    if(commentDBs.length == 0){
                    
                        db.fbComment.update({postID: postID},
                                            {   
                                                $push:
                                                    {
                                                        'comment': comment
                                                    },
                                                $set:{
                                                    total: comments.summary.total_count,                                                
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
                        message : feed.data
                }
                db.facebookFeed.update(
                    {pageID: pageID},post,{upsert:true},err => {
                    if(err){
                        console.log(err)
                    }
                })
    
            
        
    })
}

                               


let saveFbJob = new cronJob('* */30 * * * *', () => {
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