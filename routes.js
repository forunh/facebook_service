
"use strict";
import express from 'express'
import bodyParser from 'body-parser'
import facebookRouter from './controller/FacebookController'


const port = process.env.port || 7775
let app = express()


// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

//parent url
app.route('/').get((req, res) => {
  res.send('<h1>Social REST Api</h1><ul><li>/twitter</li><li>/facebook</li></ul>')
})

app.use('/facebook', facebookRouter)
//kokokoko
//service start
app.listen(port, () => {
  console.log('Starting node.js on port ' + port)
});
