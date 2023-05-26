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
  setFocusedCard: any;
  focusedCard: string | null;
};

const Flashcard: React.FC<CardProps> = ({
  card,
  handleRemove,
  handleStatusChange,
  accepted,
  setCards,
  setFocusedCard,
  focusedCard,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState(card.question);
  const [editedAnswer, setEditedAnswer] = useState(card.answer);
  const [isFocused, setIsFocused] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => questionRef.current && questionRef.current.focus(), 0);
  };

  const handleSave = (): void => {
    setIsEditing(false);
    setCards((prevCards: CardType[]) =>
      prevCards.map((c) =>
        c.uuid === card.uuid
          ? {
            ...c,
            question: editedQuestion.trim(),
            answer: editedAnswer.trim(),
          }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditing && !e.metaKey && !e.ctrlKey) {
      switch (e.key) {
        case "a":
          accepted
            ? handleStatusChange(card.uuid, "suggested")
            : handleStatusChange(card.uuid, "accepted");
          break;
        case "r":
          handleRemove(card.uuid);
          break;
        case "Enter":
        case "e":
          handleEdit();
          break;
        default:
          break;
      }
    }
  };

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (card.uuid === focusedCard) {
      cardRef.current?.focus();
    }
  }, [focusedCard, card.uuid]);

  return (

    <Card
      key={card.uuid}
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => {
        cardRef.current?.focus()
        setFocusedCard(card.uuid);
      }}
      onFocus={() => {
        setIsFocused(true);
        setFocusedCard(card.uuid);
      }}
      onBlur={() => setIsFocused(false)}
      boxShadow={isFocused ? "outline" : "none"}
      outline={"none"}
    >
      <CardBody p={0}>
        <Box
          display={"flex"}
          justifyContent="space-between"
          alignItems="center"
          p={5}
        >
          <Text size="sm">{card.topic}</Text>
          {isEditing ? (
            <Box ml={1}>
              <CloseIcon
                onClick={handleCancel}
                cursor={"pointer"}
                mr={2}
                boxSize={3}
                color={"red.300"}
              />
              <CheckIcon
                onClick={handleSave}
                cursor={"pointer"}
                boxSize={4}
                color={"green.300"}
              />
            </Box>
          ) : (
            <EditIcon
              onClick={handleEdit}
              cursor={"pointer"}
              color={"gray.600"}
            />
          )}
        </Box>
        <Divider />
        <Stack spacing="3" p={5}>
          <Box>
            <Text>
              <Text
                as="span"
                fontWeight="bold"
                color={accepted ? "purple.400" : "blue.500"}
              >
                Q:
              </Text>{" "}
              {!isEditing && (
                <Text
                  as="span"
                  fontWeight="bold"
                  color={accepted ? "purple.200" : "blue.200"}
                >
                  {card.question}
                </Text>
              )}
            </Text>
            {isEditing && (
              <Textarea
                value={editedQuestion}
                onChange={(e) => setEditedQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSave();
                    cardRef.current?.focus()
                  }
                }}
                p="2"
                mt={1}
                minH={"unset"}
                transition="height none"
                ref={questionRef}
              />
            )}
          </Box>

          <Box>
            <Text>
              <Text
                as="span"
                fontWeight="bold"
                color={accepted ? "purple.400" : "blue.500"}
              >
                A:
              </Text>{" "}
              {!isEditing && card.answer}
            </Text>
            {isEditing && (
              <Textarea
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleSave();
                  }
                }}
                p="2"
                mt={1}
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
              tabIndex={-1}
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
              tabIndex={-1}
            >
              {accepted ? "Unaccept" : "Accept"}
            </Button>
          </ButtonGroup>
        </CardFooter>
      )}
    </Card>
  );
};

export default Flashcard;
