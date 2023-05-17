import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Stack,
  Text,
  Divider,
  ButtonGroup,
  Button,
} from "@chakra-ui/react";

// Define the prop types for the Card component
type CardProps = {
  card: {
    uuid: string;
    topic: string;
    question: string;
    answer: string;
  };
  handleRemove: (uuid: string) => void;
  handleStatusChange: (uuid: string, status: string) => void;
  accepted: boolean;
};

const Flashcard: React.FC<CardProps> = ({
  card,
  handleRemove,
  handleStatusChange,
  accepted,
}) => {
  return (
    <Card key={card.uuid} p={1}>
      <CardBody>
        <Stack spacing="3">
          <Text size="sm">{card.topic}</Text>
          <Divider />
          <Text>
            <Text as="span" fontWeight="bold" color="blue.400">
              Q:
            </Text>{" "}
            <Text
              as="span"
              fontWeight="bold"
              color={accepted ? "white" : "pink.400"}
            >
              {card.question}
            </Text>{" "}
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
            colorScheme={accepted ? "gray" : "blue"}
            width={"50%"}
            onClick={
              accepted
                ? () => handleStatusChange(card.uuid, "suggested")
                : () => handleStatusChange(card.uuid, "accepted")
            }
          >
            {accepted ? "Unaccept" : "Accept"}
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
};

export default Flashcard;
