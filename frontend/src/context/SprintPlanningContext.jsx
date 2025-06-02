import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { api } from '../api';

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PROJECTS: 'SET_PROJECTS',
  SET_BOARDS: 'SET_BOARDS',
  SET_SELECTED_PROJECT: 'SET_SELECTED_PROJECT',
  SET_SELECTED_BOARD: 'SET_SELECTED_BOARD',
  SET_SPRINTS: 'SET_SPRINTS',
  SET_BACKLOG_ISSUES: 'SET_BACKLOG_ISSUES',
  ADD_ISSUE_TO_BACKLOG: 'ADD_ISSUE_TO_BACKLOG',
  MOVE_ISSUE_TO_SPRINT: 'MOVE_ISSUE_TO_SPRINT',
  MOVE_ISSUE_TO_BACKLOG: 'MOVE_ISSUE_TO_BACKLOG',
  UPDATE_ISSUE: 'UPDATE_ISSUE',
  ADD_SPRINT: 'ADD_SPRINT',
  UPDATE_SPRINT: 'UPDATE_SPRINT',
  RESET_STATE: 'RESET_STATE'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  projects: [],
  boards: [],
  selectedProject: '',
  selectedBoard: '',
  sprints: [],
  backlogIssues: [],
  dragLoading: false
};

// Reducer function
const sprintPlanningReducer = (state, action) => {
  console.log('🔄 State update:', action.type, action.payload);
  
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
      
    case ACTIONS.SET_PROJECTS:
      return { ...state, projects: action.payload };
      
    case ACTIONS.SET_BOARDS:
      return { ...state, boards: action.payload };
      
    case ACTIONS.SET_SELECTED_PROJECT:
      return { 
        ...state, 
        selectedProject: action.payload,
        selectedBoard: '', // Reset board when project changes
        sprints: [],
        backlogIssues: []
      };
      
    case ACTIONS.SET_SELECTED_BOARD:
      return { 
        ...state, 
        selectedBoard: action.payload,
        sprints: [],
        backlogIssues: []
      };
      
    case ACTIONS.SET_SPRINTS:
      console.log('📋 Setting sprints:', action.payload);
      return { ...state, sprints: action.payload };
      
    case ACTIONS.SET_BACKLOG_ISSUES:
      console.log('📋 Setting backlog issues:', action.payload);
      return { ...state, backlogIssues: action.payload };
      
    case ACTIONS.ADD_ISSUE_TO_BACKLOG:
      console.log('📋 Adding issue to backlog:', action.payload);
      return { 
        ...state, 
        backlogIssues: [...state.backlogIssues, action.payload] 
      };
      
    case ACTIONS.MOVE_ISSUE_TO_SPRINT: {
      const { issueId, targetSprintId, sourceSprintId } = action.payload;

      // Find the issue
      let issueToMove = null;
      if (sourceSprintId) {
        // Moving from sprint to sprint
        const sourceSprint = state.sprints.find(s => s.id === sourceSprintId);
        issueToMove = sourceSprint?.issues?.find(i => i.id === issueId);
      } else {
        // Moving from backlog to sprint
        issueToMove = state.backlogIssues.find(i => i.id === issueId);
      }

      if (!issueToMove) return state;

      const movedIssue = { ...issueToMove, sprint_id: targetSprintId };

      return {
        ...state,
        backlogIssues: sourceSprintId ? state.backlogIssues :
          state.backlogIssues.filter(i => i.id !== issueId),
        sprints: state.sprints.map(sprint => {
          if (sprint.id === sourceSprintId) {
            // Remove from source sprint
            return {
              ...sprint,
              issues: sprint.issues?.filter(i => i.id !== issueId) || []
            };
          } else if (sprint.id === targetSprintId) {
            // Add to target sprint
            return {
              ...sprint,
              issues: [...(sprint.issues || []), movedIssue]
            };
          }
          return sprint;
        })
      };
    }
      
    case ACTIONS.MOVE_ISSUE_TO_BACKLOG: {
      const { issueId: backlogIssueId, sourceSprintId: fromSprintId } = action.payload;

      // Find the issue in the source sprint
      const fromSprint = state.sprints.find(s => s.id === fromSprintId);
      const issueToBacklog = fromSprint?.issues?.find(i => i.id === backlogIssueId);

      if (!issueToBacklog) return state;

      const backlogIssue = { ...issueToBacklog, sprint_id: null };

      return {
        ...state,
        backlogIssues: [...state.backlogIssues, backlogIssue],
        sprints: state.sprints.map(sprint => {
          if (sprint.id === fromSprintId) {
            return {
              ...sprint,
              issues: sprint.issues?.filter(i => i.id !== backlogIssueId) || []
            };
          }
          return sprint;
        })
      };
    }
      
    case ACTIONS.UPDATE_ISSUE: {
      const updatedIssue = action.payload;
      return {
        ...state,
        backlogIssues: state.backlogIssues.map(issue =>
          issue.id === updatedIssue.id ? updatedIssue : issue
        ),
        sprints: state.sprints.map(sprint => ({
          ...sprint,
          issues: sprint.issues?.map(issue =>
            issue.id === updatedIssue.id ? updatedIssue : issue
          ) || []
        }))
      };
    }
      
    case ACTIONS.ADD_SPRINT:
      return { 
        ...state, 
        sprints: [...state.sprints, { ...action.payload, issues: [] }] 
      };
      
    case ACTIONS.UPDATE_SPRINT:
      return {
        ...state,
        sprints: state.sprints.map(sprint =>
          sprint.id === action.payload.id ? action.payload : sprint
        )
      };
      
    case ACTIONS.RESET_STATE:
      return initialState;
      
    default:
      return state;
  }
};

// Context
const SprintPlanningContext = createContext();

// Provider component
export const SprintPlanningProvider = ({ children }) => {
  console.log('🏗️ SprintPlanningProvider mounting...');
  const [state, dispatch] = useReducer(sprintPlanningReducer, initialState);

  // Actions - Memoized to prevent infinite re-renders
  const actions = useMemo(() => ({
    setLoading: (loading) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error });
    },

    setProjects: (projects) => {
      dispatch({ type: ACTIONS.SET_PROJECTS, payload: projects });
    },

    setBoards: (boards) => {
      dispatch({ type: ACTIONS.SET_BOARDS, payload: boards });
    },

    setSelectedProject: (projectId) => {
      dispatch({ type: ACTIONS.SET_SELECTED_PROJECT, payload: projectId });
    },

    setSelectedBoard: (boardId) => {
      dispatch({ type: ACTIONS.SET_SELECTED_BOARD, payload: boardId });
    },

    setSprints: (sprints) => {
      dispatch({ type: ACTIONS.SET_SPRINTS, payload: sprints });
    },

    setBacklogIssues: (issues) => {
      dispatch({ type: ACTIONS.SET_BACKLOG_ISSUES, payload: issues });
    },

    addIssueToBacklog: (issue) => {
      dispatch({ type: ACTIONS.ADD_ISSUE_TO_BACKLOG, payload: issue });
    },

    moveIssueToSprint: (issueId, targetSprintId, sourceSprintId = null) => {
      dispatch({
        type: ACTIONS.MOVE_ISSUE_TO_SPRINT,
        payload: { issueId, targetSprintId, sourceSprintId }
      });
    },

    moveIssueToBacklog: (issueId, sourceSprintId) => {
      dispatch({
        type: ACTIONS.MOVE_ISSUE_TO_BACKLOG,
        payload: { issueId, sourceSprintId }
      });
    },

    updateIssue: (issue) => {
      dispatch({ type: ACTIONS.UPDATE_ISSUE, payload: issue });
    },

    addSprint: (sprint) => {
      dispatch({ type: ACTIONS.ADD_SPRINT, payload: sprint });
    },

    updateSprint: (sprint) => {
      dispatch({ type: ACTIONS.UPDATE_SPRINT, payload: sprint });
    },

    resetState: () => {
      dispatch({ type: ACTIONS.RESET_STATE });
    }
  }), [dispatch]);

  // API calls with state management - Using stable action references
  const fetchProjects = useCallback(async () => {
    try {
      actions.setLoading(true);
      const response = await api.projects.getAll({ limit: 100 });
      actions.setProjects(response.data.data.projects || []);
      actions.setError(null);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      actions.setError('Failed to load projects');
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const fetchBoards = useCallback(async (projectId) => {
    if (!projectId) {
      actions.setBoards([]);
      return;
    }

    try {
      const response = await api.boards.getAll(projectId);
      const boardsData = response.data.data.boards || [];
      actions.setBoards(boardsData);

      // Auto-select first board if available
      if (boardsData.length > 0 && !state.selectedBoard) {
        actions.setSelectedBoard(boardsData[0].id.toString());
      }
      actions.setError(null);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      actions.setError('Failed to load boards');
    }
  }, [actions, state.selectedBoard]);

  const fetchSprints = useCallback(async (boardId) => {
    if (!boardId) {
      actions.setSprints([]);
      return;
    }

    try {
      console.log('🔄 Fetching sprints for board:', boardId);

      const response = await api.sprints.getAll(boardId);
      const sprintsData = response.data.data.sprints || [];

      console.log('🏃 Sprints fetched:', sprintsData.length);

      // Fetch issues for each sprint
      const sprintsWithIssues = await Promise.all(
        sprintsData.map(async (sprint) => {
          try {
            console.log(`🔄 Fetching issues for sprint ${sprint.id}:`, sprint.name);
            const issuesResponse = await api.issues.getBySprint(sprint.id);
            const sprintIssues = issuesResponse.data.data.issues || [];
            console.log(`📋 Sprint ${sprint.id} has ${sprintIssues.length} issues`);
            return { ...sprint, issues: sprintIssues };
          } catch (err) {
            console.error(`Failed to fetch issues for sprint ${sprint.id}:`, err);
            return { ...sprint, issues: [] };
          }
        })
      );

      actions.setSprints(sprintsWithIssues);
      console.log('🏃 All sprints with issues loaded');
      actions.setError(null);
    } catch (err) {
      console.error('Failed to fetch sprints:', err);
      actions.setError('Failed to load sprints');
    }
  }, [actions]);

  const fetchBacklogIssues = useCallback(async (boardId) => {
    if (!boardId) {
      actions.setBacklogIssues([]);
      return;
    }

    try {
      console.log('🔄 Fetching backlog issues for board:', boardId);

      const response = await api.issues.getAll(boardId);
      const allIssues = response.data.data.issues || [];

      console.log('📋 All issues fetched:', allIssues.length);

      // Filter issues that are not assigned to any sprint (backlog)
      const backlog = allIssues.filter(issue => !issue.sprint_id);
      console.log('📋 Backlog issues:', backlog.length);
      console.log('📋 Backlog sample:', backlog[0]);

      actions.setBacklogIssues(backlog);
      actions.setError(null);
    } catch (err) {
      console.error('Failed to fetch backlog issues:', err);
      actions.setError('Failed to load backlog issues');
      actions.setBacklogIssues([]);
    }
  }, [actions]);

  const refreshAllData = useCallback(async (boardId) => {
    if (!boardId) return;

    console.log('🔄 Refreshing all data for board:', boardId);
    await Promise.all([
      fetchSprints(boardId),
      fetchBacklogIssues(boardId)
    ]);
    console.log('✅ All data refreshed');
  }, [fetchSprints, fetchBacklogIssues]);

  // Memoize apiActions to prevent infinite re-renders
  const apiActions = useMemo(() => ({
    fetchProjects,
    fetchBoards,
    fetchSprints,
    fetchBacklogIssues,
    refreshAllData
  }), [fetchProjects, fetchBoards, fetchSprints, fetchBacklogIssues, refreshAllData]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    state,
    actions,
    apiActions
  }), [state, actions, apiActions]);

  console.log('🏗️ SprintPlanningProvider providing value:', value);

  return (
    <SprintPlanningContext.Provider value={value}>
      {children}
    </SprintPlanningContext.Provider>
  );
};

// Hook to use the context
export const useSprintPlanning = () => {
  console.log('🔍 useSprintPlanning called');
  const context = useContext(SprintPlanningContext);
  console.log('🔍 Context value:', context);
  if (!context) {
    console.error('🚨 useSprintPlanning called outside of SprintPlanningProvider!');
    throw new Error('useSprintPlanning must be used within a SprintPlanningProvider');
  }
  return context;
};

export default SprintPlanningContext;
