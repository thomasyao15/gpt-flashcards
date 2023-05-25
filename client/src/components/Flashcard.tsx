import React, { useEffect, useRef, useState } from "react";
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
import autosize from "autosize";

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

  const answerRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (answerRef.current) {
      autosize(answerRef.current);
    }

    return () => {
      if (answerRef.current) {
        autosize.destroy(answerRef.current);
      }
    };
  }, [isEditing]);

  const questionRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (questionRef.current) {
      autosize(questionRef.current);
    }

    return () => {
      if (questionRef.current) {
        autosize.destroy(questionRef.current);
      }
    };
  }, [isEditing]);



  return (
    <Card key={card.uuid} p={1}>
      <CardBody>
        <Stack spacing="3">
          <Box display={"flex"} justifyContent="space-between" alignItems="center">
            <Text size="sm">{card.topic}</Text>
            {isEditing ? (
              <Box>
                <CheckIcon onClick={handleSave} cursor={"pointer"} mr={2} boxSize={4} color={"green.300"} />
                <CloseIcon onClick={handleCancel} cursor={"pointer"} boxSize={3} color={"red.300"} />
              </Box>
            ) : (
              <EditIcon onClick={handleEdit} cursor={"pointer"} color={"gray.600"} />
            )}
          </Box>
          <Divider />
          <Box>
            <Text>
              <Text as="span" fontWeight="bold" color="blue.400">
                Q:
              </Text>{" "}
              {!isEditing && (
                <Text
                  as="span"
                  fontWeight="bold"
                  color={accepted ? "white" : "pink.400"}
                >
                  {card.question}
                </Text>
              )}
            </Text>
            {isEditing && (
              <Textarea
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                p="2"
                minH={"unset"}
                transition="height none"
                ref={questionRef}
              />
            )}
          </Box>

          <Box>
            <Text>
              <Text as="span" fontWeight="bold" color="blue.400">
                A:
              </Text>{" "}
              {!isEditing && (
                card.answer
              )}
            </Text>
            {isEditing && (
              <Textarea
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                p="2"
                minH={"unset"}
                transition="height none"
                ref={answerRef}
              />
            )}
          </Box>
        </Stack>
      </CardBody>
      {!isEditing && (
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
        </CardFooter>)}
    </Card>
  );
};

export default Flashcard;
