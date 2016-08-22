"use strict";
import express from 'express'
import * as FacebookService from '../service/FacebookService'

let facebookRouter = express.Router()



facebookRouter.route('/').get((req, res) => {
  res.send('<h1>Facebook Api</h1><ul><li>/addPage?pageID={pageID}</li><li>/getAllPage</li><li>/deletePage</li><li>/updateDB</li><li>/getFeed</li></ul>')
})

facebookRouter.route('/addPage').get((req, res) => {

    FacebookService.addPage(req.query.pageID)
    res.send("Add Page "+req.query.pageID)
   
})

facebookRouter.route('/addPost').get((req, res) => {

    FacebookService.addPost(req.query.postID)
    res.send("Add Page "+req.query.postID)
   
})

facebookRouter.route('/getAllPage').get((req, res) => {
    FacebookService.getAllPage().then((page) =>{
        res.send(page)
    })
    
})

facebookRouter.route('/getAllPost').get((req, res) => {
    FacebookService.getAllPost().then((page) =>{
        res.send(page)
    })
    
})

facebookRouter.route('/deletePage').get((req, res) => {
    FacebookService.deletePage(req.query.pageID)
    res.send("Delete Page"+req.query.pageID)
    
    
})

facebookRouter.route('/getFeed').get((req, res) => {
  
     FacebookService.getFeed(req.query.pageID)
     .then( (feeds) =>{
        res.send(feeds)
    })

   
})

// facebookRouter.route('/updateDB').get((req, res) => {
//     FacebookService.updateDB(req.query.since,req.query.until)
//     res.send("done")
    
// })

// facebookRouter.route('/addComment').get((req, res) => {
//     FacebookService.updateComment()
//     res.send("done")
    
// })

facebookRouter.route('/getComment').get((req, res) => {
    FacebookService.getComment(req.query.postID).then((page) =>{
        res.send(page)
    })
    
})

export default facebookRouter