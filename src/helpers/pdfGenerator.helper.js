export const cssPrint = `
        width: 210mm;
        min-height: 297mm;
        padding: 0;
        margin: 0;
        background: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        box-sizing: border-box;
        position: relative;

        .shadow-md {
            --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --tw-shadow-colored: 0 1px 2px 0 0 0 #0000;
            box-shadow: 0 0 #0000,0 0 #0000,0 0 #0000;
        }
        ::backdrop {
            --tw-shadow-color: 0 0 #0000;
            --tw-ring-offset-shadow: 0 0 #0000;
            --tw-ring-shadow: 0 0 #0000;
            --tw-shadow: 0 0 #0000;
}
      `
export const pdfGenerator = (recipe, t, getDifficultyText) => `
        <!-- Header với logo và branding -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px 30px; margin: 0;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h1 style="font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 1px;">Recipe Share</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${t('shareRecipes')}</p>
            </div>
            <div style="text-align: right; font-size: 12px; opacity: 0.8;">
              <div>${new Date().toLocaleDateString('vi-VN')}</div>
              <div>webnauan.com</div>
            </div>
          </div>
        </div>
        
        <!-- Main content -->
        <div style="padding: 30px;">
          <!-- Recipe title and description -->
            <div class="shadow-md" style="padding-bottom: 15px; margin-bottom: 15px; --tw-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); --tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color); box-shadow: var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow);">
                <div style="text-align: center;display: flex; justify-content: center; align-items: center; height: 320px; overflow: hidden; object-fit: cover; background-size: cover; background-position: center; border-radius: 15px 15px 0px 0px;">
                <img src="${recipe.image}" alt="${recipe.title}" style="width: 100%; object-fit: cover; vertical-align: middle;">
                </div>
                <div style="padding: 1.5rem;">
                    <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 15px 0; color: #1a202c; text-shadow: 0 1px 3px rgba(0,0,0,0.1);">${recipe.title}</h1>
                  <p style="font-size: 16px; color: #4a5568; margin: 0; font-style: italic; line-height: 1.5;">${recipe.description}</p>
                </div>
                 <!-- Recipe info cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 35px;">
                <div style="padding: 20px; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <div style="font-size: 24px; margin-bottom: 8px;">⏱️</div>
                  <div style="font-weight: bold; color: #2d3748; font-size: 14px; margin-bottom: 5px;">${t('cookTime')}</div>
                  <div style="color: #667eea; font-weight: 600; font-size: 16px;">${recipe.cookTime} ${t('minutes')}</div>
                </div>
                <div style="padding: 20px; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
                  <div style="font-weight: bold; color: #2d3748; font-size: 14px; margin-bottom: 5px;">${t('servings')}</div>
                  <div style="color: #667eea; font-weight: 600; font-size: 16px;">${recipe.servings} ${t('people')}</div>
                </div>
                <div style="padding: 20px; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                  <div style="font-weight: bold; color: #2d3748; font-size: 14px; margin-bottom: 5px;">${t('difficulty')}</div>
                  <div style="color: #667eea; font-weight: 600; font-size: 16px;">${getDifficultyText(recipe.difficulty)}</div>
                </div>
                <div style="padding: 20px; background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <div style="font-size: 24px; margin-bottom: 8px;">🍽️</div>
                  <div style="font-weight: bold; color: #2d3748; font-size: 14px; margin-bottom: 5px;">${t('category')}</div>
                  <div style="color: #667eea; font-weight: 600; font-size: 16px;">${recipe.category}</div>
                </div>
              </div>
            </div>
          
          <!-- Ingredients section -->
          <div style="margin-bottom: 35px; background: #fff; border-radius: 15px; border: 2px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 20px;">
              <h2 style="font-size: 22px; font-weight: bold; margin: 0; display: flex; align-items: center;">🥬 ${t('ingredients')}</h2>
            </div>
            <div style="padding: 25px;">
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${recipe.ingredients?.map((ingredient) => `
                  <li style="padding: 2px 12px; border-radius: 8px; color: #2d3748; font-size: 15px; display: flex; align-items: center; gap: 12px;">
                    <span style="width: 8px; margin-top: 18px; height: 8px; border-radius: 999px; display: block; background-color: #f3760b;"></span>${ingredient}
                  </li>
                `).join('') || ''}
              </ul>
            </div>
          </div>
          
          <!-- Instructions section -->
          <div style="margin-bottom: 35px; background: #fff; border-radius: 15px; border: 2px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 20px;">
              <h2 style="font-size: 22px; font-weight: bold; margin: 0; display: flex; align-items: center;">👨‍🍳 ${t('instructions')}</h2>
            </div>
            <div style="padding: 25px;">
              <ol style="list-style: none; padding: 0; margin: 0; counter-reset: step-counter;">
                ${recipe.instructions?.map((instruction, index) => `
                  <li style="padding: 16px 0px; display: flex; align-items: center; color: #2d3748; font-size: 15px; line-height: 1.6; counter-increment: step-counter; position: relative;">
                    <span style="background: #fdedd3; color: #e45c06; width: 30px; padding-bottom: 12px; margin-top: 14px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${index + 1}</span>
                    <div style="margin-left: 10px;">${instruction}</div>
                  </li>
                `).join('') || ''}
              </ol>
            </div>
          </div>
          
          ${recipe.nutrition ? `
          <!-- Nutrition section -->
          <div style="margin-bottom: 35px; background: #fff; border-radius: 15px; border: 2px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px;">
              <h2 style="font-size: 22px; font-weight: bold; margin: 0; display: flex; align-items: center;">📊 ${t('nutritionInfo')}</h2>
            </div>
            <div style="padding: 25px;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%); border-radius: 12px; border: 2px solid #fc8181;">
                  <div style="font-size: 28px; margin-bottom: 8px;">🔥</div>
                  <div style="font-size: 24px; font-weight: bold; color: #c53030; margin-bottom: 5px;">${recipe.nutrition.calories || 0}</div>
                  <div style="font-weight: 600; color: #742a2a; font-size: 14px;">Calories</div>
                </div>
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%); border-radius: 12px; border: 2px solid #68d391;">
                  <div style="font-size: 28px; margin-bottom: 8px;">💪</div>
                  <div style="font-size: 24px; font-weight: bold; color: #2f855a; margin-bottom: 5px;">${recipe.nutrition.protein || 0}g</div>
                  <div style="font-weight: 600; color: #22543d; font-size: 14px;">Protein</div>
                </div>
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #feebc8 0%, #fbd38d 100%); border-radius: 12px; border: 2px solid #f6ad55;">
                  <div style="font-size: 28px; margin-bottom: 8px;">🌾</div>
                  <div style="font-size: 24px; font-weight: bold; color: #c05621; margin-bottom: 5px;">${recipe.nutrition.carbs || 0}g</div>
                  <div style="font-weight: 600; color: #7c2d12; font-size: 14px;">Carbs</div>
                </div>
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #e9d8fd 0%, #d6bcfa 100%); border-radius: 12px; border: 2px solid #b794f6;">
                  <div style="font-size: 28px; margin-bottom: 8px;">🥑</div>
                  <div style="font-size: 24px; font-weight: bold; color: #553c9a; margin-bottom: 5px;">${recipe.nutrition.fat || 0}g</div>
                  <div style="font-weight: 600; color: #44337a; font-size: 14px;">Fat</div>
                </div>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div style="background: #f7fafc; padding: 20px 30px; margin-top: auto; border-top: 2px solid #e2e8f0; text-align: center;">
          <div style="color: #718096; font-size: 14px; margin-bottom: 10px;">
            <strong>Recipe Share</strong> - ${t('platformDescription')}
          </div>
          <div style="color: #a0aec0; font-size: 12px;">
            📧 contact@webnauan.com | 🌐 www.webnauan.com | 📱 ${t('downloadAppToday')}!
          </div>
        </div>
      `