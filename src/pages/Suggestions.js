import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import RecipeCard from '../components/Recipe/RecipeCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  FiStar, 
  FiTrendingUp, 
  FiClock, 
  FiEye,
  FiHeart,
  FiRefreshCw,
  FiFilter
} from 'react-icons/fi';

const Suggestions = () => {
  const { user } = useAuth();
  const { recipes, favorites, userRatings } = useRecipe();
  const [suggestions, setSuggestions] = useState({
    recentlyViewed: [],
    topRated: [],
    trending: [],
    basedOnFavorites: [],
    quickMeals: [],
    seasonal: []
  });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { key: 'all', label: 'All', icon: FiStar },
    { key: 'recentlyViewed', label: 'Recently Viewed', icon: FiEye },
    { key: 'topRated', label: 'Top Rated', icon: FiStar },
    { key: 'trending', label: 'Trending', icon: FiTrendingUp },
    { key: 'basedOnFavorites', label: 'Based On Favorites', icon: FiHeart },
    { key: 'quickMeals', label: 'Quick Meals', icon: FiClock }
  ];

  useEffect(() => {
    generateSuggestions();
  }, [recipes, favorites, userRatings, user]);

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      // Recently viewed recipes (from localStorage)
      const recentlyViewed = getRecentlyViewedRecipes();
      
      // Top rated recipes
      const topRated = recipes
        .filter(recipe => recipe.averageRating >= 4.0)
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 8);
      
      // Trending recipes (most viewed/rated recently)
      const trending = recipes
        .filter(recipe => recipe.totalRatings >= 5)
        .sort((a, b) => {
          const aScore = (a.totalRatings || 0) * (a.averageRating || 0);
          const bScore = (b.totalRatings || 0) * (b.averageRating || 0);
          return bScore - aScore;
        })
        .slice(0, 8);
      
      // Based on favorites (similar categories/ingredients)
      const basedOnFavorites = generateFavoriteBasedSuggestions();
      
      // Quick meals (cooking time <= 30 minutes)
      const quickMeals = recipes
        .filter(recipe => recipe.cookTime <= 30)
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 8);
      
      // Seasonal suggestions (based on current month)
      const seasonal = generateSeasonalSuggestions();
      
      setSuggestions({
        recentlyViewed,
        topRated,
        trending,
        basedOnFavorites,
        quickMeals,
        seasonal
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentlyViewedRecipes = () => {
    try {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      return viewed
        .map(id => recipes.find(recipe => recipe.id === id))
        .filter(Boolean)
        .slice(0, 8);
    } catch {
      return [];
    }
  };

  const generateFavoriteBasedSuggestions = () => {
    if (!user || favorites.length === 0) {
      return recipes
        .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        .slice(0, 8);
    }

    // Get categories and ingredients from favorite recipes
    const favoriteRecipes = recipes.filter(recipe => 
      favorites.some(fav => fav.recipeId === recipe.id)
    );
    
    const favoriteCategories = [...new Set(favoriteRecipes.map(r => r.category))];
    const favoriteIngredients = [...new Set(
      favoriteRecipes.flatMap(r => r.ingredients || [])
        .map(ing => ing.toLowerCase())
    )];

    // Find similar recipes
    const suggestions = recipes
      .filter(recipe => !favorites.some(fav => fav.recipeId === recipe.id))
      .map(recipe => {
        let score = 0;
        
        // Category match
        if (favoriteCategories.includes(recipe.category)) {
          score += 3;
        }
        
        // Ingredient match
        const recipeIngredients = (recipe.ingredients || []).map(ing => ing.toLowerCase());
        const commonIngredients = recipeIngredients.filter(ing => 
          favoriteIngredients.some(favIng => favIng.includes(ing) || ing.includes(favIng))
        );
        score += commonIngredients.length;
        
        // Rating boost
        score += (recipe.averageRating || 0) * 0.5;
        
        return { ...recipe, suggestionScore: score };
      })
      .filter(recipe => recipe.suggestionScore > 0)
      .sort((a, b) => b.suggestionScore - a.suggestionScore)
      .slice(0, 8);

    return suggestions;
  };

  const generateSeasonalSuggestions = () => {
    const currentMonth = new Date().getMonth();
    const seasonalKeywords = {
      // Spring (Mar-May)
      spring: ['salad', 'fresh', 'green', 'asparagus', 'pea', 'strawberry'],
      // Summer (Jun-Aug)
      summer: ['cold', 'ice', 'fruit', 'tomato', 'cucumber', 'watermelon', 'grill'],
      // Fall (Sep-Nov)
      fall: ['pumpkin', 'apple', 'cinnamon', 'warm', 'soup', 'stew'],
      // Winter (Dec-Feb)
      winter: ['hot', 'warm', 'comfort', 'potato', 'beef', 'chicken', 'soup']
    };

    let currentSeason;
    if (currentMonth >= 2 && currentMonth <= 4) currentSeason = 'spring';
    else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = 'summer';
    else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = 'fall';
    else currentSeason = 'winter';

    const keywords = seasonalKeywords[currentSeason];
    
    return recipes
      .filter(recipe => {
        const title = recipe.title.toLowerCase();
        const description = (recipe.description || '').toLowerCase();
        const ingredients = (recipe.ingredients || []).join(' ').toLowerCase();
        const searchText = `${title} ${description} ${ingredients}`;
        
        return keywords.some(keyword => searchText.includes(keyword));
      })
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 8);
  };

  const refreshSuggestions = async () => {
    setRefreshing(true);
    await generateSuggestions();
    setRefreshing(false);
  };

  const getSuggestionsToShow = () => {
    if (activeCategory === 'all') {
      return {
        ['Recently Viewed']: suggestions.recentlyViewed,
        ['Top Rated']: suggestions.topRated,
        ['Trending']: suggestions.trending,
        ['Based On Favorites']: suggestions.basedOnFavorites,
        ['Quick Meals Under 30m']: suggestions.quickMeals,
        ['Seasonal']: suggestions.seasonal
      };
    } else {
      return {
        [categories.find(cat => cat.key === activeCategory)?.label || '']: suggestions[activeCategory]
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const suggestionsToShow = getSuggestionsToShow();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Recipe Suggestions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover Recipe Suited To Your Taste
              </p>
            </div>
            <button
              onClick={refreshSuggestions}
              disabled={refreshing}
              className="btn-primary flex items-center space-x-2"
            >
              <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refreshing</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category.key
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Suggestions Sections */}
        <div className="space-y-12">
          {Object.entries(suggestionsToShow).map(([sectionTitle, sectionRecipes]) => {
            if (!sectionRecipes || sectionRecipes.length === 0) return null;

            return (
              <div key={sectionTitle}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sectionTitle}
                  </h2>
                  {sectionRecipes.length > 4 && (
                    <Link
                      to={`/recipes?category=${encodeURIComponent(sectionTitle)}`}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                    >
                      View All →
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sectionRecipes.slice(0, 8).map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {Object.values(suggestionsToShow).every(section => !section || section.length === 0) && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <FiStar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No suggestions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {user 
                ? 'View and rate recipes for suggestions'
                : 'Login for personalized suggestions'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/recipes" className="btn-primary">
                {t('exploreRecipes')}
              </Link>
              {!user && (
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Tips Section */}
        {user && (
          <div className="mt-16 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              💡 Tips for better suggestions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiHeart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Mark as favorite
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add recipes to favorites for similar suggestions
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiStar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Rate recipes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rate Recipes To Help System Understand Preferences
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiEye className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    View Many Recipes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Explore Various Recipe Types To Expand Suggestions'
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;