import {
  useColorMode,
  Button,
  Container,
  Flex,
  Heading,
  Textarea,
  Text,
  Grid,
  Stack,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export const App = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);

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
      topic: "Temp of sun",
      question: "What is the temperature of the sun?",
      answer: "The temperature of the sun is 5,778 K.",
      status: "accepted",
    },
  ]);

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

  const handleGenerate = async () => {
    console.log("Generating flashcards");
    setIsLoading(true); // Set isLoading to true

    try {
      const response = await axios.post("http://localhost:5050/generateCards", {
        content: content,
      });

      const generatedCards = response.data.flashcards.map((card: object) => ({
        ...card,
        uuid: uuidv4(),
        status: "suggested",
      }));
      setCards([...cards, ...generatedCards]);

      const tokensUsed = response.data.totalTokens;
      setTotalTokensUsed(
        (prevTotalTokensUsed) => prevTotalTokensUsed + tokensUsed
      );
    } catch (error) {
      console.error("Failed to generate flashcards:", error);
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
      markdown += `Topic: ${card.topic}\n`;
      markdown += `Q: **${card.question}**\n`;
      markdown += `A: {${card.answer}}\n\n`;
    });

    // Copy the markdown to the clipboard
    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        console.log("Markdown copied to clipboard:", markdown);
      })
      .catch((error) => {
        console.error("Failed to copy markdown to clipboard:", error);
      });
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
        onClick={handleGenerate}
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
            <Card key={card.uuid} p={1}>
              <CardBody>
                <Stack spacing="3">
                  <Heading size="md">{card.topic}</Heading>
                  <Text>
                    <Text as="span" fontWeight="bold" color="blue.400">
                      Q:
                    </Text>{" "}
                    {card.question}
                  </Text>
                  <Text>
                    <Text as="span" fontWeight="bold" color="blue.400">
                      A:
                    </Text>{" "}
                    {card.answer}
                  </Text>
                </Stack>
              </CardBody>
              <CardFooter>
                <ButtonGroup display="flex" width="100%">
                  <Button
                    fontSize={13}
                    width={"50%"}
                    onClick={() => handleRemove(card.uuid)}
                  >
                    Remove
                  </Button>
                  <Button
                    fontSize={13}
                    colorScheme="blue"
                    width={"50%"}
                    onClick={() => handleStatusChange(card.uuid, "accepted")}
                  >
                    Accept
                  </Button>
                </ButtonGroup>
              </CardFooter>
            </Card>
          ))}
      </Grid>
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
            <Card key={card.uuid} p={1}>
              <CardBody>
                <Stack spacing="3">
                  <Heading size="md">{card.topic}</Heading>
                  <Text>
                    <Text as="span" fontWeight="bold" color="blue.400">
                      Q:
                    </Text>{" "}
                    {card.question}
                  </Text>
                  <Text>
                    <Text as="span" fontWeight="bold" color="blue.400">
                      A:
                    </Text>{" "}
                    {card.answer}
                  </Text>
                </Stack>
              </CardBody>
              <CardFooter>
                <ButtonGroup display="flex" width="100%">
                  <Button
                    fontSize={13}
                    width={"50%"}
                    onClick={() => handleRemove(card.uuid)}
                  >
                    Remove
                  </Button>
                  <Button
                    fontSize={13}
                    width={"50%"}
                    onClick={() => handleStatusChange(card.uuid, "suggested")}
                  >
                    Unaccept
                  </Button>
                </ButtonGroup>
              </CardFooter>
            </Card>
          ))}
      </Grid>
      <Button mt={10} mb={5} colorScheme="purple" onClick={handleCopyMarkdown}>
        Copy markdown to clipboard
      </Button>
      <Text fontSize={13} mb={20} color="gray.500">
        Total tokens used: {totalTokensUsed}
      </Text>
    </Container>
  );
};
