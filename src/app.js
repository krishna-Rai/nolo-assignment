const express = require('express')
const axios = require('axios');
const cache = require('memory-cache')
require('dotenv').config()
const app = express()
const port = process.env.PORT


function checkCache(req,res,next){
  let key = req.url + req.query.symbol
  let cacheResponse = cache.get(key)
  if(cacheResponse){
    res.send(cacheResponse)
    return
  }
  next()
}

app.get('/get-analysis', checkCache, async (req, res) => {
  try {
    const config = {
      headers : {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": process.env.API_HOST,
        "useQueryString": true
      },
      params : {
        "symbol": req.query.symbol,
        "region": "US"
      }
    }
    const response = (await axios.get(`https://${process.env.API_HOST}/stock/v2/get-analysis`,config)).data
    cache.put(req.url + req.query.symbol,response,process.env.CACHE_DURATION*1000);
    res.send(response)
  } catch (error) {
    console.log(error.message)
    res.status(500).send({'error':'Internal Server Error'}) 
  }
  
})

app.get('/news', checkCache, async (req,res) => {
  try {
    const config = {
      headers : {
        "x-rapidapi-key": "623644254amsh8c5fec57203e33ap13bcb0jsn3aee157b098e",
        "x-rapidapi-host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
        "useQueryString": true
      },
      params : {
        q: req.query.symbol,
        region: "US"
      }
    }
    const response = (await axios.get(`https://${process.env.API_HOST}/auto-complete`, config)).data
    cache.put(req.url + req.query.symbol,response,process.env.CACHE_DURATION*1000)
    res.send(response)
  } catch (error) {
    console.log(error.message)
    res.status(500).send({'error' : 'Internal Server Error'});
  }
  
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})