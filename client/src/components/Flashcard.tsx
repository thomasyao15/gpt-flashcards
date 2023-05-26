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
import { ContextMenu } from 'chakra-ui-contextmenu';
import { MenuList, MenuItem } from '@chakra-ui/menu';
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
    setTimeout(() => questionRef.current && questionRef.current.focus(), 0);
  };

  const handleSave = (): void => {
    setIsEditing(false);
    setCards((prevCards: CardType[]) =>
      prevCards.map((c) =>
        c.uuid === card.uuid
          ? { ...c, question: editedQuestion.trim(), answer: editedAnswer.trim() }
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
    <ContextMenu<HTMLDivElement>
      renderMenu={() => (
        <MenuList>
          <MenuItem onClick={handleEdit}>Edit Flashcard</MenuItem>
        </MenuList>
      )}
    >
      {ref =>
        <Card key={card.uuid} ref={ref}>
          <CardBody p={0}>
            <Box display={"flex"} justifyContent="space-between" alignItems="center" p={5}>
              <Text size="sm">{card.topic}</Text>
              {isEditing ? (
                <Box ml={1}>
                  <CloseIcon onClick={handleCancel} cursor={"pointer"} mr={2} boxSize={3} color={"red.300"} />
                  <CheckIcon onClick={handleSave} cursor={"pointer"} boxSize={4} color={"green.300"} />
                </Box>
              ) : (
                <EditIcon onClick={handleEdit} cursor={"pointer"} color={"gray.600"} />
              )}
            </Box>
            <Divider />
            <Stack spacing="3" p={5}>
              <Box>
                <Text>
                  <Text as="span" fontWeight="bold" color={accepted ? "purple.400" : "blue.500"}>
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
                      if ((e.key === 'Enter') && (e.metaKey || e.ctrlKey)) {
                        handleSave();
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
                  <Text as="span" fontWeight="bold" color={accepted ? "purple.400" : "blue.500"}>
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
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter') && (e.metaKey || e.ctrlKey)) {
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
      }
    </ContextMenu>
  );
};

export default Flashcard;
