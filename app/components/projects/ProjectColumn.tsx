"use client";

import { useState } from "react";
import { useGitHub } from "../../context/GitHubContext";
import ProjectCard from "./ProjectCard";

interface ProjectColumnProps {
  column: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    project_url: string;
  };
  cards: Array<{
    id: number;
    note: string;
    created_at: string;
    updated_at: string;
    column_url: string;
    content_url?: string;
    creator?: {
      login: string;
      avatar_url: string;
    };
  }>;
  onDeleteColumn: (columnId: number) => void;
  onUpdateColumn: (columnId: number, name: string) => void;
  onAddCard: (columnId: number) => void;
  onDeleteCard: (cardId: number) => void;
  onMoveCard: (cardId: number, columnId: number, position: string) => void;
}

export default function ProjectColumn({
  column,
  cards,
  onDeleteColumn,
  onUpdateColumn,
  onAddCard,
  onDeleteCard,
  onMoveCard,
}: ProjectColumnProps) {
  const { githubService } = useGitHub();
  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNote, setNewCardNote] = useState("");

  // Handle column name update
  const handleUpdateColumn = async () => {
    if (!githubService || !columnName.trim()) return;
    
    try {
      setIsLoading(true);
      await githubService.updateProjectColumn(column.id, columnName);
      onUpdateColumn(column.id, columnName);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating column:", error);
      alert("Failed to update column. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle column deletion
  const handleDeleteColumn = async () => {
    if (!githubService) return;
    
    if (window.confirm(`Are you sure you want to delete the column "${column.name}"?`)) {
      try {
        setIsLoading(true);
        await githubService.deleteProjectColumn(column.id);
        onDeleteColumn(column.id);
      } catch (error) {
        console.error("Error deleting column:", error);
        alert("Failed to delete column. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle card creation
  const handleAddCard = async () => {
    if (!githubService || !newCardNote.trim()) return;
    
    try {
      setIsLoading(true);
      await githubService.createCard(column.id, { note: newCardNote });
      onAddCard(column.id);
      setNewCardNote("");
      setShowAddCard(false);
    } catch (error) {
      console.error("Error creating card:", error);
      alert("Failed to create card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle card deletion
  const handleDeleteCard = async (cardId: number) => {
    if (!githubService) return;
    
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        setIsLoading(true);
        await githubService.deleteCard(cardId);
        onDeleteCard(cardId);
      } catch (error) {
        console.error("Error deleting card:", error);
        alert("Failed to delete card. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md w-80 flex-shrink-0">
      <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-t-lg flex justify-between items-center">
        {isEditing ? (
          <div className="flex-1">
            <input
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
              placeholder="Column name"
              autoFocus
            />
            <div className="flex mt-1 space-x-2">
              <button
                onClick={handleUpdateColumn}
                disabled={isLoading || !columnName.trim()}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setColumnName(column.name);
                  setIsEditing(false);
                }}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h3 className="font-medium text-gray-800 dark:text-white">{column.name}</h3>
        )}
        {!isEditing && (
          <div className="flex space-x-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              title="Edit column"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteColumn}
              disabled={isLoading}
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
              title="Delete column"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {cards.length > 0 ? (
          <div className="space-y-2">
            {cards.map((card) => (
              <div key={card.id} className="bg-white dark:bg-gray-900 rounded-md shadow-sm p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {card.note}
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2"
                    title="Delete card"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {card.creator && (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <img src={card.creator.avatar_url} alt={card.creator.login} className="w-4 h-4 rounded-full mr-1" />
                    <span>{card.creator.login}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
            No cards in this column
          </div>
        )}
        
        {showAddCard ? (
          <div className="mt-2 bg-white dark:bg-gray-900 rounded-md shadow-sm p-3">
            <textarea
              value={newCardNote}
              onChange={(e) => setNewCardNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-sm"
              placeholder="Enter card content..."
              rows={3}
              autoFocus
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => {
                  setNewCardNote("");
                  setShowAddCard(false);
                }}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCard}
                disabled={isLoading || !newCardNote.trim()}
                className="text-xs bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full mt-2 flex items-center justify-center py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add card
          </button>
        )}
      </div>
    </div>
  );
}
