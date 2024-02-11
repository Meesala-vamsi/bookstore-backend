const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const path = require('path')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const dbPath = path.join(__dirname,'loginDetails.db')

let db = null 

const app = express()
app.use(express.json())
app.use(cors())

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
        jwt.verify(jwtToken,'vamsi',async(error,payload)=>{
            if(error){
                response.send("Invalid JwtToken")
            }else{
                request.username = payload.username
                next()
            }
        })
    }else{
        response.send("Invalid JWT Token")
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
        const payload={
            username:username
        }
        const comparePassword = await bcrypt.compare(password,hashedPassword)
        if(comparePassword===true){
            const generateToken=jwt.sign(payload,'vamsi')
            response.send({generateToken})
        }else{
            response.send("Not")
        }
    }

})

app.get('/login',middleWare,async(request,response)=>{
    response.send("Login Successfully")
})

initializeDatabase()