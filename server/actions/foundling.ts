import * as db from './db.js';

// Idea management operations
export async function handleIdeaOperation(operation: string, requestData: any, userId: string | null): Promise<any> {
  try {
    switch (operation) {
      case 'create':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        if (!requestData.title || !requestData.description || !requestData.category) {
          return { success: false, error: 'Title, description, and category are required' };
        }
        
        const ideaData = {
          creatorId: userId,
          title: requestData.title,
          description: requestData.description,
          category: requestData.category,
          tags: requestData.tags || [],
          feasibilityScore: requestData.feasibilityScore || 0,
          marketSize: requestData.marketSize || 'Unknown',
          competitionLevel: requestData.competitionLevel || 'Unknown',
          developmentComplexity: requestData.developmentComplexity || 'Unknown',
          fundingRequired: requestData.fundingRequired || 0,
          equityOffered: requestData.equityOffered || 0,
          status: 'draft' as const,
          nftTokenId: requestData.nftTokenId || ''
        };
        
        const ideaId = await db.createIdea(ideaData);
        return { success: true, ideaId };
        
      case 'getById':
        if (!requestData.ideaId) {
          return { success: false, error: 'Idea ID is required' };
        }
        
        const idea = await db.getIdeaById(requestData.ideaId);
        if (!idea) {
          return { success: false, error: 'Idea not found' };
        }
        
        return { success: true, idea };
        
      case 'getByCreator':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        
        const creatorId = requestData.creatorId || userId;
        const ideas = await db.getIdeasByCreator(creatorId);
        return { success: true, ideas };
        
      case 'getAll':
        const allIdeas = await db.getAllIdeas();
        return { success: true, ideas: allIdeas };
        
      case 'update':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        if (!requestData.ideaId) {
          return { success: false, error: 'Idea ID is required' };
        }
        
        const existingIdea = await db.getIdeaById(requestData.ideaId);
        if (!existingIdea) {
          return { success: false, error: 'Idea not found' };
        }
        
        if (existingIdea.creatorId !== userId) {
          return { success: false, error: 'Access denied' };
        }
        
        const updateResult = await db.updateIdea(requestData.ideaId, requestData.updates);
        return { success: updateResult };
        
      default:
        return { success: false, error: 'Invalid operation type' };
    }
  } catch (error) {
    console.error('Idea operation error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Project management operations
export async function handleProjectOperation(operation: string, requestData: any, userId: string | null): Promise<any> {
  try {
    switch (operation) {
      case 'create':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        if (!requestData.ideaId || !requestData.title || !requestData.description) {
          return { success: false, error: 'Idea ID, title, and description are required' };
        }
        
        const projectData = {
          ideaId: requestData.ideaId,
          executorId: userId,
          title: requestData.title,
          description: requestData.description,
          milestones: requestData.milestones || [],
          totalFunding: requestData.totalFunding || 0,
          currentFunding: 0,
          status: 'funding' as const,
          startDate: requestData.startDate || new Date().toISOString(),
          estimatedCompletion: requestData.estimatedCompletion || ''
        };
        
        const projectId = await db.createProject(projectData);
        return { success: true, projectId };
        
      case 'getById':
        if (!requestData.projectId) {
          return { success: false, error: 'Project ID is required' };
        }
        
        const project = await db.getProjectById(requestData.projectId);
        if (!project) {
          return { success: false, error: 'Project not found' };
        }
        
        return { success: true, project };
        
      case 'getByExecutor':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        
        const executorId = requestData.executorId || userId;
        const projects = await db.getProjectsByExecutor(executorId);
        return { success: true, projects };
        
      case 'getAll':
        const allProjects = await db.getAllProjects();
        return { success: true, projects: allProjects };
        
      case 'update':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        if (!requestData.projectId) {
          return { success: false, error: 'Project ID is required' };
        }
        
        const existingProject = await db.getProjectById(requestData.projectId);
        if (!existingProject) {
          return { success: false, error: 'Project not found' };
        }
        
        if (existingProject.executorId !== userId) {
          return { success: false, error: 'Access denied' };
        }
        
        const updateResult = await db.updateProject(requestData.projectId, requestData.updates);
        return { success: updateResult };
        
      default:
        return { success: false, error: 'Invalid operation type' };
    }
  } catch (error) {
    console.error('Project operation error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Funding operations
export async function handleFundingOperation(operation: string, requestData: any, userId: string | null): Promise<any> {
  try {
    switch (operation) {
      case 'create':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        if (!requestData.projectId || !requestData.amount || !requestData.equityPercentage) {
          return { success: false, error: 'Project ID, amount, and equity percentage are required' };
        }
        
        const fundingData = {
          projectId: requestData.projectId,
          funderId: userId,
          amount: requestData.amount,
          equityPercentage: requestData.equityPercentage,
          terms: requestData.terms || '',
          status: 'pending' as const
        };
        
        const fundingId = await db.createFunding(fundingData);
        return { success: true, fundingId };
        
      case 'getByProject':
        if (!requestData.projectId) {
          return { success: false, error: 'Project ID is required' };
        }
        
        const fundings = await db.getFundingByProject(requestData.projectId);
        return { success: true, fundings };
        
      case 'update':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        if (!requestData.fundingId) {
          return { success: false, error: 'Funding ID is required' };
        }
        
        const existingFunding = await db.fundingDB.get(requestData.fundingId);
        if (!existingFunding) {
          return { success: false, error: 'Funding not found' };
        }
        
        // Only allow updates if user is the funder or project executor
        const project = await db.getProjectById(existingFunding.projectId);
        if (existingFunding.funderId !== userId && project?.executorId !== userId) {
          return { success: false, error: 'Access denied' };
        }
        
        const updateResult = await db.updateFunding(requestData.fundingId, requestData.updates);
        return { success: updateResult };
        
      default:
        return { success: false, error: 'Invalid operation type' };
    }
  } catch (error) {
    console.error('Funding operation error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// User profile operations
export async function handleProfileOperation(operation: string, requestData: any, userId: string | null): Promise<any> {
  try {
    switch (operation) {
      case 'getById':
        if (!requestData.userId) {
          return { success: false, error: 'User ID is required' };
        }
        
        const user = await db.getUserById(requestData.userId);
        if (!user) {
          return { success: false, error: 'User not found' };
        }
        
        // Remove sensitive information
        const { passwordHash, ...safeUser } = user;
        return { success: true, user: safeUser };
        
      case 'update':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        
        const updateResult = await db.updateUserProfile(userId, requestData.updates);
        return { success: updateResult };
        
      case 'getStats':
        if (!userId) {
          return { success: false, error: 'Authentication required' };
        }
        
        // Get user's ideas, projects, and funding stats
        const userIdeas = await db.getIdeasByCreator(userId);
        const userProjects = await db.getProjectsByExecutor(userId);
        
        const stats = {
          ideas: userIdeas.length,
          projects: userProjects.length,
          funding: userProjects.reduce((sum, p) => sum + p.currentFunding, 0),
          royalties: 0 // TODO: Calculate from smart contracts
        };
        
        return { success: true, stats };
        
      default:
        return { success: false, error: 'Invalid operation type' };
    }
  } catch (error) {
    console.error('Profile operation error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
