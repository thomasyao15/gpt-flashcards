# GPT Flashcards

GPT Flashcards is a tool designed to generate flashcards based on markdown content. It provides a simple way to create flashcards in markdown format, which can be easily converted into Anki cards using the Obsidian to Anki plugin.

![image](https://github.com/thomasyao15/gpt-flashcards/assets/64414639/e316fd21-9c73-40cb-97a0-957d04c642c8)

## Usage

To use GPT Flashcards:

1. Clone this repository to your local machine.
2. Install the required dependencies by running `npm install` in both the `client` and `server` folders.
3. Add the OPENAI_API_KEY environment variable to your system with your OpenAI API key. E.g. `export OPENAI_API_KEY=your-api-key`.
4. Spin up the server by running `npm start` in the `server` folder.
5. Visit https://thomasyao15.github.io/gpt-flashcards/ OR Spin up the client page by running `npm start` in the `client` folder.
6. Enter your markdown content into the text area and click "Generate Flashcards".

## Creating changes

Use `npm run deploy` to deploy changes to github pages.

## Client

The client folder contains the React frontend for GPT Flashcards. It provides a simple interface for creating flashcards and generating flashcards based on the provided markdown content.

## Server

The server folder contains the backend server for GPT Flashcards. It handles the generation of flashcards based on the provided markdown content by calling the GPT API. The server should be running in order to generate flashcards.

## Compatibility with Obsidian to Anki Plugin

GPT Flashcards outputs flashcards in markdown format that is compatible with the Obsidian to Anki plugin. This allows you to easily convert your markdown flashcards into Anki cards for efficient studying.

- The plugin will automatically detect the flashcards and create new Anki cards to add to your spaced repetition deck.
- See the [Obsidian to Anki plugin](https://github.com/Pseudonium/Obsidian_to_Anki) for more information.
