import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Stack,
  Text,
  Divider,
  ButtonGroup,
  Button,
  Textarea,
  Box,
} from "@chakra-ui/react";
import { EditIcon, CloseIcon, CheckIcon } from "@chakra-ui/icons";
import { CardType } from "../types";

// Define the prop types for the Card component
type CardProps = {
  card: CardType;
  handleRemove: (uuid: string) => void;
  handleStatusChange: (uuid: string, status: string) => void;
  accepted: boolean;
  setCards: any;
};

const Flashcard: React.FC<CardProps> = ({
  card,
  handleRemove,
  handleStatusChange,
  accepted,
  setCards,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(card.question);
  const [editedAnswer, setEditedAnswer] = useState(card.answer);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (): void => {
    setIsEditing(false);
    setCards((prevCards: CardType[]) =>
      prevCards.map((c) =>
        c.uuid === card.uuid
          ? { ...c, question: editedQuestion, answer: editedAnswer }
          : c
      )
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedQuestion(card.question);
    setEditedAnswer(card.answer);
  };

  return (
    <Card key={card.uuid} p={1}>
      <CardBody>
        <Stack spacing="3">
          <Text size="sm">{card.topic}</Text>
          <Divider />
          <Box display={"flex"} justifyContent="space-between">
            <Text>
              <Text as="span" fontWeight="bold" color="blue.400">
                Q:
              </Text>{" "}
              {isEditing ? (
                <Textarea
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                />
              ) : (
                <Text
                  as="span"
                  fontWeight="bold"
                  color={accepted ? "white" : "pink.400"}
                >
                  {card.question}
                </Text>
              )}
            </Text>
            <EditIcon onClick={handleEdit} />
          </Box>
          <Box display={"flex"} justifyContent="space-between">
            <Text>
              <Text as="span" fontWeight="bold" color="blue.400">
                A:
              </Text>{" "}
              {isEditing ? (
                <Textarea
                  value={editedAnswer}
                  onChange={(e) => setEditedAnswer(e.target.value)}
                />
              ) : (
                card.answer
              )}
            </Text>
            {isEditing ? (
              <Box>
                <CheckIcon onClick={handleSave} />
                <CloseIcon onClick={handleCancel} />
              </Box>
            ) : null}
          </Box>
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
