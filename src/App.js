import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RecipeProvider } from './contexts/RecipeContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import EditRecipe from './pages/EditRecipe';
import Profile from './pages/Profile';
import MealPlanner from './pages/MealPlanner';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
      <ThemeProvider>
        <AuthProvider>
          <RecipeProvider>
            <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/recipes" element={<RecipeList />} />
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes */}
                  <Route path="/create-recipe" element={
                    <ProtectedRoute>
                      <CreateRecipe />
                    </ProtectedRoute>
                  } />
                  <Route path="/edit-recipe/:id" element={
                    <ProtectedRoute>
                      <EditRecipe />
                    </ProtectedRoute>
                  } />
                  <Route path="/recipes/:id/edit" element={
                    <ProtectedRoute>
                      <EditRecipe />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/meal-planner" element={
                    <ProtectedRoute>
                      <MealPlanner />
                    </ProtectedRoute>
                  } />
                  <Route path="/favorites" element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                  },
                }}
              />
            </div>
            </Router>
          </RecipeProvider>
        </AuthProvider>
      </ThemeProvider>
  );
}

export default App;