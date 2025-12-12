import React, { useState } from 'react';
import { 
  FiFacebook, 
  FiTwitter, 
  FiLinkedin,
  FiMail,
  FiCopy,
  FiX,
  FiCheck,
  FiShare2
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, recipe, url }) => {
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  if (!isOpen || !recipe) return null;

  const shareUrl = url || window.location.href;
  const shareTitle = `Công thức: ${recipe.title}`;
  const shareDescription = recipe.description || `Khám phá công thức ${recipe.title} tuyệt vời này!`;
  const shareImage = recipe.image;

  const shareOptions = [
    {
      name: 'Facebook',
      icon: FiFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`${shareTitle} - ${shareDescription}`)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Twitter',
      icon: FiTwitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        const twitterText = `${shareTitle}\n${shareDescription}\n\n${shareUrl}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'LinkedIn',
      icon: FiLinkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
      }
    },
    {
      name: 'Email',
      icon: FiMail,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        const subject = encodeURIComponent(shareTitle);
        const body = encodeURIComponent(
          `Xin chào!\n\nTôi muốn chia sẻ với bạn công thức nấu ăn tuyệt vời này:\n\n${shareTitle}\n${shareDescription}\n\nXem chi tiết tại: ${shareUrl}\n\nChúc bạn nấu ăn vui vẻ!`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      const textToCopy = customMessage 
        ? `${customMessage}\n\n${shareTitle}\n${shareUrl}`
        : `${shareTitle}\n${shareDescription}\n\n${shareUrl}`;
      
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Đã sao chép vào clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      toast.success('Đã sao chép vào clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateQRCode = () => {
    // Simple QR code generation using a free service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <FiShare2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chia sẻ công thức
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Recipe Preview */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                {recipe.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {recipe.description}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>⏱️ {recipe.cookTime} phút</span>
                <span>👥 {recipe.servings} khẩu phần</span>
                <span>⭐ {recipe.averageRating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tin nhắn tùy chỉnh (tùy chọn)
          </label>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Thêm tin nhắn cá nhân của bạn..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            rows={3}
            maxLength={200}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            {customMessage.length}/200
          </div>
        </div>

        {/* Share Options */}
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Chia sẻ qua
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-white font-medium transition-all duration-200 transform hover:scale-105 ${option.color}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{option.name}</span>
                </button>
              );
            })}
          </div>

          {/* Copy Link */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Hoặc sao chép liên kết
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400"
              />
              <button
                onClick={copyToClipboard}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <FiCheck className="w-4 h-4" />
                    <span className="text-sm">Đã sao chép</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="w-4 h-4" />
                    <span className="text-sm">Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="mt-6 text-center">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Mã QR
            </h4>
            <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
              <img
                src={generateQRCode()}
                alt="QR Code"
                className="w-32 h-32 mx-auto"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Quét mã QR để truy cập nhanh
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Chia sẻ và lan tỏa niềm đam mê nấu ăn! 👨‍🍳
            </p>
            <button
              onClick={onClose}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;