import "dotenv/config";
import express from "express";

import logger from "./logger.js";
import morgan from "morgan";

const port = process.env.PORT || 3000;
const app = express();

const morganFormat = ":method :url :status :response-time ms";
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

app.listen(port, () => {
  console.log(`server is now listening at ${port}`);
});
app.get("/", (req, res) => {
  res.send("hi this is the index page of morgon logs learning experiment!!!!");
});
app.get("/about", (req, res) => {
  res.send("now you are in the about section");
});
app.get("/contact", (req, res) => {
  res.send(
    "wow, i appricate the concern, but my author is out of station right now, if you want i can give you his number?"
  );
});
app.get("/insta", (req, res) => {
  res.send("this is my author insta id: @this_is_rethees");
});

app.use(express.json());
let posts = [];
let nextId = 1;

app.post("/post", (req, res) => {
  const { name, des } = req.body;
  const newpost = { id: nextId++, name, des };
  posts.push(newpost);
  res.status(200).send(newpost);
});

app.get("/post", (req, res) => {
  res.status(200).send(posts);
});

app.get("/post/:id", (req, res) => {
  const getpost = posts.find((ele) => ele.id === parseInt(req.params.id));
  if (!getpost) {
    return res.status(404).send("sorry nothing in here");
  }
  res.status(200).send(getpost);
});

app.put("/post/:id", (req, res) => {
  const getpost = posts.find((ele) => ele.id === parseInt(req.params.id));
  if (!getpost) {
    return res.status(404).send("sorry nothing to find in here");
  }
  const { name, des } = req.body;
  getpost.name = name;
  getpost.des = des;
  res.status(200).send(getpost);
});

app.delete("/post/:id", (req, res) => {
  const index = posts.findIndex((ele) => ele.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404), send("sorry nothing to find in here");
  }
  posts.splice(index, 1);
  res.status(200).send("deleted");
});
