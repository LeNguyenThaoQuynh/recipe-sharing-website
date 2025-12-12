import React, { useEffect, useState } from 'react';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-hot-toast';
import {
  FiBarChart2,
  FiCalendar,
  FiChevronLeft,
  FiClock,
  FiEdit3,
  FiHeart,
  FiMessageCircle,
  FiPrinter,
  FiSend,
  FiShare2,
  FiStar,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi';
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import RecipeCard from '../components/Recipe/RecipeCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import { cssPrint, pdfGenerator } from '../helpers/pdfGenerator.helper';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    recipes,
    loading,
    toggleFavorite,
    rateRecipe,
    deleteRecipe,
    addComment,
    deleteComment,
    getSuggestedRecipes
  } = useRecipe();

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [isPrinting, setIsPrinting] = useState(false);

  const [selectedIngredients, setSelectedIngredients] = useState(() => {
    const stored = localStorage.getItem('selectedIngredients');
    return stored ? JSON.parse(stored) : [];
  });

  const [selectedSugguested, setSelectedSugguested] = useState(() => {
    const stored = localStorage.getItem('selectedSugguested');
    return stored ? JSON.parse(stored) : [];
  });

  const handleToggle = (item, selectedList, setSelectedList, storageKey) => {
    const updated = selectedList.includes(item)
      ? selectedList.filter((i) => i !== item)
      : [...selectedList, item];

    setSelectedList(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };


  useEffect(() => {
    const foundRecipe = recipes.find(r => r.id === parseInt(id));
    if (foundRecipe) {
      setRecipe(foundRecipe);
      setComments(foundRecipe.comments || []);

      // Get user's rating for this recipe
      if (user && foundRecipe.ratings) {
        const userRatingData = foundRecipe.ratings.find(r => r.userId === user.id);
        setUserRating(userRatingData?.rating || 0);
      }

      // Get suggested recipes
      const suggested = getSuggestedRecipes(foundRecipe.id, 4);
      setSuggestedRecipes(suggested);
    }
  }, [id, recipes, user, getSuggestedRecipes]);

  const handleRating = async (rating) => {
    if (!user) {
      toast.error('Please login to rate');
      return;
    }

    const result = await rateRecipe(recipe.id, rating);
    if (result.success) {
      setUserRating(rating);
      toast.success('Rating successful!');
    } else {
      toast.error(result.error || 'Rating failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter comment content');
      return;
    }

    if (newComment.length > 500) {
      toast.error('Comment cannot exceed 500 characters');
      return;
    }

    const result = await addComment(recipe.id, newComment.trim());
    if (result.success) {
      setNewComment('');
      setComments(prev => [result.comment, ...prev]);
      toast.success('Comment successful!');
    } else {
      toast.error(result.error || 'Comment failed');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const result = await deleteComment(commentId);
    if (result.success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Delete comment successfully!');
    } else {
      toast.error(result.error || 'Failed to delete comment');
    }
  };

  const handleDeleteRecipe = async () => {
    const result = await deleteRecipe(recipe.id);
    if (result.success) {
      toast.success('Recipe deleted successfully!');
      navigate('/recipes');
    } else {
      toast.error(result.error || 'Failed to delete recipe');
    }
    setShowDeleteModal(false);
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = `${recipe.title} - Recipe Share`;
    const text = recipe.description;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied!');
        } catch (err) {
          toast.error('Cannot copy link');
        }
        break;
      default:
        break;
    }
  };

  const handlePrintToPDF = async () => {
    if (isPrinting) return;

    setIsPrinting(true);
    toast.loading('Generating PDF...', { id: 'pdf-generation' });

    try {
      const printContent = document.createElement('div');
      
      const longPageCSS = `
        ${cssPrint}
        
        /* Container styling */
        .recipe-container {
          width: 794px !important; /* A4 width in pixels */
          padding: 40px !important;
          margin: 0 auto !important;
          background: white !important;
          background-color: #ffffff !important;
          font-family: Arial, sans-serif !important;
          line-height: 1.6 !important;
          color: #333333 !important;
        }
        
        /* Spacing improvements */
        .recipe-section {
          margin-bottom: 30px !important;
        }
        
        .recipe-ingredients li {
          margin-bottom: 10px !important;
          padding: 8px 0 !important;
          border-bottom: 1px solid #f0f0f0 !important;
          background-color: #ffffff !important;
        }
        
        .recipe-instructions li {
          margin-bottom: 20px !important;
          padding: 15px !important;
          background-color: #f8f9fa !important;
          border-radius: 8px !important;
          border-left: 4px solid #4CAF50 !important;
        }
        
        h1, h2, h3 {
          margin-bottom: 20px !important;
          color: #2E7D32 !important;
        }
        
        h1 {
          font-size: 28px !important;
          border-bottom: 2px solid #4CAF50 !important;
          padding-bottom: 10px !important;
        }
        
        h2 {
          font-size: 22px !important;
          border-bottom: 2px solid #4CAF50 !important;
          padding-bottom: 8px !important;
        }
        
        /* Fix for color compatibility */
        * {
          background-color: inherit !important;
          color: inherit !important;
        }
        
        /* Override any potential oklch or unsupported colors */
        .recipe-container * {
          color: #333333 !important;
        }
        
        /* Ensure all backgrounds are standard colors */
        div, span, p, h1, h2, h3, h4, h5, h6, li, ul, ol {
          background-color: transparent !important;
        }
        
        /* Specific overrides for common elements */
        .recipe-container {
          background-color: #ffffff !important;
        }
        
        .recipe-instructions li {
          background-color: #f8f9fa !important;
        }
      `;
      
      printContent.style.cssText = longPageCSS;
      printContent.innerHTML = pdfGenerator(recipe, getDifficultyText);

      // Set container to exact A4 width
      printContent.style.width = '794px';
      printContent.style.backgroundColor = '#ffffff';
      printContent.style.position = 'absolute';
      printContent.style.left = '-9999px';
      printContent.style.top = '0';

      document.body.appendChild(printContent);
      
      // Additional step: Remove any unsupported CSS colors
      const removeUnsupportedColors = (element) => {
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_ELEMENT,
          null,
          false
        );
        
        let node;
        while (node = walker.nextNode()) {
          const computedStyle = window.getComputedStyle(node);
          
          // Check for oklch and other unsupported color formats
          ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
            const value = computedStyle[prop];
            if (value && (value.includes('oklch') || value.includes('color-mix') || value.includes('lab') || value.includes('lch'))) {
              // Replace with safe fallback colors
              if (prop === 'backgroundColor') {
                node.style.backgroundColor = '#ffffff';
              } else if (prop === 'color') {
                node.style.color = '#333333';
              } else if (prop === 'borderColor') {
                node.style.borderColor = '#cccccc';
              }
            }
          });
        }
      };
      
      // Clean up unsupported colors
      removeUnsupportedColors(printContent);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the actual height of content
      const actualHeight = printContent.scrollHeight;
      
      // Convert to canvas with actual dimensions and enhanced compatibility
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: actualHeight,
        windowWidth: 794,
        windowHeight: actualHeight,
        // Add these options for better compatibility
        foreignObjectRendering: false,
        removeContainer: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Additional cleanup in cloned document
          const clonedElements = clonedDoc.querySelectorAll('*');
          clonedElements.forEach(el => {
            const style = el.style;
            // Remove any remaining unsupported color formats
            ['color', 'backgroundColor', 'borderColor'].forEach(prop => {
              const value = style[prop];
              if (value && (value.includes('oklch') || value.includes('color-mix') || value.includes('lab') || value.includes('lch'))) {
                if (prop === 'backgroundColor') {
                  style[prop] = '#ffffff';
                } else if (prop === 'color') {
                  style[prop] = '#333333';
                } else if (prop === 'borderColor') {
                  style[prop] = '#cccccc';
                }
              }
            });
          });
        }
      });

      document.body.removeChild(printContent);

      // Create PDF with custom page size matching content
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF with custom height
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight] // Custom format: [width, height]
      });

      // Add the entire image as one page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Save PDF
      const fileName = `${recipe.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_long.pdf`;
      pdf.save(fileName);

      toast.success('PDF downloaded successfully!', { id: 'pdf-generation' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF!', { id: 'pdf-generation' });
    } finally {
      setIsPrinting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return difficulty || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recipe not found
          </h2>
          <Link to="/recipes" className="btn-primary">
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === recipe.authorId;
  const isFavorited = user && recipe.favorites?.includes(user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
            >
              <FiChevronLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>

            {isOwner && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/recipes/${recipe.id}/edit`}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-danger flex items-center space-x-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recipe Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {recipe.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      {recipe.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {user && (
                      <button
                        onClick={() => toggleFavorite(recipe.id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${isFavorited
                          ? 'text-red-500 bg-red-50 dark:bg-red-900/30'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30'
                          }`}
                      >
                        <FiHeart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                      </button>
                    )}

                    {/* Print PDF Button */}
                    <button
                      onClick={handlePrintToPDF}
                      disabled={isPrinting}
                      className={`p-2 rounded-full transition-colors duration-200 ${isPrinting
                        ? 'text-gray-300 bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                        : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                        }`}
                      title="In PDF"
                    >
                      <FiPrinter className={`w-6 h-6 ${isPrinting ? 'animate-pulse' : ''}`} />
                    </button>

                    <div className="relative group">
                      <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <FiShare2 className="w-6 h-6" />
                      </button>

                      {/* Share Dropdown */}
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        <div className="py-2">
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            Share on Facebook
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            Share on Twitter
                          </button>
                          <button
                            onClick={() => handleShare('copy')}
                            className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            Copy Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipe Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {recipe.cookTime} minutes
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {recipe.servings} people
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiBarChart2 className="w-5 h-5 text-gray-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyText(recipe.difficulty)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {recipe.category}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          disabled={!user}
                          className={`w-6 h-6 transition-colors duration-200 ${!user ? 'cursor-not-allowed' : 'cursor-pointer'
                            }`}
                        >
                          <FiStar
                            className={`w-full h-full ${star <= (hoverRating || userRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {recipe.rating?.toFixed(1) || '0.0'} ({recipe.totalRatings || 0} ratings)
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    By {recipe.authorName}
                  </div>
                </div>
              </div>
            </div>

            {/* Recipe Content Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'ingredients', label: 'Ingredients' },
                    { id: 'instructions', label: 'Instructions' },
                    { id: 'nutrition', label: 'Nutrition' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'ingredients' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Ingredients
                    </h3>
                    <ul className="space-y-2">
                      {recipe.ingredients?.map((ingredient, index) => (
                        <li
                          onClick={() => handleToggle(ingredient, selectedIngredients, setSelectedIngredients, 'selectedIngredients')}
                          key={index}
                          className="flex cursor-pointer items-center space-x-3">
                          <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          <span
                            className={`text-gray-700 ${selectedIngredients.includes(ingredient) ? 'line-through' : ''}  dark:text-gray-300`}>
                            {ingredient}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'instructions' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Instructions
                    </h3>
                    <div className="space-y-4">
                      {(Array.isArray(recipe.instructions) ? recipe.instructions : recipe.instructions?.split('\n') || [])
                        .map((step, index) => (
                          <div
                            onClick={() => handleToggle(step, selectedSugguested, setSelectedSugguested, 'selectedSugguested')}
                            key={index}
                            className="flex cursor-pointer space-x-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-semibold text-sm">
                              {index + 1}
                            </div>
                            <p
                              className={`text-gray-700 ${selectedSugguested.includes(step) ? 'line-through' : ''}
                              dark:text-gray-300 pt-1`}>
                              {step}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {activeTab === 'nutrition' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Nutrition Information (per serving)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                          {recipe.nutrition?.calories || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Calories
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {recipe.nutrition?.protein || 0}g
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Protein
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {recipe.nutrition?.carbs || 0}g
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Carbs
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {recipe.nutrition?.fat || 0}g
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Fat
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FiMessageCircle className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Comments ({comments.length})
                  </h3>
                </div>

                {/* Add Comment Form */}
                {user ? (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <div className="flex space-x-3">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder='Write your comment...'
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {newComment.length}/500 characters
                          </span>
                          <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiSend className="w-4 h-4" />
                            <span>Send</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Please login to comment
                    </p>
                    <Link to="/login" className="btn-primary">
                      Login
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <img
                          src={
                            // If this comment is from current user, use current user's avatar
                            user && comment.userId === user.id
                              ? (user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`)
                              : (comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=6366f1&color=fff`)
                          }
                          alt={comment.userName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {comment.userName}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                                {user && (user.id === comment.userId || isOwner) && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Recipes */}
            {suggestedRecipes.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Suggested Recipes
                </h3>
                <div className="space-y-4">
                  {suggestedRecipes.map((suggestedRecipe) => (
                    <RecipeCard
                      key={suggestedRecipe.id}
                      recipe={suggestedRecipe}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Delete Recipe
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete the recipe "{recipe.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecipe}
                className="flex-1 btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;