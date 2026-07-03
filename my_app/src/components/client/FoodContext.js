import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FoodContext = createContext();

export const useFoodContext = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFoodContext must be used within FoodProvider');
  }
  return context;
};

export const FoodProvider = ({ children }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ FIXED: Wrap in useCallback to prevent infinite loops
  const refreshFoodItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/get_foods', {
        method: 'GET',
        credentials: 'include',  // ✅ Include credentials for session
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setFoodItems(data);
        console.log("Food items refreshed:", data.length, "items");
        console.log("📋 Food items data:", data); 
      } else {
        console.error("Unexpected data format:", data);
        setFoodItems([]);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps since it doesn't depend on any props or state

  // ✅ FIXED: Wrap in useCallback
  const updateFoodQuantity = useCallback((foodId, newQuantity) => {
    setFoodItems(prevItems =>
      prevItems.map(item =>
        item._id === foodId
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      )
    );
  }, []); // Empty deps since it uses functional update

  // ✅ FIXED: Now refreshFoodItems won't cause infinite loops
  useEffect(() => {
    refreshFoodItems();
  }, [refreshFoodItems]);

  // ✅ FIXED: useMemo to prevent value object recreation on every render
  const value = React.useMemo(() => ({
    foodItems,
    loading,
    refreshFoodItems,
    updateFoodQuantity
  }), [foodItems, loading, refreshFoodItems, updateFoodQuantity]);

  return (
    <FoodContext.Provider value={value}>
      {children}
    </FoodContext.Provider>
  );
};