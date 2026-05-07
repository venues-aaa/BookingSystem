import React, { useState } from 'react';
import './EmojiPicker.css';

/**
 * EmojiPicker Component
 *
 * A simple emoji picker with categorized emojis.
 * Used in category creation/edit forms for icon selection.
 */
const EmojiPicker = ({ onSelect, currentEmoji }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('common');

  // Emoji categories
  const emojiCategories = {
    common: {
      label: 'Common',
      emojis: ['🎉', '⭐', '💎', '🎯', '✨', '🔥', '💡', '🎨', '🎭', '🎪']
    },
    venues: {
      label: 'Venues',
      emojis: ['🏛️', '🏢', '🏰', '🏪', '🏨', '🏬', '🎪', '⛪', '🕌', '🏟️']
    },
    food: {
      label: 'Food & Catering',
      emojis: ['🍽️', '🍴', '🍕', '🍰', '🎂', '🍱', '🥘', '🍜', '🥗', '🍹', '☕', '🍷']
    },
    flowers: {
      label: 'Flowers & Nature',
      emojis: ['💐', '🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '🌿', '🍀', '🌱']
    },
    media: {
      label: 'Photography & Video',
      emojis: ['📷', '📸', '📹', '🎥', '🎬', '🎞️', '📽️', '🎦', '📺', '📻']
    },
    music: {
      label: 'Music & Entertainment',
      emojis: ['🎵', '🎶', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻', '🥁', '🎷']
    },
    decor: {
      label: 'Decoration & Design',
      emojis: ['🎨', '🎀', '🎈', '🎊', '🎁', '🎆', '🎇', '✨', '💫', '🌟']
    },
    celebration: {
      label: 'Celebration',
      emojis: ['🎂', '🎉', '🎊', '🎈', '🎁', '🎀', '🎗️', '🏆', '🥇', '🎯']
    },
    transport: {
      label: 'Transport',
      emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐']
    },
    objects: {
      label: 'Objects',
      emojis: ['💍', '👗', '👔', '👠', '👑', '🎩', '👰', '🤵', '💄', '💅']
    }
  };

  const handleEmojiSelect = (emoji) => {
    onSelect(emoji);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect('');
    setIsOpen(false);
  };

  return (
    <div className="emoji-picker-container">
      {/* Current emoji display / trigger button */}
      <div className="emoji-current" onClick={() => setIsOpen(!isOpen)}>
        <div className="emoji-display">
          {currentEmoji || '📦'}
        </div>
        <button type="button" className="emoji-trigger-btn">
          {currentEmoji ? 'Change Emoji' : 'Select Emoji'}
        </button>
      </div>

      {/* Emoji picker dropdown */}
      {isOpen && (
        <>
          {/* Backdrop to close picker when clicking outside */}
          <div className="emoji-backdrop" onClick={() => setIsOpen(false)} />

          <div className="emoji-picker-dropdown">
            {/* Header */}
            <div className="emoji-picker-header">
              <h4>Select an Emoji</h4>
              <button
                type="button"
                className="emoji-close-btn"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Category tabs */}
            <div className="emoji-categories">
              {Object.entries(emojiCategories).map(([key, category]) => (
                <button
                  key={key}
                  type="button"
                  className={`category-tab ${selectedCategory === key ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(key)}
                  title={category.label}
                >
                  {category.emojis[0]}
                </button>
              ))}
            </div>

            {/* Current category label */}
            <div className="emoji-category-label">
              {emojiCategories[selectedCategory].label}
            </div>

            {/* Emoji grid */}
            <div className="emoji-grid">
              {emojiCategories[selectedCategory].emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`emoji-item ${currentEmoji === emoji ? 'selected' : ''}`}
                  onClick={() => handleEmojiSelect(emoji)}
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Footer actions */}
            <div className="emoji-picker-footer">
              <button
                type="button"
                className="emoji-clear-btn"
                onClick={handleClear}
              >
                Clear Icon
              </button>
              <button
                type="button"
                className="emoji-done-btn"
                onClick={() => setIsOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPicker;
