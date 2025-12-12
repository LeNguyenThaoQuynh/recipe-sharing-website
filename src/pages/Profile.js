import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRecipe } from '../contexts/RecipeContext';
import RecipeCard from '../components/Recipe/RecipeCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';

import { 
  FiUser, 
  FiMail, 
  FiCalendar, 
  FiHeart, 
  FiUser as FiChef, 
  FiEdit3, 
  FiCamera,
  FiSave,
  FiX,
  FiPlus,
  FiStar,
  FiClock,
  FiUsers,
  FiUpload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const { recipes, getUserRecipes, getUserFavorites } = useRecipe();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [userRecipes, setUserRecipes] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatar: '',
    bio: '',
    dietaryPreferences: []
  });
  const [errors, setErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Initialize profile data
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || '',
      bio: user.bio || '',
      dietaryPreferences: user.dietaryPreferences || []
    });
    
    // Load user recipes and favorites
    const myRecipes = getUserRecipes(user.id);
    const myFavorites = getUserFavorites(user.id);
    
    setUserRecipes(myRecipes);
    setFavoriteRecipes(myFavorites);
  }, [user, recipes, getUserRecipes, getUserFavorites, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = 'Invalid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      toast.error('Please check the information');
      return;
    }

    // Đảm bảo avatar mới được cập nhật vào profileData trước khi lưu
    const updatedProfileData = {
      ...profileData,
      avatar: avatarPreview || profileData.avatar
    };

    const result = await updateProfile(updatedProfileData);
    if (result.success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Reset avatar file và preview sau khi lưu thành công
      setAvatarFile(null);
      setAvatarPreview('');
    } else {
      toast.error(result.error || 'Profile update failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Invalid image format'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: 'File size exceeded limit (max 5MB)'
        }));
        return;
      }
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatarUrl = e.target.result;
        setAvatarPreview(newAvatarUrl);
        // Cập nhật ngay lập tức ảnh hiển thị trong profile
        setProfileData(prev => ({
          ...prev,
          avatar: newAvatarUrl
        }));
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      if (errors.avatar) {
        setErrors(prev => ({
          ...prev,
          avatar: ''
        }));
      }
    }
  };

  const handleDietaryPreferenceToggle = (preference) => {
    setProfileData(prev => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.includes(preference)
        ? prev.dietaryPreferences.filter(p => p !== preference)
        : [...prev.dietaryPreferences, preference]
    }));
  };

  const dietaryOptions = [
    { value: 'vegetarian', label: 'vegetarian'},
    { value: 'vegan', label: 'vegan' },
    { value: 'gluten-free', label: 'glutenFree' },
    { value: 'dairy-free', label: 'dairyFree' },
    { value: 'low-carb', label: 'lowCarb' },
    { value: 'keto', label: 'keto' },
    { value: 'paleo', label: 'paleo' },
    { value: 'low-fat', label: 'lowFat' }
  ];

  const getStats = () => {
    const totalRecipes = userRecipes.length;
    const totalFavorites = favoriteRecipes.length;
    const totalRatings = userRecipes.reduce((sum, recipe) => sum + (recipe.totalRatings || 0), 0);
    const avgRating = userRecipes.length > 0 
      ? userRecipes.reduce((sum, recipe) => sum + (recipe.rating || 0), 0) / userRecipes.length 
      : 0;
    
    return {
      totalRecipes,
      totalFavorites,
      totalRatings,
      avgRating
    };
  };

  const stats = getStats();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4 sm:mb-0">
                <div className="relative">
                  <img
                    src={profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=6366f1&color=fff&size=128`}
                    alt={profileData.name}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
                  />
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-200 cursor-pointer"
                    >
                      <FiCamera className="w-4 h-4" />
                    </label>
                  )}
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        className={`text-2xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 outline-none text-gray-900 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
                        placeholder="Your name"
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleChange}
                        className={`bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-primary-500 outline-none text-gray-600 dark:text-gray-400 ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="Your email"
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar}</p>}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Accepted formats: JPG, PNG, GIF (max 5MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profileData.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                      <FiMail className="w-4 h-4" />
                      <span>{profileData.email}</span>
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 flex items-center space-x-2 mt-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>Joined Since {new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                    </p>
                  </div>
                )}
              </div>
              
              {/* Edit Button */}
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setProfileData({
                          name: user.name || '',
                          email: user.email || '',
                          avatar: user.avatar || '',
                          bio: user.bio || '',
                          dietaryPreferences: user.dietaryPreferences || []
                        });
                        setErrors({});
                      }}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Bio */}
            <div className="mt-6">
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder='Write a little about yourself...'
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {profileData.bio || 'No bio information yet.'}
                </p>
              )}
            </div>
            
            {/* Dietary Preferences */}
            {isEditing && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Dietary preferences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleDietaryPreferenceToggle(option.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        profileData.dietaryPreferences.includes(option.value)
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Display Dietary Preferences */}
            {!isEditing && profileData.dietaryPreferences.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {profileData.dietaryPreferences.map((pref) => {
                    const option = dietaryOptions.find(opt => opt.value === pref);
                    return (
                      <span
                        key={pref}
                        className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-sm font-medium"
                      >
                        {option?.label || pref}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {stats.totalRecipes}
            </div>
            <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center space-x-1">
              <FiUser className="w-4 h-4" />
              <span>Recipes</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {stats.totalFavorites}
            </div>
            <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center space-x-1">
              <FiHeart className="w-4 h-4" />
              <span>Favorites</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {stats.avgRating.toFixed(1)}
            </div>
            <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center space-x-1">
              <FiStar className="w-4 h-4" />
              <span>Average Rating</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">
              {stats.totalRatings}
            </div>
            <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center space-x-1">
              <FiUsers className="w-4 h-4" />
              <span>Total Ratings</span>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', count: null },
                { id: 'recipes', label: 'My Recipes', count: stats.totalRecipes },
                { id: 'favorites', label: 'Favorites', count: stats.totalFavorites }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {userRecipes.slice(0, 3).map((recipe) => (
                      <div key={recipe.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {recipe.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Create on {new Date(recipe.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <FiStar className="w-4 h-4" />
                          <span className="text-sm">{recipe.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                    ))}
                    {userRecipes.length === 0 && (
                      <div className="text-center py-8">
                        <FiChef className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          No recipes yet
                        </p>
                        <Link to="/recipes/new" className="btn-primary flex items-center space-x-2 mx-auto">
                          <FiPlus className="w-4 h-4" />
                          <span>Create first recipe</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'recipes' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    My Recipes ({stats.totalRecipes})
                  </h3>
                  <Link to="/recipes/new" className="btn-primary flex items-center space-x-2">
                    <FiPlus className="w-4 h-4" />
                    <span>Create New Recipe</span>
                  </Link>
                </div>
                
                {userRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <FiChef className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No recipes yet
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Start sharing your amazing recipes!
                    </p>
                    <Link to="/recipes/new" className="btn-primary flex items-center space-x-2 mx-auto">
                      <FiPlus className="w-4 h-4" />
                      <span>Create First Recipe</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userRecipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} showAuthor={false} />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Favorite Recipes ({stats.totalFavorites})
                  </h3>
                
                {favoriteRecipes.length === 0 ? (
                  <div className="text-center py-12">
                    <FiHeart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No favorite recipes
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Explore and save recipes you love!
                    </p>
                    <Link to="/recipes" className="btn-primary">
                      Explore recipes
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteRecipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;