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
} from "react-bootstrap";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useCart } from "./CartContext";
import '../DarkTheme.css';

function ClientHome() {
  const [result, setResult] = useState("");
  const [foodname, setFoodname] = useState("");
  const [fooditems, setFooditems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [isDark, setIsDark] = useState(true);

  const { addToCart, cart } = useCart();

  useEffect(() => {
    const fetchAllFood = async () => {
      try {
        const res = await fetch("http://localhost:5000/get_foods");
        const data = await res.json();
        if (Array.isArray(data)) {
          setFooditems(data);
          console.log("Food items loaded:", data);
        } else {
          console.error("Unexpected data format:", data);
          setFooditems([]);
        }
      } catch (err) {
        console.error("Failed to load food data:", err);
        setResult("Failed to load food items.");
        setFooditems([]);
      }
    };

    fetchAllFood();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setResult("");
    try {
      const res = await fetch("http://localhost:5000/get_foodname", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
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

  const filteredItems = fooditems.filter((item) =>
    item.foodname.toLowerCase().includes(foodname.toLowerCase())
  );

  const handleOpenDialog = (ingredients) => {
    setSelectedIngredients(ingredients);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddToCart = (item) => {
    console.log("Adding item to cart:", item);
    console.log("Item ID:", item._id);
    console.log("Current cart before adding:", cart);
    
    addToCart(item);
    
    setSnackMsg(`${item.foodname} added to cart`);
    setSnackOpen(true);
    
    // Check cart after a delay
    setTimeout(() => {
      console.log("Cart after adding:", cart);
    }, 500);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <>
      <ClientMenu />

      <Container className="mt-4">
        <h2 className="text-center text-primary mb-4">Search Food Items</h2>
        
        <Form autoComplete="off" onSubmit={handleSearch}>
          <Row className="justify-content-center">
            <Col md={6}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search food..."
                  value={foodname}
                  onChange={(e) => setFoodname(e.target.value)}
                />
                <Button type="submit" variant="primary">
                  Search
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Form>

        {result && (
          <Row className="justify-content-center mt-3">
            <Col md={6}>
              <BootstrapAlert variant="warning" className="text-center">
                {result}
              </BootstrapAlert>
            </Col>
          </Row>
        )}
      </Container>

      {filteredItems.length > 0 && (
        <Container className="py-5">
          <Row className="g-4">
            {filteredItems.map((item) => (
              <Col md={6} lg={4} key={item._id}>
                <Card className="shadow-lg border-0 rounded-4 h-100 overflow-hidden">
                  <div
                    style={{
                      position: "relative",
                      height: "200px",
                      overflow: "hidden",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={`http://localhost:5000/public/images/${item.image}`}
                      alt={item.foodname}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease-in-out",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    />
                  </div>

                  <Card.Body className="d-flex flex-column justify-content-between p-3">
                    <div>
                      <Card.Title className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold text-dark">
                          {item.foodname}
                        </span>
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
                            width: item.type === "egg" ? "50px" : "30px",
                            height: item.type === "egg" ? "40px" : "22px",
                          }}
                        />
                      </Card.Title>

                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="w-100 mb-3"
                        onClick={() => handleOpenDialog(item.des)}
                      >
                        View Ingredients
                      </Button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div className="fw-bold fs-5">₹ {item.price}</div>
                      <Button
                        variant="primary"
                        onClick={() => handleAddToCart(item)}
                        className="px-3"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Ingredient Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Ingredients</DialogTitle>
        <DialogContent>
          <p>{selectedIngredients}</p>
        </DialogContent>
      </Dialog>

      {/* Snackbar for Add to Cart */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={() => setSnackOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
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