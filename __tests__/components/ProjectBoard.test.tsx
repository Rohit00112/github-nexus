import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectBoard from '../../app/components/projects/ProjectBoard';
import { GitHubContext } from '../../app/context/GitHubContext';

// Mock the react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Droppable: ({ children }: { children: Function }) => children({
    innerRef: jest.fn(),
    droppableProps: {},
    placeholder: null,
  }),
  Draggable: ({ children }: { children: Function }) => children({
    innerRef: jest.fn(),
    draggableProps: {},
    dragHandleProps: {},
  }),
}));

// Mock the GitHubContext
const mockGitHubService = {
  moveCard: jest.fn(),
  getColumnCards: jest.fn(),
};

const mockColumns = [
  {
    id: 1,
    name: 'To Do',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    project_url: 'https://api.github.com/projects/1',
  },
  {
    id: 2,
    name: 'In Progress',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    project_url: 'https://api.github.com/projects/1',
  },
];

const mockCards = {
  1: [
    {
      id: 101,
      note: 'Task 1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      column_url: 'https://api.github.com/projects/columns/1',
    },
    {
      id: 102,
      note: 'Task 2',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      column_url: 'https://api.github.com/projects/columns/1',
    },
  ],
  2: [
    {
      id: 201,
      note: 'Task 3',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      column_url: 'https://api.github.com/projects/columns/2',
    },
  ],
};

describe('ProjectBoard Component', () => {
  const renderComponent = () => {
    return render(
      <GitHubContext.Provider value={{ githubService: mockGitHubService }}>
        <ProjectBoard
          projectId={1}
          initialColumns={mockColumns}
          initialCards={mockCards}
          onColumnCreated={jest.fn()}
          onColumnDeleted={jest.fn()}
          onColumnUpdated={jest.fn()}
        />
      </GitHubContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the project board with columns and cards', () => {
    renderComponent();
    
    // Check if columns are rendered
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    
    // Check if cards are rendered
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Task 3')).toBeInTheDocument();
  });

  it('shows the "Add Column" button', () => {
    renderComponent();
    
    const addColumnButton = screen.getByText('Add Column');
    expect(addColumnButton).toBeInTheDocument();
  });

  it('handles card refresh after adding a card', async () => {
    mockGitHubService.getColumnCards.mockResolvedValue([
      {
        id: 101,
        note: 'Task 1',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        column_url: 'https://api.github.com/projects/columns/1',
      },
      {
        id: 102,
        note: 'Task 2',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        column_url: 'https://api.github.com/projects/columns/1',
      },
      {
        id: 103,
        note: 'New Task',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        column_url: 'https://api.github.com/projects/columns/1',
      },
    ]);

    renderComponent();
    
    // Simulate adding a card
    await ProjectBoard.prototype.handleAddCard(1);
    
    expect(mockGitHubService.getColumnCards).toHaveBeenCalledWith(1);
  });
});
