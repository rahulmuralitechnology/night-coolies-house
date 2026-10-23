import { useCallback, useEffect, useState } from 'react';

// Rooms are stored whole so a shortlist survives reloads even if a source stops returning that listing
export function useStoredList(storageKey, limit = Infinity) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [storageKey, items]);

  const has = useCallback(id => items.some(item => item.id === id), [items]);

  // Returns false when the item could not be added because the list is full
  const toggle = useCallback(room => {
    if (items.some(item => item.id === room.id)) {
      setItems(items.filter(item => item.id !== room.id));
      return true;
    }
    if (items.length >= limit) return false;
    setItems([...items, room]);
    return true;
  }, [items, limit]);

  const remove = useCallback(id => setItems(prev => prev.filter(item => item.id !== id)), []);

  return { items, has, toggle, remove };
}
