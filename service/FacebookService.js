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

export function updateDB(since,until){
    
    let saveFbJob = new cronJob('* */30 * * * *', () => {
        getAllPage().then((allPage) =>{

            for(var page of allPage){
                getFbFeed(page.pageID,since,until)
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

        })
    },
    () => {
        console.log('saveTweetJob has stopped')
    },
        true
    )
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

export function getAllComment(){
    
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

export function deletePage(pageID){
    db.fbPage.remove(
        {   pageID: pageID  },
        {
            justOne: false
        }
    )
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

export function addComment(){
    console.log("hi")
    getFbComment("1749829098634111_1801452856805068")
    .then( comment => {
        console.log(comment)
        db.fbComment.update({postID: "123"},
                            {postID: "123",comment: "abc"},
                            {upsert:true},
                            err => {
            if(err){
                console.log(err)
            }
        })
    })
}