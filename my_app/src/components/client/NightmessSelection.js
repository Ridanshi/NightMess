import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Alert, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./NightmessSelection.css";

const NightmessSelection = () => {
  const [nightmesses, setNightmesses] = useState([]);
  const [filteredNightmesses, setFilteredNightmesses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentNightmessId, setCurrentNightmessId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHostelType, setSelectedHostelType] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const res = await axios.get("http://localhost:5000/isUser");
        if (res.data.usertype === 'vendor') {
          navigate("/vendor/vendorhome");
        } else if (res.data.usertype === 'admin') {
          navigate("/admin/adminhome");
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkUserType();
  }, [navigate]);

  useEffect(() => {
    fetchNightmesses();
    fetchCurrentNightmess();
  }, []);

  useEffect(() => {
    filterNightmesses();
  }, [nightmesses, searchQuery, selectedHostelType]);

  // Helper function to detect hostel type from address
  const detectHostelType = (address) => {
    if (!address) return null;
    const addressLower = address.toLowerCase();

    // Check for LH patterns
    if (addressLower.includes('lh') ||
      addressLower.includes('ladies hostel') ||
      addressLower.includes('girls hostel') ||
      addressLower.includes('ladies block') ||
      addressLower.includes('girls block')) {
      return 'lh';
    }

    // Check for MH patterns
    if (addressLower.includes('mh') ||
      addressLower.includes('mens hostel') ||
      addressLower.includes('boys hostel') ||
      addressLower.includes('men\'s hostel') ||
      addressLower.includes('mens block') ||
      addressLower.includes('boys block')) {
      return 'mh';
    }

    return null;
  };

  const fetchNightmesses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get_all_nightmesses");

      // Process each nightmess to add detected hostel type
      const processedData = res.data.map(nm => ({
        ...nm,
        detected_hostel_type: nm.hostel_type || detectHostelType(nm.vendor_address)
      }));

      setNightmesses(processedData);
      setLoading(false);
    } catch (err) {
      setError("Failed to load nightmess locations");
      setLoading(false);
    }
  };

  const fetchCurrentNightmess = async () => {
    try {
      const res = await axios.get("http://localhost:5000/get_selected_nightmess");
      if (res.data && res.data.nightmessId) {
        setCurrentNightmessId(res.data.nightmessId);
      }
    } catch (err) {
      console.log("No nightmess selected yet");
    }
  };

  const filterNightmesses = () => {
    let filtered = [...nightmesses];

    // Filter by detected hostel type
    if (selectedHostelType !== "all") {
      filtered = filtered.filter(nm => {
        const hostelType = nm.detected_hostel_type?.toLowerCase() || "";
        return hostelType === selectedHostelType.toLowerCase();
      });
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(nm =>
        nm.messname?.toLowerCase().includes(query) ||
        nm.vendor_address?.toLowerCase().includes(query)
      );
    }

    setFilteredNightmesses(filtered);
  };

  const selectNightmess = async (nightmessId, vendorEmail) => {
    try {
      await axios.post("http://localhost:5000/set_selected_nightmess", {
        nightmessId,
        vendorEmail,
      });

      setCurrentNightmessId(nightmessId);
      navigate("/client");
    } catch (err) {
      setError("Failed to select nightmess");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/logout");
      localStorage.clear();
      sessionStorage.clear();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login");
    }
  };

  const defaultNightmessImage = "/images/nm-project.jpg";

  const isCurrentMess = (nightmessId) => {
    return currentNightmessId === nightmessId;
  };

  const getHostelTypeStats = () => {
    const all = nightmesses.length;
    const lh = nightmesses.filter(nm => nm.detected_hostel_type?.toLowerCase() === "lh").length;
    const mh = nightmesses.filter(nm => nm.detected_hostel_type?.toLowerCase() === "mh").length;
    return { all, lh, mh };
  };

  const stats = getHostelTypeStats();
  const showHostelTypeFilter = stats.lh > 0 || stats.mh > 0;

  if (loading) {
    return (
      <>
        <div className="selection-bg"></div>
        <div className="login-bg-element-1"></div>
        <div className="login-bg-element-2"></div>
        <div className="login-bg-element-3"></div>
        <div className="login-bg-element-4"></div>
        <div className="login-bg-element-5"></div>
        <div className="login-bg-element-6"></div>
        <div className="login-bg-element-7"></div>
        <div className="login-bg-element-8"></div>
        <div className="login-bg-element-9"></div>
        <div className="login-bg-element-10"></div>

        <Container className="loading-container">
          <div className="loading-spinner"></div>
          <h3 className="loading-text">Loading nightmess locations...</h3>
        </Container>
      </>
    );
  }

  return (
    <>
      <div className="selection-bg"></div>

      <div className="login-bg-element-1"></div>
      <div className="login-bg-element-2"></div>
      <div className="login-bg-element-3"></div>
      <div className="login-bg-element-4"></div>
      <div className="login-bg-element-5"></div>
      <div className="login-bg-element-7"></div>
      <div className="login-bg-element-8"></div>
      <div className="login-bg-element-9"></div>
      <div className="login-bg-element-10"></div>

      {/* Logout Button */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
        <Button
          variant="outline-danger"
          onClick={handleLogout}
          style={{
            borderRadius: '12px',
            padding: '10px 20px',
            fontWeight: '600',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            transition: 'all 0.3s ease',
            fontFamily: 'Poppins, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.1)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.9)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </Button>
      </div>

      <Container className="selection-container" style={{ paddingTop: '40px' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Select Your NightMess
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Choose your block's nightmess to get started
          </p>
        </div>

        {/* Search Bar with Dropdown Filter */}
        <div style={{
          maxWidth: '700px',
          margin: '0 auto 40px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            flex: 1,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            overflow: 'visible'
          }}>
            <i className="bi bi-search" style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              color: '#f97316',
              zIndex: 2,
              pointerEvents: 'none'
            }}></i>
            <Form.Control
              type="text"
              placeholder="Search by mess name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '18px 60px 18px 55px',
                fontSize: '16px',
                border: '2px solid transparent',
                borderRadius: '16px',
                fontFamily: 'Poppins, sans-serif',
                background: 'white',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #f97316';
                e.target.style.boxShadow = '0 0 0 4px rgba(249, 115, 22, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid transparent';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#f97316',
                  border: 'none',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  zIndex: 3,
                  boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ea580c';
                  e.target.style.transform = 'translateY(-50%) scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f97316';
                  e.target.style.transform = 'translateY(-50%) scale(1)';
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Dropdown Filter - Only show if hostel types exist */}
          {showHostelTypeFilter && (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <Form.Select
                  value={selectedHostelType}
                  onChange={(e) => setSelectedHostelType(e.target.value)}
                  style={{
                    padding: '18px 45px 18px 20px',
                    fontSize: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '400',
                    color: '#64748b',
                    minWidth: '180px',
                    appearance: 'none',
                    backgroundImage: 'none',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    paddingRight: '45px'
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #cbd5e1';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid #e2e8f0';
                  }}
                >
                  <option value="all">All Hostels</option>
                  <option value="lh">Ladies Hostel</option>
                  <option value="mh">Mens Hostel</option>
                </Form.Select>
                <svg
                  style={{
                    position: 'absolute',
                    right: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '12px',
                    height: '12px',
                    pointerEvents: 'none'
                  }}
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2.5 4.5L6 8L9.5 4.5"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <i className="bi bi-chevron-down" style={{
                position: 'absolute',
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '14px',
                color: '#94a3b8',
                pointerEvents: 'none'
              }}></i>
            </div>
          )}
        </div>

        {error && (
          <Alert variant="danger" className="custom-alert alert-danger">
            {error}
          </Alert>
        )}

        {/* Results Count */}
        {(searchQuery || selectedHostelType !== "all") && (
          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
            color: '#64748b',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '15px',
            fontWeight: '500'
          }}>
            Showing {filteredNightmesses.length} of {nightmesses.length} nightmess{nightmesses.length !== 1 ? 'es' : ''}
          </div>
        )}

        {filteredNightmesses.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '64px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <i className="bi bi-search" style={{
              fontSize: '72px',
              color: '#e2e8f0',
              marginBottom: '20px',
              display: 'block'
            }}></i>
            <h4 style={{
              color: '#475569',
              marginBottom: '12px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              No nightmess found
            </h4>
            <p style={{
              color: '#94a3b8',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '16px'
            }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredNightmesses.map((nm) => (
              <Col key={nm._id}>
                <Card
                  className="nightmess-card h-100"
                  style={{
                    border: isCurrentMess(nm._id) ? '3px solid #f97316' : 'none',  // ORANGE
                    boxShadow: isCurrentMess(nm._id)
                      ? '0 8px 32px rgba(249, 115, 22, 0.25)'  // ORANGE SHADOW
                      : '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transform: isCurrentMess(nm._id) ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    background: 'white'
                  }}
                >
                  {/* NO BADGES - Clean card design */}
                  <div className="card-image-container" style={{
                    height: '200px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #fff7ed, #fed7aa)'
                  }}>
                    {nm.image_url ? (
                      <img
                        src={nm.image_url}
                        alt={nm.messname}
                        className="card-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 64px;">
                              🍽️
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <img
                        src={defaultNightmessImage}
                        alt={nm.messname}
                        className="card-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                  </div>

                  <div style={{ padding: '24px' }}>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '16px',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {nm.messname}
                    </h3>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: 'rgba(249, 115, 22, 0.08)',
                      borderRadius: '12px',
                      marginBottom: '20px'
                    }}>
                      <i className="bi bi-geo-alt-fill" style={{ color: '#f97316', fontSize: '16px' }}></i>
                      <span style={{
                        color: '#64748b',
                        fontSize: '14px',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: '500'
                      }}>
                        {nm.vendor_address}
                      </span>
                    </div>

                    <Button
                      className="w-100"
                      onClick={() => selectNightmess(nm._id, nm.vendor_email)}
                      style={{
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '14px',
                        fontSize: '16px',
                        fontWeight: '600',
                        fontFamily: 'Poppins, sans-serif',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 16px rgba(249, 115, 22, 0.3)'  // Always orange
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.4)';  // Always orange
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(249, 115, 22, 0.3)';  // Always orange
                      }}
                    >
                      {isCurrentMess(nm._id) ? (
                        <>
                          <i className="bi bi-check-circle-fill me-2"></i>
                          Currently Selected
                        </>
                      ) : (
                        <>
                          Select This Mess
                          <i className="bi bi-arrow-right ms-2"></i>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default NightmessSelection;