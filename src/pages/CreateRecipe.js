import React from 'react';
import RecipeForm from '../components/Recipe/RecipeForm';

const CreateRecipe = () => {
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Recipe
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Share your culinary creation with the community
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <RecipeForm />
        </div>
      </div>
    </div>
  );
};

export default CreateRecipe;