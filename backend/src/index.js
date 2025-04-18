import dotenv from 'dotenv'
import {connectDB} from './db/index.js'
import {app} from './app.js'

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.on("error", (error) => console.log("Server failed to connect with database",error))
    const port = process.env.PORT||3000
    app.listen(port, () => console.log(`Server is running on port ${port}`))
})
.catch(err => {
    console.log("MongoDB connection failed!!",err)
})