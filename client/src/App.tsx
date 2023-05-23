import {
  useColorMode,
  Button,
  Container,
  Flex,
  Heading,
  Textarea,
  Text,
  Grid,
  Card,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Flashcard from "./components/Flashcard";
import ClearCardsModal from "./components/ClearCardsModal";

export const App = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);
  const [cards, setCards] = useState([
    {
      uuid: "1",
      topic: "Dijkstra's algorithm",
      question: "What is Dijkstra's algorithm?",
      answer:
        "Dijkstra's algorithm is an algorithm for finding the shortest paths between nodes in a graph. It was conceived by computer scientist Edsger W. Dijkstra in 1956 and published three years later.",
      status: "suggested",
    },
    {
      uuid: "2",
      topic: "Temperature of the sun",
      question: "What is the temperature of the sun?",
      answer: "The temperature of the sun is 5,778 K.",
      status: "accepted",
    },
  ]);

  const toast = useToast();

  const handleClearModalOpen = () => {
    setShowClearModal(true);
  };

  const handleClearModalClose = () => {
    setShowClearModal(false);
  };

  const handleClearCards = () => {
    setCards([]);
  };

  const handleStatusChange = (uuid: string, status: string) => {
    const newCards = [...cards];
    const targetCardIdx = newCards.findIndex((card) => card.uuid === uuid);
    newCards[targetCardIdx].status = status;
    setCards(newCards);
  };

  const handleRemove = (uuid: string) => {
    const newCards = [...cards];
    const targetCardIdx = newCards.findIndex((card) => card.uuid === uuid);
    newCards.splice(targetCardIdx, 1);
    setCards(newCards);
  };

  const handleClickGenerate = () => {
    if (cards.length > 0) {
      handleClearModalOpen(); // Show the modal
    } else {
      generate();
    }
  };

  const generate = async () => {
    console.log("Generating flashcards");
    setIsLoading(true); // Set isLoading to true

    // set a 500ms delay before generating the flashcards
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const response = await axios.post("http://localhost:5050/generateCards", {
        content: content,
      });

      const generatedCards = response.data.flashcards.map((card: object) => ({
        ...card,
        uuid: uuidv4(),
        status: "suggested",
      }));

      setCards((prevCards) => [...prevCards, ...generatedCards]);

      const tokensUsed = response.data.totalTokens;
      setTotalTokensUsed(
        (prevTotalTokensUsed) => prevTotalTokensUsed + tokensUsed
      );

      toast({
        title: "Generation Successful",
        status: "success",
        duration: 3000, // 3 seconds
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
      toast({
        title: "Generation Failed",
        status: "error",
        duration: 3000, // 3 seconds
        isClosable: true,
      });
    } finally {
      setIsLoading(false); // Set isLoading back to false
    }
  };

  const handleCopyMarkdown = () => {
    const acceptedCards = cards.filter((card) => card.status === "accepted");

    if (acceptedCards.length === 0) {
      console.log("No accepted cards to copy.");
      return;
    }

    let markdown = "";
    acceptedCards.forEach((card) => {
      markdown += `Q: **${card.question}**\n`;
      markdown += `A: {${card.answer}}\n\n`;
    });

    // Copy the markdown to the clipboard
    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        console.log("Markdown copied to clipboard:", markdown);
        toast({
          title: "Markdown Copied",
          status: "success",
          duration: 3000, // 3 seconds
          isClosable: true,
        });
      })
      .catch((error) => {
        console.error("Failed to copy markdown to clipboard:", error);
        toast({
          title: "Copying Failed",
          status: "error",
          duration: 3000, // 3 seconds
          isClosable: true,
        });
      });
  };

  const handleGenerateReverseCards = async () => {
    const acceptedCards = cards.filter((card) => card.status === "accepted");
    const acceptedMarkdown = acceptedCards
      .map((card) => `Q: **${card.question}**\nA: {${card.answer}}`)
      .join("\n\n");

    try {
      const response = await axios.post("http://localhost:5050/getReverseCards", {
        content: acceptedMarkdown,
      });

      const reverseCards = response.data.flashcards.map((card: object) => ({
        ...card,
        uuid: uuidv4(),
        status: "suggested",
      }));

      setCards((prevCards) => [...prevCards, ...reverseCards]);

      const tokensUsed = response.data.totalTokens;
      setTotalTokensUsed(
        (prevTotalTokensUsed) => prevTotalTokensUsed + tokensUsed
      );

      toast({
        title: "Reverse Cards Generated",
        status: "success",
        duration: 3000, // 3 seconds
        isClosable: true,
      });
    } catch (error) {
      console.error(error);

      toast({
        title: "Failed to Generate Reverse Cards",
        status: "error",
        duration: 3000, // 3 seconds
        isClosable: true,
      });
    }
  };

  return (
    <Container
      maxW="container.xl"
      pt={5}
      justifyContent={"center"}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Flex
        justifyContent="space-between"
        width="100%"
        alignItems="center"
        mb={10}
      >
        <Heading as="h1" fontSize={25} color="blue.400">
          GPT Flashcards
        </Heading>
        <Button onClick={toggleColorMode}>
          {colorMode === "light" ? "Dark" : "Light"}
        </Button>
      </Flex>
      <Textarea
        placeholder="Enter content to generate flashcards here"
        height={300}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button
        mt={5}
        colorScheme="pink"
        onClick={handleClickGenerate}
        isLoading={isLoading}
        loadingText="Generating"
      >
        Generate Flashcards
      </Button>
      <Heading as="h1" fontSize={25} color="blue.400" mt={50}>
        Suggested Cards
      </Heading>
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)", // default: 1 column
          md: "repeat(2, 1fr)", // 2 columns on md breakpoint
          lg: "repeat(3, 1fr)", // 3 columns on lg breakpoint
          xl: "repeat(4, 1fr)", // 4 columns on xl breakpoint
        }}
        gap={6}
        width="100%"
        mt={8}
      >
        {cards
          .filter((card) => card.status === "suggested")
          .map((card) => (
            <Flashcard
              key={card.uuid}
              card={card}
              handleRemove={handleRemove}
              handleStatusChange={handleStatusChange}
              accepted={false}
            />
          ))}
      </Grid>
      {cards.filter((card) => card.status === "suggested").length === 0 && (
        <Card p={4} boxShadow="md">
          <Text>No suggested cards so far</Text>
        </Card>
      )}
      <ClearCardsModal
        isOpen={showClearModal}
        onClose={handleClearModalClose}
        onDelete={() => {
          handleClearCards();
          handleClearModalClose();
          generate();
        }}
        onKeep={() => {
          handleClearModalClose();
          generate();
        }}
      />

      <Heading as="h1" fontSize={25} color="purple.300" mt={50}>
        Accepted Cards
      </Heading>
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)", // default: 1 column
          md: "repeat(2, 1fr)", // 2 columns on md breakpoint
          lg: "repeat(3, 1fr)", // 3 columns on lg breakpoint
          xl: "repeat(4, 1fr)", // 4 columns on xl breakpoint
        }}
        gap={6}
        width="100%"
        mt={8}
      >
        {cards
          .filter((card) => card.status === "accepted")
          .map((card) => (
            <Flashcard
              key={card.uuid}
              card={card}
              handleRemove={handleRemove}
              handleStatusChange={handleStatusChange}
              accepted={true}
            />
          ))}
      </Grid>
      {cards.filter((card) => card.status === "accepted").length === 0 && (
        <Card p={4} boxShadow="md">
          <Text>No accepted cards so far</Text>
        </Card>
      )}
      <Button mt={10} mb={5} colorScheme="purple" onClick={handleCopyMarkdown}>
        Copy markdown to clipboard
      </Button>
      <Button mb={5} colorScheme="twitter" onClick={handleGenerateReverseCards}>
        Generate reverse accepted cards
      </Button>
      <Text fontSize={13} mb={20} color="gray.500">
        Total tokens used: {totalTokensUsed}
      </Text>
    </Container>
  );
};
