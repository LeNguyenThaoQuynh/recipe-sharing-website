import React, { useState, useEffect, useRef } from 'react';
import { useIngredientAutocomplete } from '../../hooks/useIngredientAutocomplete';

const AutocompleteInput = ({ 
    value, 
    onChange, 
    onSelect, 
    className, 
    placeholder,
    ...props 
  }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const { getSuggestions, updateUsageCount, deleteSuggestion } = useIngredientAutocomplete();
    const [suggestions, setSuggestions] = useState(getSuggestions(value));
    const inputRef = useRef(null);
    const suggestionRefs = useRef([]);

    const onDeleteSuggestion = (text) => {
        deleteSuggestion(text);
        setSuggestions(getSuggestions(value));
    }
    
    const handleInputChange = (e) => {
      onChange(e);
      setActiveSuggestion(-1);
      setSuggestions(getSuggestions(e.target.value));
    };
  
    const handleSuggestionClick = (suggestion) => {
      console.log('suggestion', suggestion);
      
      const event = { target: { value: suggestion.display } };
      onChange(event);
      updateUsageCount(suggestion.text);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      if (onSelect) onSelect(suggestion);
    };

    const handleDeleteSuggestion = (e, suggestion) => {
        e.stopPropagation(); 
        e.preventDefault();
        onDeleteSuggestion(suggestion.text);
        
        if (inputRef.current) {
          inputRef.current.focus();
        }
        
        setActiveSuggestion(-1);
      };
  
    const handleKeyDown = (e) => {
      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === 'Enter' && value.trim()) {
          updateUsageCount(value.trim());
        }
        return;
      }
  
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveSuggestion(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveSuggestion(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (activeSuggestion >= 0) {
            handleSuggestionClick(suggestions[activeSuggestion]);
          } else if (value.trim()) {
            updateUsageCount(value.trim());
            setShowSuggestions(false);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setActiveSuggestion(-1);
          break;
        case 'Delete':
        case 'Backspace':
          if (e.ctrlKey && activeSuggestion >= 0) {
            e.preventDefault();
            onDeleteSuggestion(suggestions[activeSuggestion].text);
            setActiveSuggestion(-1);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (e.ctrlKey && activeSuggestion >= 0) {
            e.preventDefault();
            onDeleteSuggestion(suggestions[activeSuggestion].text);
            setActiveSuggestion(-1);
          }
          break;
      }
    };

    const handleBlur = (e) => {
        if (e.relatedTarget && e.relatedTarget.classList.contains('delete-button')) {
            return;
          }
      setTimeout(() => setShowSuggestions(false), 200);
      if (value.trim()) {
        updateUsageCount(value.trim());
      }
    };

    const handleFocus = () => {
      setShowSuggestions(true);
    };
  
    useEffect(() => {
      if (activeSuggestion >= 0 && suggestionRefs.current[activeSuggestion]) {
        suggestionRefs.current[activeSuggestion].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, [activeSuggestion]);
  
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={(e) => handleBlur(e)}
          className={className}
          placeholder={placeholder}
          autoComplete="off"
          {...props}
        />
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.sort((a, b) => b.count - a.count).map((suggestion, index) => (
              <div
                key={suggestion.text}
                ref={el => suggestionRefs.current[index] = el}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between group w-full ${
                  index === activeSuggestion
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span>{suggestion.display}</span>
                <div className="flex items-center gap-2">
                  {/* <span className="text-xs text-gray-500 dark:text-gray-400">
                    {suggestion.count}x
                  </span> */}
                  <button
                    type='button'
                    onClick={(e) => handleDeleteSuggestion(e, suggestion)}
                    className="delete-button opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-bold w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Xóa suggestion"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

export default AutocompleteInput;