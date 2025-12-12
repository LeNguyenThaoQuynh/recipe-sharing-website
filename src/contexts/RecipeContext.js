import React, { createContext, useContext, useState, useEffect } from 'react';
import { recipeAPI, favoriteAPI, ratingAPI, commentAPI } from '../services/api';
import { useAuth } from './AuthContext';

const RecipeContext = createContext();

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const { user, isAuthenticated } = useAuth();

  // Load recipes on component mount
  useEffect(() => {
    loadRecipes();
  }, []);

  // Load user-specific data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
      loadUserRatings();
    } else {
      setFavorites([]);
      setUserRatings([]);
    }
  }, [isAuthenticated, user]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getAll();
      if (response.success) {
        setRecipes(response.data);
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const response = await favoriteAPI.getUserFavorites(user.id);
      if (response.success) {
        setFavorites(response.data.map(fav => fav.recipeId));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadUserRatings = async () => {
    if (!user) return;
    
    try {
      const response = await ratingAPI.getUserRatings(user.id);
      if (response.success) {
        setUserRatings(response.data);
      }
    } catch (error) {
      console.error('Error loading user ratings:', error);
    }
  };

  const createRecipe = async (recipeData) => {
    try {
      const response = await recipeAPI.create({
        ...recipeData,
        authorId: user.id,
        createdAt: new Date().toISOString(),
        rating: 0,
        totalRatings: 0
      });
      
      if (response.success) {
        setRecipes(prev => [response.data, ...prev]);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      return { success: false, error: 'Đã xảy ra lỗi khi tạo công thức' };
    }
  };

  const updateRecipe = async (id, recipeData) => {
    try {
      const response = await recipeAPI.update(id, recipeData);
      
      if (response.success) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === id ? response.data : recipe
        ));
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      return { success: false, error: 'Đã xảy ra lỗi khi cập nhật công thức' };
    }
  };

  const deleteRecipe = async (id) => {
    try {
      const response = await recipeAPI.delete(id);
      
      if (response.success) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return { success: false, error: 'Đã xảy ra lỗi khi xóa công thức' };
    }
  };

  const toggleFavorite = async (recipeId) => {
    if (!user) return { success: false, error: 'Bạn cần đăng nhập để thực hiện chức năng này' };
    
    try {
      const isFavorited = favorites.includes(recipeId);
      
      if (isFavorited) {
        const response = await favoriteAPI.remove(user.id, recipeId);
        if (response.success) {
          setFavorites(prev => prev.filter(id => id !== recipeId));
        }
      } else {
        const response = await favoriteAPI.add(user.id, recipeId);
        if (response.success) {
          setFavorites(prev => [...prev, recipeId]);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return { success: false, error: 'Đã xảy ra lỗi khi cập nhật yêu thích' };
    }
  };

  const rateRecipe = async (recipeId, rating) => {
    if (!user) return { success: false, error: 'Bạn cần đăng nhập để đánh giá' };
    
    try {
      const response = await ratingAPI.rate(user.id, recipeId, rating);
      
      if (response.success) {
        // Update user ratings
        setUserRatings(prev => {
          const existing = prev.find(r => r.recipeId === recipeId);
          if (existing) {
            return prev.map(r => r.recipeId === recipeId ? { ...r, rating } : r);
          } else {
            return [...prev, { recipeId, rating, userId: user.id }];
          }
        });
        
        // Update recipe rating in recipes list
        const updatedRecipe = response.data;
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId ? updatedRecipe : recipe
        ));
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error rating recipe:', error);
      return { success: false, error: 'Đã xảy ra lỗi khi đánh giá' };
    }
  };

  const getFilteredRecipes = () => {
    let filtered = [...recipes];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(recipe => recipe.category === filters.category);
    }
    
    // Apply difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'cookTime':
          aValue = a.cookTime;
          bValue = b.cookTime;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  const getUserRating = (recipeId) => {
    const userRating = userRatings.find(r => r.recipeId === recipeId);
    return userRating ? userRating.rating : 0;
  };

  const isFavorited = (recipeId) => {
    return favorites.includes(recipeId);
  };

  const getUserRecipes = (userId) => {
    return recipes.filter(recipe => recipe.authorId === userId);
  };

  const getUserFavorites = (userId) => {
    return recipes.filter(recipe => favorites.includes(recipe.id));
  };

  const getSuggestedRecipes = (currentRecipeId, limit = 4) => {
    const currentRecipe = recipes.find(recipe => recipe.id === currentRecipeId);
    if (!currentRecipe) return [];

    // Filter out the current recipe and get suggestions based on category
    const suggestions = recipes
      .filter(recipe => recipe.id !== currentRecipeId)
      .filter(recipe => recipe.category === currentRecipe.category)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);

    // If we don't have enough suggestions from the same category, add more from other categories
    if (suggestions.length < limit) {
      const additionalSuggestions = recipes
        .filter(recipe => recipe.id !== currentRecipeId)
        .filter(recipe => recipe.category !== currentRecipe.category)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit - suggestions.length);
      
      suggestions.push(...additionalSuggestions);
    }

    return suggestions;
  };

  const addComment = async (recipeId, content) => {
    if (!user) return { success: false, error: 'Bạn cần đăng nhập để bình luận' };
    
    try {
      const commentData = {
        recipeId: parseInt(recipeId),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: content.trim(),
        createdAt: new Date().toISOString()
      };
      
      const response = await commentAPI.create(commentData);
      
      if (response.success) {
        // Update recipes state to include the new comment
        setRecipes(prev => prev.map(recipe => {
          if (recipe.id === parseInt(recipeId)) {
            return {
              ...recipe,
              comments: [response.data, ...(recipe.comments || [])]
            };
          }
          return recipe;
        }));
        
        return { success: true, comment: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error: 'Đã xảy ra lỗi khi thêm bình luận' };
    }
  };

  const deleteComment = async (commentId) => {
    if (!user) return { success: false, error: 'Bạn cần đăng nhập để xóa bình luận' };
    
    try {
      const response = await commentAPI.delete(commentId);
      
      if (response.success) {
        // Update recipes state to remove the deleted comment
        setRecipes(prev => prev.map(recipe => ({
          ...recipe,
          comments: (recipe.comments || []).filter(comment => comment.id !== commentId)
        })));
        
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      return { success: false, error: 'Đã xảy ra lỗi khi xóa bình luận' };
    }
  };

  const value = {
    recipes,
    favorites,
    userRatings,
    loading,
    filters,
    setFilters,
    loadRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    rateRecipe,
    getFilteredRecipes,
    getUserRating,
    isFavorited,
    getUserRecipes,
    getUserFavorites,
    getSuggestedRecipes,
    addComment,
    deleteComment
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
};