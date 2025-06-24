import express, { json } from "express";
import cors from "cors";

const app = express();

app.use(cors());

app.post("/upload", express.raw({ type: "*/*" }), (req, res) => {
  try {
    const data = req.body;
    console.log(data);

    res.status(200).send({ "data-received": data });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err: err });
  }
});

app.listen(3000, () => {
  console.log("Server is Running on Port" + " " + 3000);
});
