import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecipe } from '../contexts/RecipeContext';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/Recipe/RecipeCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { FiSearch, FiTrendingUp, FiClock, FiUsers, FiStar } from 'react-icons/fi';

const Home = () => {
  const { recipes, loading } = useRecipe();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [popularRecipes, setPopularRecipes] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);

  useEffect(() => {
    if (recipes.length > 0) {
      // Featured recipes (highest rated)
      const featured = [...recipes]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);
      setFeaturedRecipes(featured);

      // Popular recipes (most ratings)
      const popular = [...recipes]
        .sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))
        .slice(0, 6);
      setPopularRecipes(popular);

      // Recent recipes
      const recent = [...recipes]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
      setRecentRecipes(recent);
    }
  }, [recipes]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/recipes?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const stats = {
    totalRecipes: recipes.length,
    avgRating: recipes.length > 0 
      ? (recipes.reduce((sum, recipe) => sum + (recipe.rating || 0), 0) / recipes.length).toFixed(1)
      : 0,
    totalCookTime: recipes.reduce((sum, recipe) => sum + (recipe.cookTime || 0), 0),
    categories: [...new Set(recipes.map(recipe => recipe.category))].length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-serif mb-6 animate-fade-in">
              Discover Amazing Flavors
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90 animate-slide-up">
              Share And Discover Recipes
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-slide-up">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder= "Search Recipes ..."
                  className="w-full px-6 py-4 pr-14 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-6 bg-primary-500 hover:bg-primary-600 rounded-full transition-colors duration-200 flex items-center justify-center"
                >
                  <FiSearch className="w-6 h-6 text-white" />
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link
                to="/recipes"
                className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                View All Recipes
              </Link>
              {isAuthenticated && (
                <Link
                  to="/create-recipe"
                  className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
                >
                  Create Recipe
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.totalRecipes}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Recipes</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.avgRating}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Average Rating Short</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {Math.round(stats.totalCookTime / 60)}h
              </div>
              <div className="text-gray-600 dark:text-gray-400">Cook Time Short</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.categories}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      {featuredRecipes.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-4">
                Featured Recipes
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Highest rated dishes from the community
              </p>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Recipes */}
      {popularRecipes.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-4">
                  Most Popular
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Most loved recipes
                </p>
              </div>
              <Link
                to="/recipes?sort=popular"
                className="btn-outline hidden sm:block"
              > 
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            
            <div className="text-center mt-8 sm:hidden">
              <Link
                to="/recipes?sort=popular"
                className="btn-outline"
              >
                View All
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Recipes */}
      {recentRecipes.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 dark:text-white mb-4">
                  Latest
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Recently shared recipes
                </p>
              </div>
              <Link
                to="/recipes?sort=newest"
                className="btn-outline hidden sm:block"
              >
                View All
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            
            <div className="text-center mt-8 sm:hidden">
              <Link
                to="/recipes?sort=newest"
                className="btn-outline"
              >
                View All
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
            Start your culinary journey
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our passionate community of chefs and share your amazing recipes
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                Register now
              </Link>
              <Link
                to="/login"
                className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
              >
                Login
              </Link>
            </div>
          ) : (
            <Link
              to="/create-recipe"
              className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              Create first recipe
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;