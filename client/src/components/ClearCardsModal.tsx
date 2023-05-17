import React from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";

type ClearCardsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onKeep: () => void;
};

const ClearCardsModal: React.FC<ClearCardsModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  onKeep,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Clear Cards Confirmation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Before generating new cards would you like to clear all the current
          cards?
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={2} onClick={onDelete}>
            Delete
          </Button>
          <Button colorScheme="blue" mr={2} onClick={onKeep}>
            Keep
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClearCardsModal;
