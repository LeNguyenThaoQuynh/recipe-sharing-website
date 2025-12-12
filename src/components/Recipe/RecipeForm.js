import React, {
  useEffect,
  useState,
} from 'react';

import {
  DragDropContext,
  Draggable,
  Droppable,
} from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import {
  FiChevronLeft,
  FiMenu,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from 'react-icons/fi';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { useRecipe } from '../../contexts/RecipeContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import AutocompleteInput from './AutocompleteInput';

const RecipeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { recipes, createRecipe, updateRecipe, loading } = useRecipe();

  const isEditing = Boolean(id);
  const [recipe, setRecipe] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    ingredients: [''],
    instructions: '',
    cookTime: '',
    servings: '',
    category: '',
    difficulty: 'easy',
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEditing) {
      const foundRecipe = recipes.find(r => r.id === parseInt(id));
      if (foundRecipe) {
        if (foundRecipe.authorId !== user.id) {
          toast.error('You do not have permission to edit this recipe');
          navigate('/recipes');
          return;
        }

        setRecipe(foundRecipe);
        setFormData({
          title: foundRecipe.title || '',
          description: foundRecipe.description || '',
          image: foundRecipe.image || '',
          ingredients: foundRecipe.ingredients?.length ? foundRecipe.ingredients : [''],
          instructions: Array.isArray(foundRecipe.instructions) ? foundRecipe.instructions.join('\n') : (foundRecipe.instructions || ''),
          cookTime: foundRecipe.cookTime?.toString() || '',
          servings: foundRecipe.servings?.toString() || '',
          difficulty: foundRecipe.difficulty || 'easy',
          category: foundRecipe.category || 'breakfast',
          nutrition: {
            calories: foundRecipe.nutrition?.calories?.toString() || '',
            protein: foundRecipe.nutrition?.protein?.toString() || '',
            carbs: foundRecipe.nutrition?.carbs?.toString() || '',
            fat: foundRecipe.nutrition?.fat?.toString() || ''
          }
        });
        setImagePreview(foundRecipe.image || '');
        // Set filename for existing images (if it's a base64 string, show generic name)
        if (foundRecipe.image) {
          if (foundRecipe.image.startsWith('data:image/')) {
            setSelectedFileName('Current Image');
          } else {
            // For URL images, extract filename or use generic name
            const urlParts = foundRecipe.image.split('/');
            setSelectedFileName(urlParts[urlParts.length - 1] || 'Current Image');
          }
        }
      } else {
        toast.error('Recipe not found');
        navigate('/recipes');
      }
    }
  }, [id, isEditing, recipes, user, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    // Image validation
    if (!formData.image) {
      newErrors.image = 'Image is required';
    }

    // Ingredients validation
    const validIngredients = formData.ingredients.filter(ing => ing.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least 1 ingredient is required';
    }

    // Instructions validation
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    } else if (formData.instructions.trim().length < 20) {
      newErrors.instructions = 'Instructions must be at least 20 characters';
    }

    // Cook time validation
    if (!formData.cookTime) {
      newErrors.cookTime = 'Cook time is required';
    } else if (isNaN(formData.cookTime) || parseInt(formData.cookTime) <= 0) {
      newErrors.cookTime = 'Cook time must be a positive number';
    }

    // Servings validation
    if (!formData.servings) {
      newErrors.servings = 'Servings is required';
    } else if (isNaN(formData.servings) || parseInt(formData.servings) <= 0) {
      newErrors.servings = 'Servings must be a positive number';
    }

    // Nutrition validation (optional but if provided must be valid)
    Object.keys(formData.nutrition).forEach(key => {
      const value = formData.nutrition[key];
      if (value && (isNaN(value) || parseFloat(value) < 0)) {
        newErrors[`nutrition.${key}`] = 'Nutrition values must be non-negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please check the information');
      return;
    }

    const recipeData = {
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.trim()),
      instructions: formData.instructions.split('\n').filter(step => step.trim()),
      cookTime: parseInt(formData.cookTime),
      servings: parseInt(formData.servings),
      nutrition: {
        calories: formData.nutrition.calories ? parseFloat(formData.nutrition.calories) : 0,
        protein: formData.nutrition.protein ? parseFloat(formData.nutrition.protein) : 0,
        carbs: formData.nutrition.carbs ? parseFloat(formData.nutrition.carbs) : 0,
        fat: formData.nutrition.fat ? parseFloat(formData.nutrition.fat) : 0
      }
    };

    let result;
    if (isEditing && recipe) {
      result = await updateRecipe(recipe.id, recipeData);
    } else {
      result = await createRecipe(recipeData);
    }

    if (result.success) {
      toast.success(isEditing ? 'Recipe updated successfully!' : 'Recipe created successfully!');
      navigate(`/recipes/${result.data.id}`);
    } else {
      toast.error(result.error || 'An error occurred');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('nutrition.')) {
      const nutritionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        nutrition: {
          ...prev.nutrition,
          [nutritionKey]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid image format');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('File size exceeded limit');
        return;
      }

      setSelectedFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        setFormData(prev => ({ ...prev, image: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);

      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview('');
    setSelectedFileName('');
    // Reset file input
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    }
  };

  const updateIngredient = (index, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => i === index ? value : ing)
    }));

    if (errors.ingredients) {
      setErrors(prev => ({ ...prev, ingredients: '' }));
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedIngredients = Array.from(formData.ingredients);
    const [reorderedItem] = reorderedIngredients.splice(result.source.index, 1);
    reorderedIngredients.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({
      ...prev,
      ingredients: reorderedIngredients
    }));
  };

  const categories = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'dessert', label: 'Dessert' },
    { value: 'drink', label: 'Drink' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
              >
                <FiChevronLeft className="w-5 h-5" />
                <span>Go back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label htmlFor="title" className="form-label">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder='Enter recipe title'
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`input-field resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder='Brief description of the recipe'
                />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              <div className="lg:col-span-2">
                <label htmlFor="image" className="form-label">
                  Dish Image *
                </label>
                <div className="space-y-4">
                  {!imagePreview ? (
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="image" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ${errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiUpload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload image</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF, WebP (MAX. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                            <FiUpload className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              {selectedFileName}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Image uploaded successfully
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="p-1 text-green-600 dark:text-green-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="text-center">
                        <label htmlFor="image" className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
                          <FiUpload className="w-4 h-4 mr-2" />
                          Choose Another Image
                        </label>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                  {errors.image && <p className="form-error">{errors.image}</p>}

                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={() => setImagePreview('')}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="cookTime" className="form-label">
                  Cook Time (minutes) *
                </label>
                <input
                  type="number"
                  id="cookTime"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleChange}
                  min="1"
                  className={`input-field ${errors.cookTime ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="30"
                />
                {errors.cookTime && <p className="form-error">{errors.cookTime}</p>}
              </div>

              <div>
                <label htmlFor="servings" className="form-label">
                  Servings *
                </label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  min="1"
                  className={`input-field ${errors.servings ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="4"
                />
                {errors.servings && <p className="form-error">{errors.servings}</p>}
              </div>

              <div>
                <label htmlFor="difficulty" className="form-label">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="input-field"
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="category" className="form-label">
                  Categories
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ingredients *
                </h2>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Ingredient</span>
                </button>
              </div>

              <Droppable droppableId="ingredients">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {formData.ingredients.map((ingredient, index) => (
                      <Draggable
                        key={`ingredient-${index}`}
                        draggableId={`ingredient-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center space-x-3 p-2 rounded-lg ${snapshot.isDragging
                              ? 'bg-gray-100 dark:bg-gray-700 shadow-md'
                              : ''
                              }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-move"
                            >
                              <FiMenu className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                            <AutocompleteInput
                          value={ingredient}
                          onChange={(e) => updateIngredient(index, e.target.value)}
                          className="input-field"
                          placeholder={`Ingredient ${index + 1}`}
                        />
                            </div>
                            {formData.ingredients.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeIngredient(index)}
                                className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              {errors.ingredients && <p className="form-error mt-2">{errors.ingredients}</p>}
            </div>
          </DragDropContext>

          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Instructions *
            </h2>

            <div>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={8}
                className={`input-field resize-none ${errors.instructions ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder='Describe detailed steps to prepare the dish. Each step on a new line.'
              />
              {errors.instructions && <p className="form-error">{errors.instructions}</p>}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Tip: Write each step on a new line for better readability.
              </p>
            </div>
          </div>

          {/* Nutrition Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Nutrition Information (per serving)
            </h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="nutrition.calories" className="form-label">
                  Calories
                </label>
                <input
                  type="number"
                  id="nutrition.calories"
                  name="nutrition.calories"
                  value={formData.nutrition.calories}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`input-field ${errors['nutrition.calories'] ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="250"
                />
                {errors['nutrition.calories'] && <p className="form-error">{errors['nutrition.calories']}</p>}
              </div>

              <div>
                <label htmlFor="nutrition.protein" className="form-label">
                  Protein (g)
                </label>
                <input
                  type="number"
                  id="nutrition.protein"
                  name="nutrition.protein"
                  value={formData.nutrition.protein}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`input-field ${errors['nutrition.protein'] ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="15"
                />
                {errors['nutrition.protein'] && <p className="form-error">{errors['nutrition.protein']}</p>}
              </div>

              <div>
                <label htmlFor="nutrition.carbs" className="form-label">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  id="nutrition.carbs"
                  name="nutrition.carbs"
                  value={formData.nutrition.carbs}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`input-field ${errors['nutrition.carbs'] ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="30"
                />
                {errors['nutrition.carbs'] && <p className="form-error">{errors['nutrition.carbs']}</p>}
              </div>

              <div>
                <label htmlFor="nutrition.fat" className="form-label">
                  Fat (g)
                </label>
                <input
                  type="number"
                  id="nutrition.fat"
                  name="nutrition.fat"
                  value={formData.nutrition.fat}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className={`input-field ${errors['nutrition.fat'] ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="10"
                />
                {errors['nutrition.fat'] && <p className="form-error">{errors['nutrition.fat']}</p>}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>{isEditing ? 'Update' : 'Create Recipe'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;