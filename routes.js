
"use strict";
import express from 'express'
import bodyParser from 'body-parser'
import facebookRouter from './controller/FacebookController'
import cors from 'cors'

const port = process.env.port || 8880
let app = express()

app.use(cors())
// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

//parent url
app.route('/').get((req, res) => {
  res.send('<h1>Social REST Api</h1><ul><li>/facebook</li></ul>')
})

app.use('/facebook', facebookRouter)

//service start
app.listen(port, () => {
  console.log('Starting node.js on port ' + port)
});
