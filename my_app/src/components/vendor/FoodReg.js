import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from "react-bootstrap";
import VendorMenu from "./VendorMenu";

function FoodReg() {
  const [foodname, setFoodname] = useState("");
  const [type, setType] = useState("");
  const [desp, setDesp] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  // Format price input to always have 2 decimals
  const formatPrice = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? val : num.toFixed(2);
  };

  // Format price onBlur for better UX
  const handlePriceBlur = () => {
    setPrice(formatPrice(price));
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setResult("Please select an image file.");
      return;
    }

    setUploading(true);
    setResult("");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('foodname', foodname);
    formData.append('type', type);
    formData.append('desp', desp);
    formData.append('price', formatPrice(price)); // Format price before submit
    formData.append('quantity', quantity);

    try {
      const response = await fetch("/register_food", {
        method: "post",
        body: formData,
        credentials: 'include'  // ✅ ADD ONLY THIS LINE
      });

      const result = await response.json();
      console.log(result);

      if (result.success) {
        setResult("Food registered successfully!");
        setFoodname("");
        setType("");
        setDesp("");
        setPrice("");
        setQuantity("");
        setFile(null);
        setPreview(null);
        document.getElementById('file-input').value = '';
      } else {
        setResult(result.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setResult("Error registering food item. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <VendorMenu />
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body>
                <Card.Title className="text-center text-primary mb-4 fw-bold">
                  Food Registration
                </Card.Title>
                <Form onSubmit={handleOnSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Food Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={foodname}
                      onChange={(e) => setFoodname(e.target.value)}
                      placeholder="Enter food name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                    >
                      <option value="">Select food type</option>
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="egg">Egg</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Ingredients/Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={desp}
                      onChange={(e) => setDesp(e.target.value)}
                      placeholder="Enter ingredients or description"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Price (₹)</Form.Label>
                    <Form.Control
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      onBlur={handlePriceBlur}
                      placeholder="Enter price in Rs"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Available Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter available quantity"
                      required
                    />
                    <Form.Text className="text-muted">
                      Set to 0 to mark as unavailable
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Food Image</Form.Label>
                    <Form.Control
                      id="file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Please select an image file (JPG, PNG, GIF) - Max 5MB
                    </Form.Text>
                  </Form.Group>

                  {preview && (
                    <div className="mb-3 text-center">
                      <Image
                        src={preview}
                        alt="Preview"
                        style={{ maxWidth: "300px", maxHeight: "300px" }}
                        thumbnail
                      />
                    </div>
                  )}

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      className="rounded-pill"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Registering...
                        </>
                      ) : (
                        "Register Food Item"
                      )}
                    </Button>
                  </div>
                </Form>

                {result && (
                  <Alert
                    variant={result.includes("success") ? "success" : "danger"}
                    className="mt-4 text-center"
                  >
                    {result}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default FoodReg;
