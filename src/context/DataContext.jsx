import { createContext, useContext, useState, useEffect } from 'react';
import * as mockData from '../data/mockData';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('satlink_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, _source: 'mock', _mode: 'demo' };
      } catch {
        return { ...mockData, _source: 'mock', _mode: 'demo' };
      }
    }
    return { ...mockData, _source: 'mock', _mode: 'demo' };
  });

  useEffect(() => {
    localStorage.setItem('satlink_data', JSON.stringify(data));
  }, [data]);

  const create = (collection, item) => {
    const idKey = Object.keys(item).find(k => k.includes('_id'));
    const newItem = { ...item };
    if (idKey && !newItem[idKey]) {
      newItem[idKey] = Date.now();
    }
    setData(prev => ({
      ...prev,
      [collection]: [...(prev[collection] || []), newItem]
    }));
    return newItem;
  };

  const update = (collection, idKey, id, updates) => {
    setData(prev => ({
      ...prev,
      [collection]: (prev[collection] || []).map(item => 
        item[idKey] == id ? { ...item, ...updates } : item
      )
    }));
  };

  const remove = (collection, idKey, id) => {
    setData(prev => ({
      ...prev,
      [collection]: (prev[collection] || []).filter(item => item[idKey] != id)
    }));
  };

  const getAll = (collection) => data[collection] || [];

  return (
    <DataContext.Provider value={{ data, create, update, remove, getAll, setData }}>
      {children}
    </DataContext.Provider>
  );
};
