import React from "react";
import SudokuKnowledgeGame from "./knowledge/SudokuKnowledgeGame";
import DominoKnowledgeGame from "./knowledge/DominoKnowledgeGame";
import HangmanKnowledgeGame from "./knowledge/HangmanKnowledgeGame";
import SolitaireKnowledgeGame from "./knowledge/SolitaireKnowledgeGame";
import PuzzleKnowledgeGame from "./knowledge/PuzzleKnowledgeGame";
import CrosswordKnowledgeGame from "./knowledge/CrosswordKnowledgeGame";
import WordSearchKnowledgeGame from "./knowledge/WordSearchKnowledgeGame";

function KnowledgeArcadeGame({ variant }) {
  if (variant === "sudoku") {
    return <SudokuKnowledgeGame />;
  }
  if (variant === "domino") {
    return <DominoKnowledgeGame />;
  }
  if (variant === "ahorcado") {
    return <HangmanKnowledgeGame />;
  }
  if (variant === "paciencia") {
    return <SolitaireKnowledgeGame />;
  }
  if (variant === "puzle") {
    return <PuzzleKnowledgeGame />;
  }
  if (variant === "crucigrama") {
    return <CrosswordKnowledgeGame />;
  }
  if (variant === "sopa-letras") {
    return <WordSearchKnowledgeGame />;
  }

  return <SudokuKnowledgeGame />;
}

export default KnowledgeArcadeGame;

