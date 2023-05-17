import { Configuration, OpenAIApi } from "openai";
import { encode, decode } from "gpt-3-encoder";

const openAIkey = process.env.OPENAI_API_KEY;
const configuration = new Configuration({ apiKey: openAIkey });
const openai = new OpenAIApi(configuration);

export async function getCards(rawContent: string) {
  const encodedTranscript = encode(rawContent);
  const stringsArray = splitTranscript(encodedTranscript, 1000);
  const resultsArray = await sendToChat(stringsArray);
  const finalFlashcardsArray = cleanAndCombine(resultsArray);
  return finalFlashcardsArray;
}

function splitTranscript(encodedTranscript: number[], maxTokens: number) {
  const stringsArray = [];
  let currentIndex = 0;

  while (currentIndex < encodedTranscript.length) {
    let endIndex = Math.min(currentIndex + maxTokens, encodedTranscript.length);

    while (
      endIndex < encodedTranscript.length &&
      decode([encodedTranscript[endIndex]]) !== "." &&
      endIndex < currentIndex + maxTokens + 500
    ) {
      endIndex++;
    }

    if (endIndex < encodedTranscript.length) {
      endIndex++;
    }

    const chunk = encodedTranscript.slice(currentIndex, endIndex);
    stringsArray.push(decode(chunk));

    currentIndex = endIndex;
  }

  console.log("======= Split transcript =======");
  // log the first 200 chars and the last 200 chars of each chunk, and also log the total length of each chunk
  for (let chunk of stringsArray) {
    console.log("Chunk number " + (stringsArray.indexOf(chunk) + 1) + ":");
    console.log(
      chunk.slice(0, 100) +
        "..." +
        chunk.slice(chunk.length - 100, chunk.length)
    );
    console.log(chunk.length);
  }

  return stringsArray;
}

async function sendToChat(stringsArray: string[]) {
  console.log("======= Analyse chunks =======");
  const resultsArray = [];

  for (let arr of stringsArray) {
    console.log(
      `Analysing chunk ${stringsArray.indexOf(arr) + 1} of ${
        stringsArray.length
      }...`
    );
    const prompt = generateSummaryPrompt(arr);
    const completion = await exponentialBackoffGPTRequest(prompt);
    if (completion) {
      resultsArray.push(completion);
    }
  }

  return resultsArray;
}

async function exponentialBackoffGPTRequest(prompt: string) {
  const retries = 6;
  let delay = 10000; // Initial delay: 10 seconds

  for (let i = 0; i < retries; i++) {
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: prompt },
          {
            role: "system",
            content:
              "You are an assistant that only speaks JSON. Do not write normal text.",
          },
        ],
        temperature: 0.4,
      });

      return completion;
    } catch (error) {
      await handleError(error, i, retries, delay);
      delay *= 2; // Double the delay for the next retry
    }
  }
}

function handleError(
  _: any,
  currentRetry: number,
  maxRetries: number,
  delay: number
) {
  if (currentRetry === maxRetries - 1) {
    console.error(
      "Failed to get a response from OpenAI Chat API after maximum retries."
    );
    process.exit(1);
  } else {
    console.log(
      `Retry #${currentRetry + 1}: Waiting ${delay}ms before next retry...`
    );
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

function generateSummaryPrompt(content: string) {
  return `Generate flashcards for the following markdown content below. You only speak JSON. The flashcards should be bite sized - ideal for anki. Return the cards in an array in a json object in the exact following structure:

Required response structure:

{
"flashcards": [
{
topic: "The topic of the flashcard (1-3 words)",
question: "The question of the flashcard (1-2 sentences)",
answer: "The answer of the flashcard (1-3 sentences)"
},
{
topic: "Dijkstra's algorithm",
question: "What is Dijkstra's algorithm?",
answer: "Dijkstra's algorithm is an algorithm for finding the shortest paths between nodes in a graph."
},
{
topic: "Temperature of sun",
question: "What is the temperature of the sun?",
answer: "The temperature of the sun is 5,778 K."
}
]
}

Content to generate flashcards from:

${content}`;
}

function removeTrailingCommas(jsonString: string) {
  const regex = /,\s*(?=])/g;
  return jsonString.replace(regex, "");
}

function cleanAndCombine(rawResults: any[]) {
  console.log("======= Cleaning results =======");

  const cleanedResultsArray = [];

  for (let rawResult of rawResults) {
    // ChatGPT loves to occasionally throw commas after the final element in arrays, so let's remove them
    // Need some code that will ensure we only get the JSON portion of the response
    // This should be the entire response already, but we can't always trust GPT
    const jsonString = rawResult.data.choices[0].message.content
      .replace(/^[^\{]*?{/, "{")
      .replace(/\}[^}]*?$/, "}");

    const cleanedJsonString = removeTrailingCommas(jsonString);

    let jsonObj;
    try {
      jsonObj = JSON.parse(cleanedJsonString);
    } catch (error) {
      console.error("Error while parsing cleaned JSON string:");
      console.error(error);
      console.log("Original JSON string:", jsonString);
      console.log(cleanedJsonString);
      console.log("Cleaned JSON string:", cleanedJsonString);
      jsonObj = {};
    }

    const response = {
      choice: jsonObj,
      usage: !rawResult.data.usage.total_tokens
        ? 0
        : rawResult.data.usage.total_tokens,
    };

    cleanedResultsArray.push(response);
  }

  const finalFlashcardsArray = [];

  for (let flashCardsObj of cleanedResultsArray) {
    try {
      for (let flashcard of flashCardsObj.choice.flashcards) {
        finalFlashcardsArray.push(flashcard);
      }
    } catch (error) {
      console.error("Error while pushing flashcards to final array:");
      console.error(error);
    }
  }

  console.log("======= Final flashcards array =======");
  console.log(finalFlashcardsArray);

  return finalFlashcardsArray;
}
