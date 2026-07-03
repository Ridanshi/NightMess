import React, { useState, useEffect, useRef } from 'react';
import API from 'axiosConfig';
import VendorMenu from "./VendorMenu";
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, InputGroup
} from 'react-bootstrap';

const formatType = (str) => {
  if (!str || typeof str !== 'string') return 'Unknown';
  if (str.toLowerCase() === 'non veg') return 'Non Veg';
  if (str.toLowerCase() === 'veg') return 'Veg';
  if (str.toLowerCase() === 'available') return 'Available';
  if (str.toLowerCase() === 'disabled') return 'Disabled';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const AvailableFood = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [quantityInputs, setQuantityInputs] = useState({});
  const [quantityUpdating, setQuantityUpdating] = useState({});
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackVariant, setFeedbackVariant] = useState('success');
  const feedbackTimeout = useRef(null);

  // Auto-dismiss success messages
  useEffect(() => {
    if (feedbackMsg && feedbackVariant === "success") {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => {
        setFeedbackMsg('');
      }, 2000);
    }
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, [feedbackMsg, feedbackVariant]);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/get_foods', { timeout: 5000 });
      setFoods(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Failed to load food items. Please check your connection and try again.');
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFoodStatus = async (foodItem, newStatus) => {
    setStatusUpdating(prev => ({ ...prev, [foodItem._id]: true }));
    try {
      const response = await API.post('/update_food_status', {
        foodId: foodItem._id,
        status: newStatus,
      });
      if (response.data.success) {
        setFoods(prevFoods =>
          prevFoods.map(food =>
            food._id === foodItem._id ? { ...food, status: newStatus } : food
          )
        );
        setFeedbackMsg("Status updated successfully.");
        setFeedbackVariant("success");
      } else {
        setFeedbackMsg(response.data.msg || 'Failed to update status');
        setFeedbackVariant("danger");
      }
    } catch (err) {
      setFeedbackMsg('Failed to update food status.');
      setFeedbackVariant("danger");
    } finally {
      setStatusUpdating(prev => ({ ...prev, [foodItem._id]: false }));
    }
  };

  // Only allow integers
  const handleQuantityChange = (foodId, value) => {
    if (/^\d*$/.test(value)) {
      setQuantityInputs(prev => ({ ...prev, [foodId]: value }));
    }
  };

  const updateFoodQuantity = async (foodItem) => {
    const newQuantity = parseInt(quantityInputs[foodItem._id], 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      setFeedbackMsg("Please enter a valid quantity (0 or more).");
      setFeedbackVariant("danger");
      return;
    }
    setQuantityUpdating(prev => ({ ...prev, [foodItem._id]: true }));
    try {
      const response = await API.post('/update_food_quantity', {
        foodId: foodItem._id,
        quantity: newQuantity,
      });
      if (response.data.success) {
        setFoods(prevFoods =>
          prevFoods.map(food =>
            food._id === foodItem._id
              ? { ...food, quantity: newQuantity }
              : food
          )
        );
        setFeedbackMsg("Quantity updated successfully.");
        setFeedbackVariant("success");
      } else {
        setFeedbackMsg(response.data.msg || "Failed to update quantity.");
        setFeedbackVariant("danger");
      }
    } catch (error) {
      setFeedbackMsg("Error updating quantity.");
      setFeedbackVariant("danger");
    } finally {
      setQuantityUpdating(prev => ({ ...prev, [foodItem._id]: false }));
    }
  };

  // Avoid duplicate types ('veg', 'non veg')
  const foodTypes = (() => {
    const dynamicTypes = foods
      .map(f => (typeof f.type === 'string' ? f.type.trim().toLowerCase() : null))
      .filter(type => type && !['veg', 'non veg'].includes(type));

    const set = new Set(['veg', 'non veg', ...dynamicTypes]);
    return ['all', ...Array.from(set)];
  })();

  const filteredFoods = foods.filter(food => {
    const name = typeof food.foodname === 'string' ? food.foodname : '';
    const des = typeof food.des === 'string' ? food.des : '';
    const type = typeof food.type === 'string' ? food.type : '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      des.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  // Always store quantity as string for input, but treat as number everywhere else
  useEffect(() => {
    const initialQuantities = {};
    foods.forEach(food => {
      initialQuantities[food._id] = food.quantity !== undefined ? String(food.quantity) : '0';
    });
    setQuantityInputs(initialQuantities);
  }, [foods]);

  return (
    <>
      <VendorMenu />
      {/* Sticky Alert using Bootstrap, always visible on scroll */}
      {feedbackMsg && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            zIndex: 1050,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <Alert
            variant={feedbackVariant}
            onClose={() => setFeedbackMsg('')}
            dismissible
            className="text-center"
            style={{
              minWidth: 300,
              maxWidth: 500,
              marginTop: '10px',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.13)',
              fontWeight: 500,
              pointerEvents: 'all',
              opacity: 0.97,
              transition: 'opacity 0.2s'
            }}
          >
            {feedbackMsg}
          </Alert>
        </div>
      )}

      <Container className="my-5">
        <h2 className="text-center mb-5">Available Food Items</h2>
        <Row className="mb-4">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Search food items..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              {foodTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Categories' : formatType(type)}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {filteredFoods.length === 0 ? (
          <Alert variant="info" className="text-center">
            No food items available matching your criteria.
          </Alert>
        ) : (
          <Row>
            {filteredFoods.map(food => (
              <Col key={food._id} lg={4} md={6} className="mb-4">
                <Card>
                  {food.image && (
                    <Card.Img
                      variant="top"
                      src={`/public/images/${food.image}`}
                      alt={food.foodname}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{food.foodname || 'Unknown'}</Card.Title>
                    <Card.Text>{food.des || 'No description'}</Card.Text>
                    <div className="mb-2">
                      <Badge bg="secondary" className="me-2">{formatType(food.type)}</Badge>
                      <Badge bg={food.status === 'available' ? 'success' : 'secondary'}>
                        {formatType(food.status)}
                      </Badge>
                      <Badge bg="info" className="ms-2">
                        {food.quantity || 0} left
                      </Badge>
                    </div>
                    {/* Quantity update input with type="text" (no arrows) */}
                    <InputGroup className="mt-3">
                      <Form.Control
                        type="text"
                        value={quantityInputs[food._id] || '0'}
                        onChange={e => handleQuantityChange(food._id, e.target.value)}
                        disabled={statusUpdating[food._id] || quantityUpdating[food._id]}
                      />
                      <Button
                        variant="primary"
                        onClick={() => updateFoodQuantity(food)}
                        disabled={
                          statusUpdating[food._id] || quantityUpdating[food._id] ||
                          isNaN(parseInt(quantityInputs[food._id], 10))
                        }
                      >
                        {quantityUpdating[food._id] ? <Spinner animation="border" size="sm" /> : 'Update'}
                      </Button>
                    </InputGroup>
                    <div className="mt-3 d-flex justify-content-between">
                      <Button
                        size="sm"
                        variant="success"
                        disabled={food.status === 'available' || statusUpdating[food._id]}
                        onClick={() => updateFoodStatus(food, 'available')}
                      >
                        {statusUpdating[food._id] && food.status !== 'available' ? (
                          <Spinner animation="border" size="sm" className="me-1" />
                        ) : null}
                        Enable
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={food.status === 'disabled' || statusUpdating[food._id]}
                        onClick={() => updateFoodStatus(food, 'disabled')}
                      >
                        {statusUpdating[food._id] && food.status !== 'disabled' ? (
                          <Spinner animation="border" size="sm" className="me-1" />
                        ) : null}
                        Disable
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default AvailableFood;
