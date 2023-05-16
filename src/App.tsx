import {
  ChakraProvider,
  theme,
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

export const App = () => {
  const { colorMode, toggleColorMode } = useColorMode();
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

  return (
    <ChakraProvider theme={theme}>
      <Container
        minWidth={900}
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
        />
        <Heading as="h1" fontSize={25} color="blue.400" mt={50}>
          Suggested Cards
        </Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap={6} width="100%" mt={8}>
          {cards
            .filter((card) => card.status === "suggested")
            .map((card, index) => (
              <Card maxW="sm" key={card.uuid} p={1}>
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
        <Grid templateColumns="repeat(3, 1fr)" gap={6} width="100%" mt={8}>
          {cards
            .filter((card) => card.status === "accepted")
            .map((card, index) => (
              <Card maxW="sm" key={card.uuid} p={1}>
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
        <Button mt={10} mb={20} colorScheme="purple">
          Copy markdown to clipboard
        </Button>
      </Container>
    </ChakraProvider>
  );
};
