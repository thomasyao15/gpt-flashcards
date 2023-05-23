import { Configuration, OpenAIApi, ChatCompletionRequestMessageRoleEnum } from "openai";
import { encode, decode } from "gpt-3-encoder";

const openAIkey = process.env.OPENAI_API_KEY;
const configuration = new Configuration({ apiKey: openAIkey });
const openai = new OpenAIApi(configuration);

export async function getCards(rawContent: string) {
  const encodedTranscript = encode(rawContent);
  const stringsArray = splitTranscript(encodedTranscript, 1000);
  const resultsArray = await sendToChat(stringsArray);
  const flashcardsResult = cleanAndCombine(resultsArray);
  return flashcardsResult;
}

export async function getReverseCards(rawContent: string) {
  const encodedMarkdown = encode(rawContent);
  const stringsArray = splitTranscript(encodedMarkdown, 1000);
  const resultsArray = await sendReverseToChat(stringsArray);
  const flashcardsResult = cleanAndCombine(resultsArray);
  return flashcardsResult;
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

async function sendReverseToChat(stringsArray: string[]) {
  console.log("======= Analyse chunks =======");
  const resultsArray = [];

  for (let arr of stringsArray) {
    console.log(
      `Analysing chunk ${stringsArray.indexOf(arr) + 1} of ${stringsArray.length
      }...`
    );
    const messages = [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content:
          "You are an assistant that only speaks JSON. Do not write normal text.",
      },
      { role: ChatCompletionRequestMessageRoleEnum.User, content: generateReversePrompt(arr) },
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant, content: `{
"flashcards": [
{
"topic": "Dijkstra's algorithm",
"question": "What is the term for an algorithm for finding the shortest paths between nodes in a graph? It was conceived by computer scientist Edsger W. Dijkstra in 1956 and published three years later?",
"answer": "Dijkstra's algorithm"
}
]
}`
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User, content: `Q: **What is CP in the CAP theorem?**
A: {CP stands for consistency and partition tolerance. It prioritises consistency over availability - it is a good choice if your business needs require atomic reads and writes. However, waiting for a response from the partitioned node might result in a timeout error.}`
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: `{"flashcards": []}`
      },
      { role: ChatCompletionRequestMessageRoleEnum.User, content: arr }
    ];
    const completion = await exponentialBackoffGPTRequest(messages);
    if (completion) {
      resultsArray.push(completion);
    }
  }

  return resultsArray;
}


function generateReversePrompt(content: string) {
  return `Make "what is the term for ..." cards for these flashcards in markdown format, ONLY for cards that test for the terms of definitions. You must return it in this JSON structure. If there are no cards with terms, return an empty flashcard array in the JSON object.
  
E.g. Q: What is weak consistency?
A: Weak consistency is a consistency model that allows for inconsistencies or stale data to exist temporarily in a distributed system. In this model, after a write operation, there is no guarantee that subsequent read operations will immediately reflect the updated value.

IGNORE cards like this that don't test for terms:
Q: What is the temperature of the sun?
A: The temperature of the sun is 5,778 K.

Example json response for reverse card:

{
"flashcards": [
{
"topic": "Weak consistency",
"question": "What is the term for a consistency model that allows for inconsistencies or stale data to exist temporarily in a distributed system?",
"answer": "Weak consistency"
}
]
}
  
Now generate the reverse cards for these flashcards:

Q: **What is Dijkstra's algorithm?**
A: {Dijkstra's algorithm is an algorithm for finding the shortest paths between nodes in a graph. It was conceived by computer scientist Edsger W. Dijkstra in 1956 and published three years later.}

Q: **What is the temperature of the sun?**
A: {The temperature of the sun is 5,778 K.}
`;
}

async function sendToChat(stringsArray: string[]) {
  console.log("======= Analyse chunks =======");
  const resultsArray = [];

  for (let arr of stringsArray) {
    console.log(
      `Analysing chunk ${stringsArray.indexOf(arr) + 1} of ${stringsArray.length
      }...`
    );
    const messages = [
      { role: ChatCompletionRequestMessageRoleEnum.User, content: generateSummaryPrompt(arr) },
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content:
          "You are an assistant that only speaks JSON. Do not write normal text.",
      },
    ];
    const completion = await exponentialBackoffGPTRequest(messages);
    if (completion) {
      resultsArray.push(completion);
    }
  }

  return resultsArray;
}

async function exponentialBackoffGPTRequest(messages: any[], retries = 6, delay = 10000) {
  for (let i = 0; i < retries; i++) {
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.4,
      });

      return completion;
    } catch (error) {
      console.error(error);

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
  return `Analyse and fix/add new information to the markdown content below, then generate MANY TINY flashcards from it.
You must:
1. reword the information and add extra information to make the flashcards more useful.
2. generate new flashcards for any new information you add.
3. split each point into multiple TINY flashcards (max 2 sentence answers).

E.g. if the content is:
* So you now need to do geography based load balancing, so depending on your geography, the DNS level LB might route you to the IP of a web server LB in another building

Return the cards in an array in a json object in the exact following structure.
Required response structure (you only speak JSON):

{
"flashcards": [
{
"topic": "The topic of the flashcard (1-3 words)",
"question": "The question of the flashcard (1 SINGLE QUESTION)",
"answer": "The answer of the flashcard (1-2 sentences)"
},
{
"topic": "Geography based load balancing",
"question": "What is geography based load balancing?",
"answer": "Geography based load balancing is when the DNS level load balancer routes you to the IP of a web server load balancer in another building, depending on your geography."
},
{
"topic": "Load balancer",
"question": "What is a load balancer?",
"answer": "A load balancer is a device that acts as a reverse proxy and distributes network or application traffic across a number of servers."
},
{
"topic": "Reverse proxy",
"question": "What is a reverse proxy?",
"answer": "A reverse proxy is a server that sits in front of web servers and forwards client (e.g. web browser) requests to those web servers. Reverse proxies are typically implemented to help increase security, performance, and reliability."
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
      console.error(
        "================================= CLEANED JSON STRING ================================="
      );
      console.error(cleanedJsonString);
      console.error(
        "================================= END JSON STRING ================================="
      );
      jsonObj = JSON.parse(cleanedJsonString);
    } catch (error) {
      console.error("Error while parsing cleaned JSON string:");
      console.error(error);
      // console.log("Original JSON string:", jsonString);
      // console.log(cleanedJsonString);
      // console.log("Cleaned JSON string:", cleanedJsonString);
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
  let totalTokens = 0;

  for (let flashCardsObj of cleanedResultsArray) {
    try {
      for (let flashcard of flashCardsObj.choice.flashcards) {
        finalFlashcardsArray.push(flashcard);
      }
      totalTokens += flashCardsObj.usage;
    } catch (error) {
      console.error("Error while pushing flashcards to final array:");
      console.error(error);
    }
  }

  console.log("======= Final flashcards array =======");
  console.log(finalFlashcardsArray);

  return {
    flashcards: finalFlashcardsArray,
    totalTokens: totalTokens,
  };
}
