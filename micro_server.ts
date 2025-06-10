import  express  from "express";
import z from 'zod';
import parser from './services/parser';
import sysmpchecker from './services/Sympchecker';
import dotenv from 'dotenv'

dotenv.config();

const app = express();

app.use(express.json());
app.use('/parser', parser);
app.use('/checker', sysmpchecker)

app.get('/', async(req, res)=>{
    res.status(201).send("hello");
});

app.listen(process.env.PORT, ()=>{
    console.log(`server is running at the port ${process.env.PORT}`);
})