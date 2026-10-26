import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const collectionPath = (collection) => `/data/${encodeURIComponent(collection)}`;

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSnapshot = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError('');

    try {
      const snapshot = await apiClient.get('/data');
      setData(snapshot || {});
      return snapshot;
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Unable to load application data from the SATLINK backend.'
      );
      throw requestError;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot().catch(() => {
      // Error is exposed through the provider state.
    });
  }, [fetchSnapshot]);

  const refresh = () =>
    fetchSnapshot().catch(() => {
      // Error is exposed through the provider state.
    });

  const reloadAfterMutation = () =>
    fetchSnapshot(false).catch(() => {
      // The mutation succeeded; a refresh failure is shown in the error banner.
    });

  const create = async (collection, item) => {
    await apiClient.post(collectionPath(collection), item);
    await reloadAfterMutation();
  };

  const update = async (collection, _idKey, id, updates) => {
    await apiClient.put(
      `${collectionPath(collection)}/${encodeURIComponent(id)}`,
      updates
    );
    await reloadAfterMutation();
  };

  const remove = async (collection, _idKey, id) => {
    await apiClient.delete(
      `${collectionPath(collection)}/${encodeURIComponent(id)}`
    );
    await reloadAfterMutation();
  };

  const getAll = (collection) => data[collection] || [];

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        error,
        refresh,
        create,
        update,
        remove,
        getAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
