// Mock API functions for meal planning
const API_BASE_URL = 'http://localhost:3001';

// Meal Plan API
export const mealPlanAPI = {
  // Get meal plan for a specific user and week
  getMealPlan: async (userId, weekStart) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mealPlans?userId=${userId}&weekStart=${weekStart}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meal plan');
      }
      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      return null;
    }
  },

  // Save meal plan
  saveMealPlan: async (mealPlan) => {
    try {
      // Check if meal plan already exists
      const existing = await mealPlanAPI.getMealPlan(mealPlan.userId, mealPlan.weekStart);
      
      if (existing) {
        // Update existing meal plan
        const response = await fetch(`${API_BASE_URL}/mealPlans/${existing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mealPlan),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update meal plan');
        }
        
        return await response.json();
      } else {
        // Create new meal plan
        const response = await fetch(`${API_BASE_URL}/mealPlans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...mealPlan,
            id: Date.now().toString(), // Simple ID generation
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create meal plan');
        }
        
        return await response.json();
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  },

  // Delete meal plan
  deleteMealPlan: async (mealPlanId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/mealPlans/${mealPlanId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete meal plan');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  },
};

// Recipe API
export const recipeAPI = {
  // Get all recipes
  getRecipes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  },

  // Get recipe by ID
  getRecipe: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipe');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipe:', error);
      return null;
    }
  },

  // Create new recipe
  createRecipe: async (recipe) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recipe,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create recipe');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  // Update recipe
  updateRecipe: async (id, recipe) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recipe,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  // Delete recipe
  deleteRecipe: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },
};

// User API
export const userAPI = {
  // Get user by ID
  getUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          updatedAt: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
};

export default {
  mealPlanAPI,
  recipeAPI,
  userAPI,
};