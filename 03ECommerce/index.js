import { app } from './src/app.js';
import indexdb from './src/db/indexdb.js';
import 'dotenv/config';

const PORT = process.env.PORT || 3030;

indexdb().then(
    app.listen(PORT,()=>{
        console.log("success in the app.listern",PORT)
    })
).catch((err)=> {
    console.log("Mongodb connection error:",err)
}
);
