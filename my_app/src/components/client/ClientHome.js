import { useEffect, useState } from "react";
import ClientMenu from "./ClientMenu";
import {
  Container,
  Form,
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Alert as BootstrapAlert,
  Badge,
} from "react-bootstrap";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useCart } from "./CartContext";
import { useFoodContext } from "./FoodContext";
import '../css/ClientHome.css';
import Loader from './Loader';

function ClientHome() {
  const [result, setResult] = useState("");
  const [foodname, setFoodname] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");

  const { addToCart, getItemQuantityInCart } = useCart();
  const { foodItems: fooditems, refreshFoodItems, updateFoodQuantity, loading } = useFoodContext();

  const [quickRecommendations, setQuickRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(false); // ✅ ADD THIS LINE

  const [orderHistoryCount, setOrderHistoryCount] = useState(0);

  useEffect(() => {
    refreshFoodItems();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setResult("");
    try {
      const res = await fetch("/get_foodname", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodname }),
      });
      const data = await res.json();
      if (!data || data.length === 0) {
        setResult("No matching food item found");
      }
    } catch (err) {
      console.error(err);
      setResult("Server error");
    }
  };


useEffect(() => {
  const fetchQuickRecommendations = async () => {
    try {
      setRecsLoading(true);
      
      console.log('🔍 Fetching quick recommendations...');
      
      const response = await fetch('/api/quick-recommendations', {
        method: 'GET',
        credentials: 'include',  // ✅ CRITICAL - Include session cookie
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ Recommendations fetch failed:', response.status);
        setShowRecommendations(false);
        return;
      }

      const data = await response.json();
      console.log('📊 Recommendations received:', data);

      // ✅ Only show recommendations if there are any
      if (Array.isArray(data) && data.length > 0) {
        setQuickRecommendations(data);
        setShowRecommendations(true);
        console.log('✅ Showing', data.length, 'recommendations');
      } else {
        setQuickRecommendations([]);
        setShowRecommendations(false);
        console.log('ℹ️ No recommendations available');
      }
    } catch (error) {
      console.error('❌ Error fetching quick recommendations:', error);
      setQuickRecommendations([]);
      setShowRecommendations(false);
    } finally {
      setRecsLoading(false);
    }
  };

  fetchQuickRecommendations();
}, []); // Empty dependency array - run once on mount


useEffect(() => {
  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('/show_orders', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const orders = await response.json();
        setOrderHistoryCount(orders.length);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  fetchOrderHistory();
}, []);




  // Filter foods by search, type, and category (using substring matching for category)
  const filteredItems = fooditems.filter((item) => {
    const searchLower = (foodname || "").toLowerCase().trim();
    const nameLower = (item.foodname || "").toLowerCase();
    const categoryLower = (item.category || "").toLowerCase();
    const selectedCategoryLower = (selectedCategory || "").toLowerCase();

    const matchesSearch =
      searchLower === "" ||
      nameLower.includes(searchLower) ||
      categoryLower.includes(searchLower);

    const matchesType = selectedType ? item.type === selectedType : true;

    let matchesCategory = true;
    if (selectedCategory) {
      if (selectedCategory === "beverage") {
        matchesCategory =
          categoryLower === "beverage" ||
          nameLower.includes("chai") ||
          nameLower.includes("coffee") ||
          nameLower.includes("milk");
      } else {
        matchesCategory =
          categoryLower.includes(selectedCategoryLower) ||
          nameLower.includes(selectedCategoryLower);
      }
    }

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleOpenDialog = (ingredients) => {
    setSelectedIngredients(ingredients);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const isItemAvailable = (item) => {
    const itemInCart = getItemQuantityInCart ? getItemQuantityInCart(item._id) : 0;
    const availableQuantity = item.quantity || 0;
    const enabled = item.status === "available";
    return enabled && availableQuantity > itemInCart;
  };

  const getRemainingQuantity = (item) => {
    const itemInCart = getItemQuantityInCart ? getItemQuantityInCart(item._id) : 0;
    const availableQuantity = item.quantity || 0;
    return Math.max(0, availableQuantity - itemInCart);
  };

  const handleAddToCart = async (item) => {
    try {
      if (!isItemAvailable(item)) {
        setSnackMsg(`${item.foodname} is out of stock or disabled!`);
        setSnackSeverity("error");
        setSnackOpen(true);
        return;
      }
      const response = await fetch("/addtocart", {
        method: "POST",
        credentials: 'include',  // ✅ THIS IS CRITICAL
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodname: item.foodname,
          des: item.des,
          price: item.price,
          type: item.type,
          image: item.image,
          quantity: 1,
          foodId: item._id,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        addToCart(item);
        updateFoodQuantity(item._id, item.quantity - 1);
        setSnackMsg(`${item.foodname} added to cart`);
        setSnackSeverity("success");
        setSnackOpen(true);
      } else {
        setSnackMsg(result.msg || "Failed to add item to cart");
        setSnackSeverity("error");
        setSnackOpen(true);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackMsg("Server error while adding to cart");
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

const handleManualRefresh = () => {
    refreshFoodItems();
    setSnackMsg("Food items refreshed successfully!");
    setSnackSeverity("success");
    setSnackOpen(true);
  };

  // Dynamic recommendation text based on order history
  let recommendationText;
  if (orderHistoryCount === 0) {
    recommendationText = "Trending right now"; // New users
  } else if (orderHistoryCount < 5) {
    recommendationText = "You might also like"; // Few orders
  } else {
    recommendationText = "Based on your order history"; // Regular customers
  }

  if (loading) {
    return <Loader />;
  }

  if (loading && fooditems.length === 0) {
    return (
      <>
        <ClientMenu />
        {/* Enhanced Background Elements */}
        <div className="client-home-bg-elements">
          <div className="client-home-bg-element-1"></div>
          <div className="client-home-bg-element-2"></div>
          <div className="client-home-bg-element-3"></div>
          <div className="client-home-bg-element-4"></div>
          <div className="client-home-bg-element-5"></div>
          <div className="client-home-bg-element-6"></div>
          <div className="client-home-bg-element-7"></div>
          <div className="client-home-bg-element-8"></div>
          <div className="client-home-bg-element-9"></div>
          <div className="client-home-bg-element-10"></div>
          <div className="client-home-bg-element-11"></div>
          <div className="client-home-bg-element-12"></div>
          <div className="client-home-bg-element-13"></div>
          <div className="client-home-bg-element-14"></div>
          <div className="client-home-bg-element-15"></div>
        </div>
        <Container className="mt-4 text-center">
          <h4>Loading food items...</h4>
        </Container>
      </>
    );
  }

  return (
    <>
      <ClientMenu />

      {/* Enhanced Background Elements */}
      <div className="client-home-bg-elements">
        <div className="client-home-bg-element-1"></div>
        <div className="client-home-bg-element-2"></div>
        <div className="client-home-bg-element-3"></div>
        <div className="client-home-bg-element-4"></div>
        <div className="client-home-bg-element-5"></div>
        <div className="client-home-bg-element-6"></div>
        <div className="client-home-bg-element-7"></div>
        <div className="client-home-bg-element-8"></div>
        <div className="client-home-bg-element-9"></div>
        <div className="client-home-bg-element-10"></div>
        <div className="client-home-bg-element-11"></div>
        <div className="client-home-bg-element-12"></div>
        <div className="client-home-bg-element-13"></div>
        <div className="client-home-bg-element-14"></div>
        <div className="client-home-bg-element-15"></div>
      </div>

      {/* Header with tight spacing */}
      <Container className="mt-3 pt-2">
        <div className="text-center nightmess-title-section">
          <h1 className="display-5 fw-bold mb-1">Welcome to NightMess</h1>
          <p className="lead text-muted">
            Satisfy your late-night cravings with our delicious comfort food
          </p>
        </div>
      </Container>
      {/* Add this right after the Welcome header */}
<Container className="mt-3">
  <Card 
    className="shadow-sm border-0 overflow-hidden"
    style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      cursor: 'pointer'
    }}
    // Change this line in ClientHome.jsx
onClick={() => window.location.href = '/client/mood-food'}  // ✅ CORRECT
  >
  </Card>
</Container>

      {/* Search and Filters with Clear Filters button */}
      <Container className="mt-1">
        <h2 className="text-center mb-3">Search Food Items</h2>
        <Form autoComplete="off" onSubmit={handleSearch}>
          <Row className="justify-content-center g-3 align-items-center mb-3">
            <Col xs={12} md={4}>
              <InputGroup className="shadow-sm mt-3">
                <Form.Control
                  type="text"
                  placeholder="Search for your favorite dish..."
                  value={foodname}
                  onChange={(e) => setFoodname(e.target.value)}
                  className="py-3"
                />
                <Button type="submit" variant="primary" className="px-4">
                  <i className="fas fa-search me-2"></i>
                  Search
                </Button>
              </InputGroup>
            </Col>

            <Col xs={6} md={2}>
              <Form.Select
                aria-label="Filter by Type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="py-3 shadow-sm"
              >
                <option value="">All Types</option>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
                <option value="egg">Egg</option>
              </Form.Select>
            </Col>

            <Col xs={6} md={3}>
              <Form.Select
                aria-label="Filter by Category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-3 shadow-sm"
              >
                <option value="">All Categories</option>
                <option value="beverage">Beverage</option>
                <option value="fried rice">Fried Rice</option>
                <option value="noodles">Noodles</option>
                <option value="pasta">Pasta</option>
                <option value="dosa">Dosa</option>
                <option value="uttapam">Uttapam</option>
                <option value="idli">Idli</option>
                <option value="omelete">Omelete</option>
                <option value="puff">Puff</option>
              </Form.Select>
            </Col>

            <Col xs={12} md={1} className="d-flex justify-content-center">
              <Button
                variant="outline-secondary"
                className="py-3 px-3"
                onClick={() => {
                  setFoodname("");
                  setSelectedType("");
                  setSelectedCategory("");
                  setResult("");
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Form>

        {result && (
          <Row className="justify-content-center mt-3">
            <Col md={6}>
              <BootstrapAlert variant="warning" className="text-center">{result}</BootstrapAlert>
            </Col>
          </Row>
        )}
      </Container>

      {showRecommendations && !recsLoading && quickRecommendations.length > 0 && !foodname && !selectedType && !selectedCategory && (
        <Container className="py-4 mt-4">
          <div className="mb-4">
            <h3 className="mb-1" style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              <i className="fas fa-star me-2" style={{ color: '#ff6b6b' }}></i>
              Recommended For You
            </h3>
            <p className="mb-0 text-muted" style={{
              fontSize: '14px',
              marginLeft: '14px'
            }}>
              {recommendationText}
            </p>
          </div>

          <Row className="g-3">
            {quickRecommendations.slice(0, 4).map((item) => {
              const remainingQty = getRemainingQuantity(item);
              const isAvailable = isItemAvailable(item);

              return (
                <Col xs={12} sm={6} md={4} lg={2} key={item._id}>
                  <Card
                    className="shadow-sm border-0 rounded-3 h-100 overflow-hidden"
                    style={{
                      transform: 'translateY(0)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div style={{ position: "relative", height: "90px", overflow: "hidden" }}>
                      <Card.Img
                        variant="top"
                        src={`${process.env.REACT_APP_API_URL||""}/public/images/${item.image}`}
                        alt={item.foodname}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease-in-out",
                          filter: !isAvailable ? "grayscale(50%)" : "none",
                        }}
                        onMouseOver={(e) => isAvailable && (e.currentTarget.style.transform = "scale(1.1)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />

                      {/* Stock Badge */}
                      {!isAvailable && (
                        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                          <Badge bg="danger" className="px-2 py-1" style={{ fontSize: '11px' }}>
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                      {isAvailable && remainingQty <= 5 && remainingQty > 0 && (
                        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                          <Badge bg="warning" className="px-2 py-1" style={{ fontSize: '11px' }}>
                            {remainingQty} left
                          </Badge>
                        </div>
                      )}

                      {/* Food Type Logo */}
                      <div style={{
                        position: "absolute",
                        top: "8px",
                        left: "10px",
                        background: 'white',
                        borderRadius: '4px',
                        padding: '1px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <img
                          src={
                            item.type === "veg"
                              ? "/veg.png"
                              : item.type === "non-veg"
                                ? "/nonveg.png"
                                : "/egg.jpg"
                          }
                          alt={item.type}
                          style={{
                            width: '18px',
                            height: '14px',
                            objectFit: 'contain',
                            display: 'block',
                            border: '1px', // thickness + solid border
                            borderColor:
                              item.type === "veg"
                                ? 'green'
                                : item.type === "non-veg"
                                  ? 'red'
                                  : 'gold', // yellow for egg
                          }}
                        />
                      </div>
                    </div>

                    <Card.Body className="d-flex flex-column justify-content-between p-2">
                      <div>
                        <Card.Title className="mb-2">
                          <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                            {item.foodname}
                          </span>
                        </Card.Title>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="w-100 mb-2"
                          style={{
                            padding: '6px',
                            fontSize: '13px',
                            borderRadius: '8px'
                          }}
                          onClick={() => handleOpenDialog(item.des)}
                        >
                          <i className="fas fa-list-ul me-1"></i>
                          Ingredients
                        </Button>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="fw-bold" style={{ fontSize: '16px', color: '#1a1a1a' }}>
                          ₹{item.price}
                        </div>
                        <Button
                          variant={isAvailable ? "dark" : "secondary"}
                          onClick={() => handleAddToCart(item)}
                          size="sm"
                          style={{
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: '600'
                          }}
                          disabled={!isAvailable}
                        >
                          {isAvailable ? (
                            <>
                              <i className="fas fa-cart-plus me-1"></i>
                              Add
                            </>
                          ) : (
                            "N/A"
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      )}

      {filteredItems.length > 0 && (
        <Container className="py-5">
          <Row className="g-4">
            {filteredItems.map((item) => {
              const remainingQty = getRemainingQuantity(item);
              const isAvailable = isItemAvailable(item);

              return (
                <Col md={6} lg={4} key={item._id}>
                  <Card
                    className={`shadow-lg border-0 rounded-4 h-100 overflow-hidden ${!isAvailable ? "opacity-75" : ""}`}
                  >
                    <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                      <Card.Img
                        variant="top"
                        src={`${process.env.REACT_APP_API_URL||""}/public/images/${item.image}`}
                        alt={item.foodname}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease-in-out",
                          filter: !isAvailable ? "grayscale(50%)" : "none",
                        }}
                        onMouseOver={(e) => isAvailable && (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      />
                      <div style={{ position: "absolute", top: "15px", right: "15px" }}>
                        {!isAvailable &&
                          <Badge bg="danger" className="px-3 py-2">Out of Stock</Badge>
                        }
                        {isAvailable && remainingQty <= 5 && remainingQty > 0 && (
                          <Badge bg="warning" className="px-3 py-2">Only {remainingQty} left</Badge>
                        )}
                      </div>
                      <div style={{ position: "absolute", top: "15px", left: "15px" }}>
                        <img
                          src={
                            item.type === "veg"
                              ? "/veg.png"
                              : item.type === "non-veg"
                                ? "/nonveg.png"
                                : "/egg.jpg"
                          }
                          alt={item.type}
                          className={`food-type-logo ${item.type === "veg"
                              ? "veg"
                              : item.type === "non-veg"
                                ? "nonveg"
                                : "egg"
                            }`}
                        />
                      </div>
                    </div>
                    <Card.Body className="d-flex flex-column justify-content-between p-4">
                      <div>
                        <Card.Title className="mb-3">
                          <span className="fw-bold text-dark fs-5">{item.foodname}</span>
                        </Card.Title>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="w-100 mb-3 py-2"
                          onClick={() => handleOpenDialog(item.des)}
                        >
                          <i className="fas fa-list-ul me-2"></i>
                          View Ingredients
                        </Button>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <div className="fw-bold fs-4">₹ {item.price}</div>
                        <Button
                          variant={isAvailable ? "primary" : "secondary"}
                          onClick={() => handleAddToCart(item)}
                          className="px-4 py-2"
                          disabled={!isAvailable}
                        >
                          {isAvailable ? (
                            <>
                              <i className="fas fa-cart-plus me-2"></i>
                              Add to Cart
                            </>
                          ) : (
                            "Out of Stock"
                          )}
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      )}

      {filteredItems.length === 0 && !loading && (
        <Container className="py-5">
          <div className="text-center">
            <div className="mb-4">
              <i className="fas fa-utensils fa-4x text-muted mb-3"></i>
            </div>
            <h4 className="mb-3">No food items available</h4>
            <p className="text-muted mb-4">
              Please try refreshing the page or check back later for delicious options.
            </p>
            <Button
              variant="primary"
              onClick={handleManualRefresh}
              className="px-4 py-2"
              disabled={loading}
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} me-2`}></i>
              {loading ? 'Refreshing...' : 'Refresh Items'}
            </Button>
          </div>
        </Container>
      )}

      {/* Ingredient Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '16px',
            padding: '8px',
          },
        }}
      >
        <DialogTitle className="text-center fw-bold">
          <i className="fas fa-leaf me-2 text-success"></i>
          Ingredients
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              borderRadius: "12px",
              padding: "20px",
              marginTop: "10px",
            }}
          >
            <p className="mb-0 text-dark">{selectedIngredients}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          sx={{ width: "100%", borderRadius: "12px", fontSize: "16px", fontWeight: 600 }}
          elevation={6}
          variant="filled"
        >
          {snackMsg}
        </MuiAlert>
      </Snackbar>
    </>
  );
}

export default ClientHome;