import { app } from "./src/app.js"
import indexdb from "../03ECommerce/src/db/indexdb.js"

const PORT = process.env.PORT || 3030


indexdb().then(
    app.listen(PORT,()=> {
        console.log("successfull",PORT)
    })
).catch((err)=> {
    console.log("this happened",err)
})
