export const useIngredientAutocomplete = () => {
    const STORAGE_KEY = 'ingredient_usage_stats';
  
    const getUsageStats = () => {
      try {
        const stats = localStorage.getItem(STORAGE_KEY);
        return stats ? JSON.parse(stats) : {};
      } catch (error) {
        console.error('Error reading usage stats:', error);
        return {};
      }
    };
  
    const saveUsageStats = (stats) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
      } catch (error) {
        console.error('Error saving usage stats:', error);
      }
    };
  
    const updateUsageCount = (ingredient) => {
      if (!ingredient.trim()) return;
      
      const stats = getUsageStats();
      const normalizedIngredient = ingredient.trim().toLowerCase();
      
      stats[normalizedIngredient] = (stats[normalizedIngredient] || 0) + 1;
      saveUsageStats(stats);
    };
  
    const getSuggestions = (input) => {
        const stats = getUsageStats();
      if (!input.trim()) return Object.entries(stats).map(([ingredient, count]) => ({
        text: ingredient,
        count: count,
        display: ingredient.charAt(0).toUpperCase() + ingredient.slice(1)
      }));
      
      
      const inputLower = input.toLowerCase();
      
      const matches = Object.entries(stats)
        .filter(([ingredient, count]) => 
          ingredient.includes(inputLower) && count > 0
        )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) 
        .map(([ingredient, count]) => ({
          text: ingredient,
          count: count,
          display: ingredient.charAt(0).toUpperCase() + ingredient.slice(1)
        }));
  
      return matches;
    };

    const deleteSuggestion = (ingredient) => {
        if (!ingredient.trim()) return;
        
        const stats = getUsageStats();
        const normalizedIngredient = ingredient.trim().toLowerCase();
        
        delete stats[normalizedIngredient];
        saveUsageStats(stats);
      };
  
      const clearAllSuggestions = () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error('Error clearing all suggestions:', error);
        }
      };
  
    return {
      getSuggestions,
      updateUsageCount,
      getUsageStats,
      deleteSuggestion,
      clearAllSuggestions,
    };
  };