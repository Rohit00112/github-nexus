"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useGitHub } from "../../context/GitHubContext";
import ProjectColumn from "./ProjectColumn";
import CreateColumnModal from "./CreateColumnModal";

interface ProjectBoardProps {
  projectId: number;
  initialColumns: any[];
  initialCards: Record<number, any[]>;
  onColumnCreated: (column: any) => void;
  onColumnDeleted: (columnId: number) => void;
  onColumnUpdated: (columnId: number, name: string) => void;
}

export default function ProjectBoard({
  projectId,
  initialColumns,
  initialCards,
  onColumnCreated,
  onColumnDeleted,
  onColumnUpdated,
}: ProjectBoardProps) {
  const { githubService } = useGitHub();
  const [columns, setColumns] = useState<any[]>(initialColumns);
  const [cards, setCards] = useState<Record<number, any[]>>(initialCards);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    setColumns(initialColumns);
    setCards(initialCards);
  }, [initialColumns, initialCards]);

  // Handle drag end event
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Extract column IDs from droppable IDs
    const sourceColumnId = parseInt(source.droppableId.replace("column-", ""), 10);
    const destinationColumnId = parseInt(destination.droppableId.replace("column-", ""), 10);
    const cardId = parseInt(draggableId.replace("card-", ""), 10);

    // Create a copy of the cards state
    const newCards = { ...cards };

    // Remove card from source column
    const sourceCards = [...newCards[sourceColumnId]];
    const [movedCard] = sourceCards.splice(source.index, 1);
    newCards[sourceColumnId] = sourceCards;

    // Add card to destination column
    const destinationCards = [...(newCards[destinationColumnId] || [])];
    destinationCards.splice(destination.index, 0, movedCard);
    newCards[destinationColumnId] = destinationCards;

    // Update local state optimistically
    setCards(newCards);

    // Determine position parameter for GitHub API
    let position: string;
    if (destination.index === 0) {
      position = "top";
    } else if (destination.index === destinationCards.length - 1) {
      position = "bottom";
    } else {
      // Position after the card at the index before the destination index
      const afterCardId = destinationCards[destination.index - 1].id;
      position = `after:${afterCardId}`;
    }

    // Call GitHub API to move the card
    try {
      setIsLoading(true);
      setError(null);

      if (sourceColumnId === destinationColumnId) {
        // Moving within the same column
        await githubService?.moveCard(cardId, position);
      } else {
        // Moving to a different column
        await githubService?.moveCard(cardId, position, destinationColumnId);
      }
    } catch (error) {
      console.error("Error moving card:", error);
      setError("Failed to move card. The UI will be refreshed.");
      
      // Revert to initial state on error
      setCards(initialCards);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle card creation
  const handleAddCard = async (columnId: number) => {
    if (!githubService) return;
    
    try {
      setIsLoading(true);
      
      // Refresh cards for the column
      const columnCards = await githubService.getColumnCards(columnId);
      
      // Update local state
      setCards({
        ...cards,
        [columnId]: columnCards,
      });
    } catch (error) {
      console.error("Error refreshing cards:", error);
      setError("Failed to refresh cards after adding a new card.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle card deletion
  const handleDeleteCard = (cardId: number) => {
    // Update local state by removing the deleted card
    const newCards = { ...cards };
    
    for (const columnId in newCards) {
      newCards[columnId] = newCards[columnId].filter(card => card.id !== cardId);
    }
    
    setCards(newCards);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Project Columns</h2>
        <button
          onClick={() => setShowCreateColumnModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded-md transition-colors flex items-center text-sm"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Column
        </button>
      </div>
      
      {columns.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {columns.map(column => (
              <Droppable key={column.id} droppableId={`column-${column.id}`}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="h-full"
                  >
                    <ProjectColumn
                      column={column}
                      cards={cards[column.id] || []}
                      onDeleteColumn={onColumnDeleted}
                      onUpdateColumn={onColumnUpdated}
                      onAddCard={handleAddCard}
                      onDeleteCard={handleDeleteCard}
                      isDraggable={true}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No columns yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Add columns to organize your project tasks and issues.
          </p>
          <button
            onClick={() => setShowCreateColumnModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Add your first column
          </button>
        </div>
      )}
      
      {showCreateColumnModal && (
        <CreateColumnModal
          isOpen={showCreateColumnModal}
          onClose={() => setShowCreateColumnModal(false)}
          projectId={projectId}
          onColumnCreated={onColumnCreated}
        />
      )}
    </div>
  );
}
