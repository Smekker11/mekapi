var mysql = require('mysql');
const express = require('express');
const app = require('express')();
const PORT = 8080;
const dotenv = require('dotenv').config();

app.use(express.json())

//auth made on .env file
var connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE

});

//rand func
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

//max id query
connection.query('SELECT MAX(id) AS "maxid" FROM ips', function(err, maxids) {
    if (err) console.log(err);
    const result = Object.values(JSON.parse(JSON.stringify(maxids)));
    global.maxid = result[0].maxid;
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////// API CONFIGURATION ////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/ip', (req, res) => {
    var ID = getRandomInt(maxid);
    connection.query(`SELECT * FROM ips`, function (err, recordset) {
        if (err) console.log(err)
        res.status(200).json(recordset[ID]);
    });
});

app.get('/ip/find/:q', (req, res) => {
    const {q} = req.params;
    const {type} = req.body;
    if (!type){
        res.status(400).send("Send request 'type' by GET method");
        global.success = true;
    } else {
        /////////////////// ID /////////////////////////////
        if (type == "id"){
            connection.query(`SELECT * FROM ips WHERE id='${q}'`, function (err, recordset){
                if (err) console.log(err)
                result = JSON.stringify(recordset);
                res.status(200).send(result);
            });
        }
        /////////////////// IP /////////////////////////////
        if(type == "ip"){
            connection.query(`SELECT * FROM ips WHERE IP='${q}'`, function (err, recordset){
                if (err) console.log(err)
                result = JSON.stringify(recordset);
                res.status(200).send(result);
            });
        }
        /////////////////// COUNTRY CODE ///////////////////
        if(type == "countrycode"){
            connection.query(`SELECT * FROM ips WHERE CountryCode='${q}'`, function (err, recordset){
                if(err) console.log(err)
                console.log(recordset[1]);
                result = JSON.stringify(recordset);
                res.status(200).send(result);
            });
        }
    }
});

app.get('/stats', (req, res) => {
    connection.query(`SELECT CountryCode, count(CountryCode) FROM ips GROUP by CountryCode ORDER BY count(CountryCode) DESC;`, function(err, recordset){
        if (err) console.log(err);
        result = JSON.stringify(recordset);
        res.status(200).send(result);
    });
});

app.get('/ip/full', (req,res) => {
    connection.query(`SELECT * FROM ips`, function (err,recordset) {
        if (err) console.log(err);
        result = JSON.stringify(recordset);
        res.status(200).send(result);
    });
});


app.listen(
    PORT,
    () => console.log(`mekk api on http://localhost:${PORT}`)
)

process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
  });