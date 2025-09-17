import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Fetch food items from API
  const fetchFoodItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/get_foods", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setFoodItems(data);
        console.log("Food items refreshed:", data);
      } else {
        console.error("Unexpected data format:", data);
        setFoodItems([]);
      }
    } catch (err) {
      console.error("Failed to load food data:", err);
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Update individual food quantity in state
  const updateFoodQuantity = (foodId, newQuantity) => {
    setFoodItems(prevItems =>
      prevItems.map(item =>
        item._id === foodId
          ? { ...item, quantity: Math.max(0, newQuantity) }
          : item
      )
    );
  };

  const refreshFoodItems = () => {
    console.log("Refreshing food items...");
    fetchFoodItems();
  };

  useEffect(() => {
    fetchFoodItems();
    // Only run on mount
    // eslint-disable-next-line
  }, []);

  const value = {
    foodItems,
    loading,
    fetchFoodItems,
    updateFoodQuantity,
    refreshFoodItems
  };

  return (
    <FoodContext.Provider value={value}>
      {children}
    </FoodContext.Provider>
  );
};
