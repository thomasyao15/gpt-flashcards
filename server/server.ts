import express from "express";
import { getCards, getReverseCards } from "./getCards";
import cors from "cors";

const app = express();
const port = 5050;

app.use(express.json());

app.use(cors());

app.post("/generateCards", async (req, res) => {
  const { content } = req.body;

  const cards = await getCards(content);

  res.json(cards);
});

app.post("/getReverseCards", async (req, res) => {
  const { content } = req.body;

  console.log(content);


  const cards = await getReverseCards(content);

  res.json(cards);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
