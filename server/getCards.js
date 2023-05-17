"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCards = void 0;
var openai_1 = require("openai");
var gpt_3_encoder_1 = require("gpt-3-encoder");
var openAIkey = process.env.OPENAI_API_KEY;
var configuration = new openai_1.Configuration({ apiKey: openAIkey });
var openai = new openai_1.OpenAIApi(configuration);
function getCards(rawContent) {
    return __awaiter(this, void 0, void 0, function () {
        var encodedTranscript, stringsArray, resultsArray, finalFlashcardsArray;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encodedTranscript = (0, gpt_3_encoder_1.encode)(rawContent);
                    stringsArray = splitTranscript(encodedTranscript, 1000);
                    return [4 /*yield*/, sendToChat(stringsArray)];
                case 1:
                    resultsArray = _a.sent();
                    finalFlashcardsArray = cleanAndCombine(resultsArray);
                    return [2 /*return*/, finalFlashcardsArray];
            }
        });
    });
}
exports.getCards = getCards;
function splitTranscript(encodedTranscript, maxTokens) {
    var stringsArray = [];
    var currentIndex = 0;
    while (currentIndex < encodedTranscript.length) {
        var endIndex = Math.min(currentIndex + maxTokens, encodedTranscript.length);
        while (endIndex < encodedTranscript.length &&
            (0, gpt_3_encoder_1.decode)([encodedTranscript[endIndex]]) !== "." &&
            endIndex < currentIndex + maxTokens + 500) {
            endIndex++;
        }
        if (endIndex < encodedTranscript.length) {
            endIndex++;
        }
        var chunk = encodedTranscript.slice(currentIndex, endIndex);
        stringsArray.push((0, gpt_3_encoder_1.decode)(chunk));
        currentIndex = endIndex;
    }
    console.log("======= Split transcript =======");
    // log the first 200 chars and the last 200 chars of each chunk, and also log the total length of each chunk
    for (var _i = 0, stringsArray_1 = stringsArray; _i < stringsArray_1.length; _i++) {
        var chunk = stringsArray_1[_i];
        console.log("Chunk number " + (stringsArray.indexOf(chunk) + 1) + ":");
        console.log(chunk.slice(0, 100) +
            "..." +
            chunk.slice(chunk.length - 100, chunk.length));
        console.log(chunk.length);
    }
    return stringsArray;
}
function sendToChat(stringsArray) {
    return __awaiter(this, void 0, void 0, function () {
        var resultsArray, _i, stringsArray_2, arr, prompt_1, completion;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("======= Analyse chunks =======");
                    resultsArray = [];
                    _i = 0, stringsArray_2 = stringsArray;
                    _a.label = 1;
                case 1:
                    if (!(_i < stringsArray_2.length)) return [3 /*break*/, 4];
                    arr = stringsArray_2[_i];
                    console.log("Analysing chunk ".concat(stringsArray.indexOf(arr) + 1, " of ").concat(stringsArray.length, "..."));
                    prompt_1 = generateSummaryPrompt(arr);
                    return [4 /*yield*/, exponentialBackoffGPTRequest(prompt_1)];
                case 2:
                    completion = _a.sent();
                    if (completion) {
                        resultsArray.push(completion);
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, resultsArray];
            }
        });
    });
}
function exponentialBackoffGPTRequest(prompt) {
    return __awaiter(this, void 0, void 0, function () {
        var retries, delay, i, completion, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    retries = 6;
                    delay = 10000;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < retries)) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, openai.createChatCompletion({
                            model: "gpt-3.5-turbo",
                            messages: [
                                { role: "user", content: prompt },
                                {
                                    role: "system",
                                    content: "You are an assistant that only speaks JSON. Do not write normal text.",
                                },
                            ],
                            temperature: 0.4,
                        })];
                case 3:
                    completion = _a.sent();
                    return [2 /*return*/, completion];
                case 4:
                    error_1 = _a.sent();
                    return [4 /*yield*/, handleError(error_1, i, retries, delay)];
                case 5:
                    _a.sent();
                    delay *= 2; // Double the delay for the next retry
                    return [3 /*break*/, 6];
                case 6:
                    i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function handleError(_, currentRetry, maxRetries, delay) {
    if (currentRetry === maxRetries - 1) {
        console.error("Failed to get a response from OpenAI Chat API after maximum retries.");
        process.exit(1);
    }
    else {
        console.log("Retry #".concat(currentRetry + 1, ": Waiting ").concat(delay, "ms before next retry..."));
        return new Promise(function (resolve) { return setTimeout(resolve, delay); });
    }
}
function generateSummaryPrompt(content) {
    return "Generate flashcards for the following markdown content below. You only speak JSON. The flashcards should be bite sized - ideal for anki. Return the cards in an array in a json object in the exact following structure:\n\nRequired response structure:\n\n{\n\"flashcards\": [\n{\ntopic: \"The topic of the flashcard (1-3 words)\",\nquestion: \"The question of the flashcard (1-2 sentences)\",\nanswer: \"The answer of the flashcard (1-3 sentences)\"\n},\n{\ntopic: \"Dijkstra's algorithm\",\nquestion: \"What is Dijkstra's algorithm?\",\nanswer: \"Dijkstra's algorithm is an algorithm for finding the shortest paths between nodes in a graph.\"\n},\n{\ntopic: \"Temperature of sun\",\nquestion: \"What is the temperature of the sun?\",\nanswer: \"The temperature of the sun is 5,778 K.\"\n}\n]\n}\n\nContent to generate flashcards from:\n\n".concat(content);
}
function removeTrailingCommas(jsonString) {
    var regex = /,\s*(?=])/g;
    return jsonString.replace(regex, "");
}
function cleanAndCombine(rawResults) {
    var cleanedResultsArray = [];
    for (var _i = 0, rawResults_1 = rawResults; _i < rawResults_1.length; _i++) {
        var rawResult = rawResults_1[_i];
        // ChatGPT loves to occasionally throw commas after the final element in arrays, so let's remove them
        // Need some code that will ensure we only get the JSON portion of the response
        // This should be the entire response already, but we can't always trust GPT
        var jsonString = rawResult.data.choices[0].message.content
            .replace(/^[^\{]*?{/, "{")
            .replace(/\}[^}]*?$/, "}");
        var cleanedJsonString = removeTrailingCommas(jsonString);
        var jsonObj = void 0;
        try {
            jsonObj = JSON.parse(cleanedJsonString);
        }
        catch (error) {
            console.error("Error while parsing cleaned JSON string:");
            console.error(error);
            console.log("Original JSON string:", jsonString);
            console.log(cleanedJsonString);
            console.log("Cleaned JSON string:", cleanedJsonString);
            jsonObj = {};
        }
        var response = {
            choice: jsonObj,
            usage: !rawResult.data.usage.total_tokens
                ? 0
                : rawResult.data.usage.total_tokens,
        };
        cleanedResultsArray.push(response);
    }
    var finalFlashcardsArray = [];
    for (var _a = 0, cleanedResultsArray_1 = cleanedResultsArray; _a < cleanedResultsArray_1.length; _a++) {
        var flashCardsObj = cleanedResultsArray_1[_a];
        try {
            for (var _b = 0, _c = flashCardsObj.choice.flashcards; _b < _c.length; _b++) {
                var flashcard = _c[_b];
                finalFlashcardsArray.push(flashcard);
            }
        }
        catch (error) {
            console.error("Error while pushing flashcards to final array:");
            console.error(error);
        }
    }
    return finalFlashcardsArray;
}
