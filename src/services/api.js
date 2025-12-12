import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  async login(email, password) {
    try {
      // Mock authentication - in real app, this would be a proper API call
      const usersResponse = await api.get('/users');
      const users = usersResponse.data;

      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const token = `mock-token-${user.id}-${Date.now()}`;
        const { password: _, ...userWithoutPassword } = user;
        
        return {
          success: true,
          data: {
            user: userWithoutPassword,
            token
          }
        };
      } else {
        return {
          success: false,
          error: 'Email hoặc mật khẩu không đúng'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi đăng nhập'
      };
    }
  },

  async register(userData) {
    try {
      // Check if email already exists
      const usersResponse = await api.get('/users');
      const users = usersResponse.data;
      
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'Email đã được sử dụng'
        };
      }
      
      // Create new user
      const newUser = {
        ...userData,
        id: Date.now(),
        avatar: userData.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`,
        bio: userData.bio || '',
        dietaryPreferences: userData.dietaryPreferences || []
      };
      
      const response = await api.post('/users', newUser);
      const token = `mock-token-${newUser.id}-${Date.now()}`;
      const { password: _, ...userWithoutPassword } = response.data;
      
      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi đăng ký'
      };
    }
  },

  async updateProfile(userId, userData) {
    try {
      const response = await api.patch(`/users/${userId}`, userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi cập nhật hồ sơ'
      };
    }
  }
};

// Recipe API
export const recipeAPI = {
  async getAll() {
    try {
      const response = await api.get('/recipes?_sort=createdAt&_order=desc');
      const recipes = response.data;
      
      // Load comments for each recipe
      const recipesWithComments = await Promise.all(
        recipes.map(async (recipe) => {
          try {
            const commentsResponse = await api.get(`/comments?recipeId=${recipe.id}&_sort=createdAt&_order=desc`);
            return {
              ...recipe,
              comments: commentsResponse.data || []
            };
          } catch (error) {
            console.error(`Error loading comments for recipe ${recipe.id}:`, error);
            return {
              ...recipe,
              comments: []
            };
          }
        })
      );
      
      return {
        success: true,
        data: recipesWithComments
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi tải công thức'
      };
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/recipes/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Không tìm thấy công thức'
      };
    }
  },

  async create(recipeData) {
    try {
      const response = await api.post('/recipes', {
        ...recipeData,
        id: Date.now()
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi tạo công thức'
      };
    }
  },

  async update(id, recipeData) {
    try {
      const response = await api.patch(`/recipes/${id}`, recipeData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi cập nhật công thức'
      };
    }
  },

  async delete(id) {
    try {
      await api.delete(`/recipes/${id}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi xóa công thức'
      };
    }
  },

  async getByAuthor(authorId) {
    try {
      const response = await api.get(`/recipes?authorId=${authorId}&_sort=createdAt&_order=desc`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi tải công thức'
      };
    }
  }
};

// Comment API
export const commentAPI = {
  async getByRecipe(recipeId) {
    try {
      const response = await api.get(`/comments?recipeId=${recipeId}&_sort=createdAt&_order=desc`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi tải bình luận'
      };
    }
  },

  async create(commentData) {
    try {
      const response = await api.post('/comments', {
        ...commentData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi thêm bình luận'
      };
    }
  },

  async delete(id) {
    try {
      await api.delete(`/comments/${id}`);
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi xóa bình luận'
      };
    }
  }
};

// Rating API
export const ratingAPI = {
  async rate(userId, recipeId, rating) {
    try {
      // Check if user already rated this recipe
      const existingRatingsResponse = await api.get(`/ratings?userId=${userId}&recipeId=${recipeId}`);
      const existingRatings = existingRatingsResponse.data;
      
      if (existingRatings.length > 0) {
        // Update existing rating
        await api.patch(`/ratings/${existingRatings[0].id}`, { rating });
      } else {
        // Create new rating
        await api.post('/ratings', {
          id: Date.now(),
          userId,
          recipeId,
          rating,
          createdAt: new Date().toISOString()
        });
      }
      
      // Recalculate recipe average rating
      const allRatingsResponse = await api.get(`/ratings?recipeId=${recipeId}`);
      const allRatings = allRatingsResponse.data;
      
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length 
        : 0;
      
      // Update recipe with new average rating
      const updatedRecipeResponse = await api.patch(`/recipes/${recipeId}`, {
        rating: Math.round(averageRating * 10) / 10,
        totalRatings: allRatings.length
      });
      
      return {
        success: true,
        data: updatedRecipeResponse.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi đánh giá'
      };
    }
  },

  async getUserRatings(userId) {
    try {
      const response = await api.get(`/ratings?userId=${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi tải đánh giá'
      };
    }
  }
};

// Favorite API
export const favoriteAPI = {
  async getUserFavorites(userId) {
    try {
      const response = await api.get(`/favorites?userId=${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi tải danh sách yêu thích'
      };
    }
  },

  async add(userId, recipeId) {
    try {
      // Check if already favorited
      const existingResponse = await api.get(`/favorites?userId=${userId}&recipeId=${recipeId}`);
      if (existingResponse.data.length > 0) {
        return { success: true };
      }
      
      const response = await api.post('/favorites', {
        id: Date.now(),
        userId,
        recipeId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi thêm vào yêu thích'
      };
    }
  },

  async remove(userId, recipeId) {
    try {
      const existingResponse = await api.get(`/favorites?userId=${userId}&recipeId=${recipeId}`);
      const existing = existingResponse.data;
      
      if (existing.length > 0) {
        await api.delete(`/favorites/${existing[0].id}`);
      }
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi xóa khỏi yêu thích'
      };
    }
  }
};

// Meal Plan API
export const mealPlanAPI = {
  async getUserMealPlans(userId) {
    try {
      const response = await api.get(`/mealPlans?userId=${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi tải kế hoạch bữa ăn'
      };
    }
  },

  async updateMealPlan(userId, date, recipes) {
    try {
      // Check if meal plan exists for this date
      const existingResponse = await api.get(`/mealPlans?userId=${userId}&date=${date}`);
      const existing = existingResponse.data;
      
      if (existing.length > 0) {
        // Update existing meal plan
        const response = await api.patch(`/mealPlans/${existing[0].id}`, { recipes });
        return {
          success: true,
          data: response.data
        };
      } else {
        // Create new meal plan
        const response = await api.post('/mealPlans', {
          id: Date.now(),
          userId,
          date,
          recipes
        });
        return {
          success: true,
          data: response.data
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Đã xảy ra lỗi khi cập nhật kế hoạch bữa ăn'
      };
    }
  }
};

export default api;