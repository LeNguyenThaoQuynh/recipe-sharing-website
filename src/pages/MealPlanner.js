import React, { useState, useEffect } from 'react';
import { useRecipe } from '../contexts/RecipeContext';
import { FiPlus, FiX, FiSearch, FiFilter, FiClock, FiUsers, FiStar } from 'react-icons/fi';

const MealPlanner = () => {
  const { recipes, loading } = useRecipe();
  const [mealPlan, setMealPlan] = useState({});
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Khởi tạo meal plan cho tuần
  const initializeMealPlan = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const plan = {};

    days.forEach(day => {
      plan[day] = {};
      mealTypes.forEach(meal => {
        plan[day][meal] = [];
      });
    });

    return plan;
  };

  useEffect(() => {
    setMealPlan(initializeMealPlan());
  }, []);

  // Lọc recipes theo search và category
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Lấy danh sách categories
  const categories = [...new Set(recipes.map(recipe => recipe.category))];

  // Mở modal chọn recipe
  const openRecipeSelector = (day, mealType) => {
    setSelectedSlot({ day, mealType });
    setShowRecipeModal(true);
    setSearchTerm('');
    setSelectedCategory('');
  };

  // Thêm recipe vào meal plan
  const addRecipeToMeal = (recipe) => {
    if (!selectedSlot) return;
    
    setMealPlan(prev => ({
      ...prev,
      [selectedSlot.day]: {
        ...prev[selectedSlot.day],
        [selectedSlot.mealType]: [...prev[selectedSlot.day][selectedSlot.mealType], recipe]
      }
    }));
    
    setShowRecipeModal(false);
    setSelectedSlot(null);
  };

  // Xóa recipe khỏi meal plan
  const removeRecipeFromMeal = (day, mealType, index) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: prev[day][mealType].filter((_, i) => i !== index)
      }
    }));
  };

  // Reset meal plan
  const clearMealPlan = () => {
    setMealPlan(initializeMealPlan());
  };

  // Helper functions
  const getDayName = (day) => {
    return day;
  };

  const getMealName = (mealType) => {
    return mealType;
  };

  // Tính tổng calo cho một bữa ăn
  const calculateMealCalories = (day, mealType) => {
    return mealPlan[day][mealType].reduce((total, recipe) => {
      return total + (recipe.nutrition?.calories || recipe.calories || 0);
    }, 0);
  };

  // Tính tổng calo cho một ngày
  const calculateDayCalories = (day) => {
    return ['breakfast', 'lunch', 'dinner'].reduce((total, meal) => {
      return total + calculateMealCalories(day, meal);
    }, 0);
  };

  // Tính tổng calo cho cả tuần
  const calculateWeekCalories = () => {
    return Object.keys(mealPlan).reduce((total, day) => {
      return total + calculateDayCalories(day);
    }, 0);
  };

  // Lấy cảnh báo calo
  const getCalorieWarning = (calories) => {
    if (calories > 2500) return { color: 'text-red-600', icon: '⚠️', message: 'High' };
    if (calories < 1200) return { color: 'text-yellow-600', icon: '⚡', message: 'Low' };
    return { color: 'text-green-600', icon: '✅', message: 'Good' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Weekly Meal Plan
          </h1>
          <p className="text-gray-600 text-lg">Meal Plan Description</p>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={clearMealPlan}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Thống kê calo tuần */}
        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-center mb-4 text-gray-800">📊 Weekly Calories Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {Object.keys(mealPlan).map(day => {
              const dayCalories = calculateDayCalories(day);
              const warning = getCalorieWarning(dayCalories);
              return (
                <div key={day} className="bg-white rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow">
                   <div className="text-xs font-semibold text-gray-700 mb-1">{getDayName(day)}</div>
                   <div className={`text-sm font-bold ${warning.color} mb-1`}>
                     🔥 {dayCalories}
                   </div>
                   <div className="text-xs">
                     <span className={warning.color}>{warning.icon} {warning.message}</span>
                   </div>
                 </div>
              );
            })}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 text-center shadow-sm">
              <div className="text-xs font-semibold text-gray-700 mb-1">Week Total</div>
              <div className="text-sm font-bold text-purple-600 mb-1">
                 🔥 {calculateWeekCalories()}
               </div>
              <div className="text-xs text-purple-600">🎯 Target</div>
            </div>
          </div>
        </div>

        {/* Meal Plan Grid */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📅 Weekly Meal Plan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {Object.keys(mealPlan).map(day => (
              <div key={day} className="bg-gradient-to-b from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-center mb-4 text-sm bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                  {getDayName(day)}
                </h3>
                
                {['breakfast', 'lunch', 'dinner'].map(mealType => (
                  <div key={mealType} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {mealType === 'breakfast' ? '🌅' : mealType === 'lunch' ? '☀️' : '🌙'}
                        </span>
                        <h4 className="text-xs font-bold text-gray-700">
                          {getMealName(mealType)}
                        </h4>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        🔥 {calculateMealCalories(day, mealType)}
                      </div>
                    </div>
                    
                    <div className="min-h-[120px] p-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50">
                      {mealPlan[day][mealType].length === 0 ? (
                        <button
                          onClick={() => openRecipeSelector(day, mealType)}
                          className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-300 transition-all duration-200 rounded-lg border-2 border-dashed border-gray-300 hover:border-orange-300"
                        >
                          <FiPlus className="w-6 h-6 mb-2" />
                          <p className="text-xs text-center">Add Recipe</p>
                        </button>
                      ) : (
                        <div className="space-y-2">
                          {mealPlan[day][mealType].map((recipe, index) => (
                            <div
                              key={`${recipe.id}-${index}`}
                              className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-sm"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-800 text-sm truncate">
                                    {recipe.title}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    🔥 {recipe.nutrition?.calories || recipe.calories || 'N/A'}
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeRecipeFromMeal(day, mealType, index)}
                                  className="ml-2 w-5 h-5 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 rounded-full text-xs font-bold transition-colors flex-shrink-0"
                                  title="Remove from plan"
                                >
                                  <FiX className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => openRecipeSelector(day, mealType)}
                            className="w-full p-2 text-center text-gray-400 hover:text-orange-500 transition-colors duration-200 border-2 border-dashed border-gray-300 hover:border-orange-300 rounded-lg"
                          >
                            <FiPlus className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe Selection Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  Select Recipe - {selectedSlot && getDayName(selectedSlot.day)} - {selectedSlot && getMealName(selectedSlot.mealType)}
                </h2>
                <button
                  onClick={() => setShowRecipeModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                  />
                </div>
                <div className="md:w-64 relative">
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors appearance-none bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Recipe List */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
                  <p className="text-gray-600">Try Adjusting Search Terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => addRecipeToMeal(recipe)}
                    >
                      {recipe.image ? (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-4xl">🍽️</span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-800 text-sm leading-tight">
                          {recipe.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                            {recipe.category}
                          </span>
                          <span className="text-gray-500 font-medium">
                            <FiClock className="inline w-3 h-3 mr-1" />
                            {recipe.time || recipe.cookTime} minutes
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                             🔥 {recipe.nutrition?.calories || recipe.calories || 'N/A'}
                           </span>
                           {recipe.servings && (
                             <span className="text-gray-500 font-medium">
                               <FiUsers className="inline w-3 h-3 mr-1" />
                               {recipe.servings}
                             </span>
                           )}
                         </div>
                        {recipe.rating && (
                          <div className="flex items-center text-xs text-gray-600">
                            <FiStar className="w-3 h-3 text-yellow-500 mr-1" />
                            {recipe.rating.toFixed(1)} ({recipe.totalRatings || 0})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;