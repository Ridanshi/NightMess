// src/components/VendorDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from 'axiosConfig';

function VendorDetail() {
  const { id } = useParams(); // get vendor id from url params
  const [vendor, setVendor] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendorAndFoods() {
      try {
        // Fetch vendor list and find selected vendor by id
        const vendorResponse = await API.get("/show_vendors");
        const foundVendor = vendorResponse.data.find(v => v._id === id);
        setVendor(foundVendor);

        if (foundVendor) {
          // Fetch foods for that vendor by email
          const foodsResponse = await API.post("/get_foods_by_vendor", {
            vendor_email: foundVendor.vendor_email,
          });
          setFoods(foodsResponse.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch vendor or foods", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVendorAndFoods();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!vendor) {
    return <p>Vendor not found.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>{vendor.messname}</h1>
      <p>Owner: {vendor.owner}</p>
      <p>Address: {vendor.vendor_address}</p>
      <p>Contact: {vendor.vendor_contact}</p>

      <h2>Foods Available:</h2>
      {foods.length === 0 ? (
        <p>No food items available.</p>
      ) : (
        <ul>
          {foods.map(food => (
            <li key={food._id}>
              {food.foodname} - Price: ₹{food.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VendorDetail;
