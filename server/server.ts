import express from "express";
import { getCards } from "./getCards";

const app = express();
const port = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Define the generateCards endpoint
app.post("/generateCards", async (req, res) => {
  const { content } = req.body; // Assuming the content is sent in the request body

  // Call the getCards function with the content
  const cards = await getCards(content);

  // Return the array of card objects back to the client
  res.json(cards);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
