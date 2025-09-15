'use client';

import React, { useState } from 'react';
import { BookmarkItem } from '../types';

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkItem[];
  onAddBookmark: (bookmark: BookmarkItem) => void;
  onRemoveBookmark: (bookmarkId: string) => void;
}

export default function BookmarksPanel({
  isOpen,
  onClose,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark
}: BookmarksPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    text: '',
    context: '',
    notes: '',
    tags: [] as string[]
  });

  const allTags = Array.from(new Set(bookmarks.flatMap(b => b.tags)));

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => bookmark.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const handleAddBookmark = () => {
    if (!newBookmark.text.trim()) return;

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      title: newBookmark.text.substring(0, 50) + (newBookmark.text.length > 50 ? '...' : ''),
      content: newBookmark.text,
      text: newBookmark.text,
      context: newBookmark.context,
      timestamp: Date.now(),
      notes: newBookmark.notes,
      tags: newBookmark.tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onAddBookmark(bookmark);
    setNewBookmark({ text: '', context: '', notes: '', tags: [] });
    setShowAddForm(false);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bookmarks</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Add Bookmark"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by tags:
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Bookmark Form */}
      {showAddForm && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add New Bookmark</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Text to bookmark..."
              value={newBookmark.text}
              onChange={(e) => setNewBookmark(prev => ({ ...prev, text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Context (optional)"
              value={newBookmark.context}
              onChange={(e) => setNewBookmark(prev => ({ ...prev, context: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Notes (optional)"
              value={newBookmark.notes}
              onChange={(e) => setNewBookmark(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddBookmark}
                disabled={!newBookmark.text.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto">
        {filteredBookmarks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <p>No bookmarks found</p>
              {searchTerm || selectedTags.length > 0 ? (
                <p className="text-sm">Try adjusting your search or filters</p>
              ) : (
                <p className="text-sm">Create your first bookmark</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {filteredBookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {bookmark.text}
                    </p>
                    {bookmark.context && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {bookmark.context}
                      </p>
                    )}
                    {bookmark.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        {bookmark.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {bookmark.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => onRemoveBookmark(bookmark.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Remove bookmark"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(bookmark.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}</span>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTags([]);
            }}
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            Clear filters
          </button>
        </div>
      </div>
    </div>
  );
} 