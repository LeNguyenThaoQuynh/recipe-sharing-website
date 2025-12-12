import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import RecipeCard from '../components/Recipe/RecipeCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { FiHeart, FiSearch } from 'react-icons/fi';

const Favorites = () => {
  const { user } = useAuth();
  const { recipes, loading, getUserFavorites } = useRecipe();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);

  useEffect(() => {
    if (user && recipes.length > 0) {
      // Get user's favorite recipes using the RecipeContext function
      const userFavorites = getUserFavorites(user.id);
      setFavoriteRecipes(userFavorites);
      setFilteredRecipes(userFavorites);
    }
  }, [user, recipes, getUserFavorites]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = favoriteRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(favoriteRecipes);
    }
  }, [searchTerm, favoriteRecipes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FiHeart className="text-3xl text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Favorites Recipes
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Your Collection Of Saved Recipes
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder='Search your favorite recipes...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : favoriteRecipes.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <FiHeart className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Favorite Recipes Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start Exploring Recipes
            </p>
            <a
              href="/recipes"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200"
            >
              <FiSearch className="mr-2" />
              Browse Recipes
            </a>
          </div>
        ) : (
          /* No Search Results */
          <div className="text-center py-16">
            <FiSearch className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try Adjusting Search Terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;