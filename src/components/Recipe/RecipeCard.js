import React from 'react';

import { toast } from 'react-hot-toast';
import {
  FiClock,
  FiHeart,
  FiShare2,
  FiStar,
  FiUsers,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useRecipe } from '../../contexts/RecipeContext';

const RecipeCard = ({ recipe, featured = false }) => {
  const { toggleFavorite, isFavorited } = useRecipe();
  const { isAuthenticated } = useAuth();

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('You need to log in to use this feature.');
      return;
    }

    const result = await toggleFavorite(recipe.id);
    if (result.success) {
      toast.success(
        isFavorited(recipe.id)
          ? 'Removed from favorites'
          : 'Added to favorites'
      );
    } else {
      toast.error(result.error || 'An error occurred');
    }
  };

  const handleXShare = (recipe) => {
    const shareUrl = `https://cookpad.com/vn/recipes/${recipe.id}`;
    const tweetText = `Check out this recipe on Cookpad: ${recipe.title}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const getCategoryLabel = (category) => {
    const categories = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      dessert: 'Dessert',
      snack: 'Snack',
    };
    return categories[category] || category;
  };

  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    };
    return difficulties[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      colors[difficulty] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FiStar key={i} className="star" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <FiStar className="star-empty" />
            <FiStar
              className="star absolute inset-0"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      } else {
        stars.push(<FiStar key={i} className="star-empty" />);
      }
    }

    return stars;
  };

  const cardClasses = featured
    ? 'recipe-card group shadow-md border-2 border-gray-200 dark:border-primary-800'
    : 'recipe-card group';

  return (
    <Link to={`/recipes/${recipe.id}`} className={`${cardClasses} overflow-hidden`}>
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={
            recipe.image ||
            'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop'
          }
          alt={recipe.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${isFavorited(recipe.id)
            ? 'bg-red-500 text-white shadow-lg'
            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          aria-label={isFavorited(recipe.id) ? 'Unfavorite' : 'Add to favorites'}
        >
          <FiHeart
            className={`w-4 h-4 ${isFavorited(recipe.id) ? 'fill-current' : ''}`}
          />
        </button>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="badge-primary text-xs font-medium">
            {getCategoryLabel(recipe.category)}
          </span>
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute bottom-3 left-3">
            <span className="badge bg-yellow-400 text-yellow-900 text-xs font-bold">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
          {recipe.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <FiClock className="w-4 h-4" />
              <span>{recipe.cookTime}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUsers className="w-4 h-4" />
              <span>{recipe.servings} person</span>
            </div>
          </div>

          <div className={`badge ${getDifficultyColor(recipe.difficulty)} text-xs`}>
            {getDifficultyLabel(recipe.difficulty)}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="star-rating">{renderStars(recipe.rating || 0)}</div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {recipe.rating ? recipe.rating.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              ({recipe.totalRatings || 0})
            </span>
          </div>

          {/* Calories */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">
              {recipe.nutrition?.calories || recipe.calories || 0}
            </span>{' '}
            cal
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
