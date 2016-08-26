"use strict";
import express from 'express'
import * as FacebookService from '../service/FacebookService'

let facebookRouter = express.Router()



facebookRouter.route('/').get((req, res) => {
  res.send('<h1>Facebook Api</h1><ul><li>/addPage?pageID={pageID}</li><li>/addPost?postID={postID}</li><li>/getAllPage</li><li>/getAllPost</li><li>/getFeed?pageID={pageID}</li><li>/getComment?postID={postID}</li><li>/deletePage?pageID={pageID}</li><li>/updateFeed</li><li>/updateComment</li></ul>')
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
    res.send("Delete Page "+req.query.pageID)
})

facebookRouter.route('/getFeed').get((req, res) => {
     FacebookService.getFeed(req.query.pageID)
     .then( (feeds) =>{
        res.send(feeds)
    })
})

facebookRouter.route('/getComment').get((req, res) => {
    FacebookService.getComment(req.query.pageID).then((page) =>{
        res.send(page)
    })
})

facebookRouter.route('/getCount').get((req, res) => {
    FacebookService.getCount().then((page) =>{
        res.send(page)
    })
})


facebookRouter.route('/updateFeed').get((req, res) => {
    FacebookService.updateFeed()
    res.send("done")
    
})

facebookRouter.route('/updateComment').get((req, res) => {
    FacebookService.updateComment()
    res.send("done")
    
})

facebookRouter.route('/getLatestComment/kmids').get((req,res) =>{
    FacebookService.getLastedComment("1749829098634111").then((lastComment) =>{
        res.send(lastComment)        
    })
})

facebookRouter.route('/getLatestComment/engineer').get((req,res) =>{
    FacebookService.getLastedComment("157556534255462").then((lastComment) =>{
        res.send(lastComment)        
    })
})

export default facebookRouter