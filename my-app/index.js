const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')
const jwt = require('jsonwebtoken')
const { error } = require('console')
const dbPath = path.join(__dirname,'loginDetails.db')

let db = null 

const app = express()

app.use(express.json())

const initializeDatabase= async()=>{
    db = await open({
        filename:dbPath,
        driver:sqlite3.Database
    })

    app.listen(3000)
}

const middleWare=async (request,response,next)=>{
    const authHead=request.headers['authorization']
    let jwtToken=null 

    if(authHead!==undefined){
        jwtToken=authHead.split(" ")[1]
    }

    if(jwtToken!==undefined){
        jwt.verify(jwtToken,'vamsi',async(error,user)=>{
            if(error){
                response.send("Invalid JwtToken")
            }else{
                next()
            }
        })
    }
}

app.post('/login',async(request,response)=>{
    const {username,password} = request.body

    const getDetailsQuery=`
    SELECT * FROM user WHERE username='${username}'
    `
    const userStatus = await db.get(getDetailsQuery)
    const hashedPassword= await bcrypt.hash(userStatus.password,10)
    

    if(userStatus===undefined){
        response.status(404);
        response.send("User NotFound")
    }else{
        const comparePassword = await bcrypt.compare(password,hashedPassword)
        if(comparePassword===true){
            const generateToken=jwt.sign({username},'vamsi')
            response.send(generateToken)
        }else{
            response.send("Not")
        }
    }

})

app.get('/login',middleWare,async(request,response)=>{
    response.send("Login Successfully")
})

initializeDatabase()