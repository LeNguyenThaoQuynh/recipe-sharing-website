import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecipe } from '../contexts/RecipeContext';
import RecipeCard from '../components/Recipe/RecipeCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { FiSearch, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';

const RecipeList = () => {
  const { getFilteredRecipes, filters, setFilters, loading } = useRecipe();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Initialize filters from URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const sortBy = searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('order') || 'desc';

    const newFilters = {
      search,
      category,
      difficulty,
      sortBy: sortBy === 'popular' ? 'totalRatings' : sortBy === 'rating' ? 'rating' : sortBy === 'newest' ? 'createdAt' : sortBy,
      sortOrder: sortBy === 'popular' || sortBy === 'rating' ? 'desc' : sortOrder
    };

    setLocalFilters(newFilters);
    setFilters(newFilters);
  }, [searchParams, setFilters]);

  const filteredRecipes = getFilteredRecipes();

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) {
        if (k === 'sortBy') {
          if (v === 'totalRatings') {
            newSearchParams.set('sort', 'popular');
          } else if (v === 'rating') {
            newSearchParams.set('sort', 'rating');
          } else if (v === 'createdAt') {
            newSearchParams.set('sort', 'newest');
          } else {
            newSearchParams.set('sort', v);
          }
        } else if (k === 'sortOrder' && v !== 'desc') {
          newSearchParams.set('order', v);
        } else if (k !== 'sortOrder') {
          newSearchParams.set(k, v);
        }
      }
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      difficulty: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
    setSearchParams({});
  };

  const hasActiveFilters = localFilters.search || localFilters.category || localFilters.difficulty;

  const categories = [
    { value: '', label: 'All categories' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'snack', label: 'Snack' }
  ];

  const difficulties = [
    { value: '', label: 'All Difficulties' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'latest' },
    { value: 'totalRatings', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'title', label: 'Name A-Z' },
    { value: 'cookTime', label: 'Cook Time'}
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-4">
            Recipes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover {filteredRecipes.length} amazing recipes from the community
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder='Search recipes, ingredients...'
                className="input-field pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary flex items-center space-x-2 ${
                  hasActiveFilters ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : ''
                }`}
              >
                <FiFilter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {[localFilters.category, localFilters.difficulty].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={localFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Difficulty</label>
                <select
                  value={localFilters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="input-field"
                >
                  {difficulties.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Sort By</label>
                <select
                  value={localFilters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="input-field"
                >
                  {sortOptions.map((sort) => (
                    <option key={sort.value} value={sort.value}>
                      {sort.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600 dark:text-gray-400">
            Showing {filteredRecipes.length} results 
            {localFilters.search && (
              <span> for "{localFilters.search}"</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <FiList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        {filteredRecipes.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredRecipes.map((recipe) => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                className={viewMode === 'list' ? 'flex' : ''}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiSearch className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try changing search keywords or filters
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeList;