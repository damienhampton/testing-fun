import express from "express";
const app = express();

import bodyParser from "body-parser";
import { MyApp } from "./MyApp";

app.use(bodyParser.json());

const myApp = new MyApp();

app.post("/register", async (req, res) => {
  console.log("/register", req.body.username, req.body.password);
  const user = await myApp.register(req.body.username, req.body.password);
  res.json(user);
});

app.post("/authenticate", async (req, res) => {
  console.log("/authenticate", req.body.username, req.body.password);
  const session = await myApp.authenticate(
    req.body.username,
    req.body.password
  );
  res.json(session);
});

app.post("/subscribe", async (req, res) => {
  console.log("/subscribe", req.headers.token as string, req.body.username);
  await myApp.subscribe(req.headers.token as string, req.body.username);
  res.json();
});

app.post("/post-message", async (req, res) => {
  console.log("/post-message", req.headers.token as string, req.body.message);
  await myApp.postMessage(req.headers.token as string, req.body.message);
  res.json();
});

app.get("/feed", async (req, res) => {
  console.log("/feed", req.headers.token as string);
  const feed = await myApp.getFeed(req.headers.token as string);
  res.json(feed);
});

app.listen(3000);
