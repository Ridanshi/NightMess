// backendfolder/index.js
//Connect to mongodb using mongoose
require('dotenv').config();  // ✅ ADD THIS AS THE FIRST LINE

const mongoose = require('mongoose');
const Razorpay = require('razorpay');  // ✅ ADD
const crypto = require('crypto');       // ✅ ADD
mongoose.connect('mongodb://localhost:27017/', {
  dbName: 'nightMess',
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err => err ? console.log(err) :
  console.log('Connected to database successfully'));

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY
});

// ✅ TEMPORARY CHECK - Remove after testing
console.log('Razorpay Key ID:', process.env.RAZORPAY_ID_KEY);
console.log('Razorpay instance created:', !!razorpayInstance);


//Schema - define all the feilds to store data in database, It is also known as model
const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

const LoginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  usertype: {
    type: String,
    required: true,
  },
});

const VendorSchema = new mongoose.Schema({
  messname: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
  vendor_address: {
    type: String,
    required: true,
  },
  vendor_contact: {
    type: String,
    required: true,
  },
  vendor_email: {
    type: String,
    required: true,
    unique: true,
  },
})

const ClientSchema = new mongoose.Schema({

  clientname: {
    type: String,
    required: true,
  },
  client_contact: {
    type: String,
    required: true,
  },
  client_email: {
    type: String,
    required: true,
    unique: true
  },
  client_balance: {
    type: Number,
    default: 0,
  },
  last_selected_vendor: {  // ✅ ADD THIS
    type: String,
    default: null
  },
  last_selected_nightmess_id: {  // ✅ ADD THIS
    type: String,
    default: null
  },
  mess_wallets: [{
    vendor_email: {
      type: String,
      required: true
    },
    messname: {
      type: String,
      required: true
    },
    balance: {
      type: Number,
      default: 0
    }
  }]
})


const FoodSchema = new mongoose.Schema({

  foodname: {
    type: String,
    required: true,
  },
  des: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  vendor_email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },

  quantity: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'disabled'],
    default: 'available',
  },
})

const MoneySchema = new mongoose.Schema({
  balance: {
    type: Number,
    required: true,
  },
  clientname: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  email_user: {
    type: String,
    required: true,
  },
  email_vendor: {
    type: String,
  }
}, { timestamps: true })



const CartSchema = new mongoose.Schema({
  foodname: {
    type: String,
    required: true,
  },
  des: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  client_email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0
  },
  foodId: {  // Make sure this field exists
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fooddata',
    required: true
  }
}, { timestamps: true })

const orderSchema = new mongoose.Schema({
  foodname: String,
  price: String,
  quantity: Number,
  image: String,
  des: String,
  client_email: String,
  status: String,
  orderNumber: Number,
  estimatedTime: String,
  vendor_email: String,
  type: String,  // ✅ ADD THIS - veg/non-veg/egg   
  messname: String,        // ✅ ADD THIS
  vendor_address: String,  // ✅ ADD THIS      
}, { timestamps: true });

const RechargeRequestSchema = new mongoose.Schema({
  client_email: {
    type: String,
    required: true
  },
  clientname: {
    type: String,
    required: true
  },
  vendor_email: {
    type: String,
    required: true
  },
  messname: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

const RechargeRequest = mongoose.model('RechargeRequest', RechargeRequestSchema);
RechargeRequest.createIndexes();


const AdminData = mongoose.model('admindata', AdminSchema);
AdminData.createIndexes();
const LoginData = mongoose.model('logindata', LoginSchema);
LoginData.createIndexes();
const VendorData = mongoose.model('vendordata', VendorSchema);
VendorData.createIndexes();
const ClientData = mongoose.model('clientdata', ClientSchema);
ClientData.createIndexes();
const FoodData = mongoose.model('fooddata', FoodSchema);
FoodData.createIndexes();
const MoneyData = mongoose.model('moneydata', MoneySchema);
MoneyData.createIndexes();
const Cart = mongoose.model('Cart', CartSchema);
Cart.createIndexes();
const Order = mongoose.model('Order', orderSchema);
Order.createIndexes();


//create server
const express = require('express');
const session = require('express-session');
var cookieParser = require('cookie-parser');
const fs = require('fs');
const { spawn } = require('child_process');
const { Resend } = require('resend');
const resend = new Resend('re_9evQ2Ro8_LhPFU43pJyT94vodm694zZZ1');

const app = express();
const cors = require("cors");

// ✅ CRITICAL FIX: Configure CORS to allow credentials
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// ✅ CRITICAL FIX: Properly configure express-session
app.use(session({
  secret: '5cad5475e2fa2ac74fb96923f6fb8a9673cbdb3e8fca065f4cd03dd44888f32d',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',  // ✅ ADD THIS
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    path: '/' // ✅ ADD THIS LINE
  }
}));

console.log("service started at http://localhost:5000");


app.get("/debug_session", async (req, res) => {
  console.log("=== SESSION DEBUG ===");
  console.log("Session:", req.session);
  res.json({
    session: req.session,
    isLoggedIn: req.session.isLoggedIn || false
  });
});


app.post("/check_login", async (req, res) => {
    try {
        const em = req.body.email;
        const ps = req.body.password;
        console.log("Login attempt for:", em);
        
        const user = await LoginData.findOne({ email: em, password: ps });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session data
        req.session.email = em;
        req.session.usertype = user.usertype;
        req.session.isLoggedIn = true;

        // ✅ For clients, restore their last selected mess
        if (user.usertype === 'client') {
            const client = await ClientData.findOne({ client_email: em });
            
            if (client && client.last_selected_vendor) {
                // Restore last selected mess
                req.session.selectedVendorEmail = client.last_selected_vendor;
                req.session.selectedNightmessId = client.last_selected_nightmess_id;
            }
        }

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.status(500).json({ error: 'Session save failed' });
            }

            console.log("✅ Session saved for:", em);
            res.json({
                usertype: user.usertype,
                hasSelectedMess: !!req.session.selectedVendorEmail
            });
        });
    } catch (e) {
        console.log("Error: Problem");
        console.log(e);
        res.status(500).json({ error: 'server error' });
    }
});

app.get("/isUser", async (req, res) => {
  console.log("The session is: ", req.session);
  if (req.session.isLoggedIn) {
    res.json({
      usertype: req.session.usertype,
      email: req.session.email
    });
  }
  else {
    res.json({
      "usertype": "no user"
    });
  }
});

app.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.json({ msg: "error" });
    }
    res.json({ msg: "success" });
  });
});

app.post("/register_admin", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const nm = req.body.name;
    const adr = req.body.address;
    const mobile = req.body.contact;
    const em = req.body.email;
    const pass1 = req.body.password;
    const pass2 = req.body.cpassword;
    const utype = "admin";

    const ad1 = new AdminData({ name: nm, address: adr, contact: mobile, email: em });
    const lgn = new LoginData({ email: em, password: pass1, usertype: utype });

    let result = await ad1.save();
    let result1 = await lgn.save();

    result = result.toObject();
    if (result) {
      res.json(
        {
          "msg": "Data received and saved"
        }
      );
    }
    else {
      res.json(
        {
          "msg": "Unable to save data"
        }
      );
    }
  }
  catch (e) {
    console.log(e);
    res.json(
      {
        "msg": "Error"
      }
    );
  }
});

app.post("/register_client", async (req, resp) => {
  try {
    const { name, contact, email, password } = req.body;

    utype = "client"

    const existingClient = await ClientData.findOne({ client_email: email });

    if (existingClient) {
      return resp.json({
        data: "exists",
        msg: "Already registered",
      });
    }

    const newClient = new ClientData({ 
      clientname: name, 
      client_contact: contact, 
      client_email: email, 
      client_password: password,
      last_selected_vendor: null,           // ← ADD THIS
      last_selected_nightmess_id: null,     // ← ADD THIS
      mess_wallets: []                       // ← ADD THIS
    });
    const lgn = new LoginData({ email: email, password: password, usertype: utype });

    let result = await newClient.save();
    let result1 = await lgn.save();

    result = result.toObject();

    if (result) {
      resp.json({
        data: "success",
        msg: "Registered successfully",
      });
    }
    else {
      resp.json(
        {
          "msg": "Unable to save data"
        }
      );
    }

  } catch (e) {
    console.error(e);
    resp.json({
      data: "error",
      msg: "Cannot save client data",
    });
  }
});

//Save Vendor Data
app.post("/register_vendors", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const nm = req.body.messname;
    const own = req.body.owner;
    const adr = req.body.address;
    const mobile = req.body.contact;
    const em = req.body.email;
    const pass1 = req.body.password;
    const pass2 = req.body.cpassword;
    const utype = "vendor";

    const ad1 = new VendorData({ messname: nm, owner: own, vendor_address: adr, vendor_contact: mobile, vendor_email: em });
    // 'nm' is the variable that is locally declared, i.e. in try box. 'storename' is the variable that is being created in the medical schema.
    // In 'ShowMed' the variables used will of medical schema as they store the collection of data.
    const lgn = new LoginData({ email: em, password: pass1, usertype: utype });

    let result = await ad1.save();
    let result1 = await lgn.save();

    result = result.toObject();
    if (result) {
      res.json(
        {
          "msg": "Data received and saved"
        }
      );
    }
    else {
      res.json(
        {
          "msg": "Unable to save data"
        }
      );
    }
  }
  catch (e) {
    console.log(e);
    res.json(
      {
        "msg": "Error"
      }
    );
  }
});

app.get("/show_clients", async (req, resp) => {
  try {
    const client = await ClientData.find();

    resp.json(client);

  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: 'server error' });
  }
});


app.post("/get_wallet", async (req, res) => {
  try {
    console.log(req.session.email); // ✅ CHANGED
    if (req.session.isLoggedIn) { // ✅ CHANGED
      em = req.session.email; // ✅ CHANGED
      const data = req.body;
      console.log(data);
      const bl = req.body.balance;
      console.log(em, bl);

      const ad1 = new MoneyData({ client_balance: bl });

      let result = await ad1.save();
      result = result.toObject();
      console.log(result);
      if (result) {
        res.json({ "msg": "Data received and saved" });
      } else {
        res.json({ "msg": "Unable to save data" });
      }
    } else {
      res.json({
        data: 'Failed',
        msg: 'Login Error'
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ "msg": "Error" });
  }
});

// Fix 1: Serve static files from the correct directory
app.use('/public/images', express.static('public/Images')); // Note the capital 'I' in Images

const multer = require('multer');
const path = require("path");

// Fixed multer storage configuration
const store = multer.diskStorage({
  destination: function (req, file, cb) {
    // Make sure this directory exists
    cb(null, './public/Images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: store })

// Updated API endpoint to handle both form data and file upload
app.post("/register_food", upload.single("file"), async (req, res) => {
  try {
    console.log(req.session.email);
    if (req.session.isLoggedIn) {
      const em = req.session.email;
      const data = req.body;
      console.log(data);
      const nm = req.body.foodname;
      console.log(req.body.foodname);

      const d = req.body.desp;
      const qt = req.body.quantity;
      const up = req.body.price;
      const ty = req.body.type;

      // Handle the uploaded file - store only filename
      let imagePath = '';
      if (req.file) {
        imagePath = req.file.filename;
      }

      console.log(nm, d, up, ty, imagePath, qt);

      const ad1 = new FoodData({
        foodname: nm,
        des: d,
        price: up,
        type: ty,
        vendor_email: em,
        quantity: qt,
        image: imagePath
      });

      let result = await ad1.save();
      result = result.toObject();
      console.log(result);

      if (result) {
        res.json({ success: true, msg: "Data received and saved" });
      } else {
        res.json({ success: false, msg: "Unable to save data" });
      }
    } else {
      res.json({
        success: false,
        data: "Failed",
        msg: "Login Error"
      });
    }
  } catch (e) {
    console.log(e);
    res.json({ success: false, msg: "Error" });
  }
});


// Fix 3: Alternative endpoint that matches your frontend URL pattern
app.get("/public/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "public", "Images", filename);

  // Check if file exists
  const fs = require('fs');
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send({ "error": "Image not found" });
  }
});

app.post("/update_admin", async (req, resp) => {
  try {
    const nm = req.body.name;
    const adr = req.body.address;
    const mobile = req.body.contact;
    const em = req.body.email;
    const filter = { email: em };
    const update = { name: nm, address: adr, contact: mobile };

    const result = await AdminData.findOneAndUpdate(filter, update, { new: true });
    console.log(result);
    resp.json({
      data: 'success',
      msg: 'Data Saved Successfully'
    });
  } catch (e) {
    console.log(e);
    resp.json({
      data: 'error',
      msg: 'Cannot Save changes'
    });
  }
});

app.get("/show_vendors", async (req, resp) => {
  try {
    const vendor = await VendorData.find();
    console.log(vendor);
    resp.json(vendor);


  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: 'server error' });
  }
});

// ✅ NEW ENDPOINT: Get vendor by email (for admin delete/edit operations)
app.get("/get_vendor_by_email/:email", async (req, resp) => {
  try {
    if (req.session.isLoggedIn && req.session.usertype === 'admin') {  // ✅ Only admins can access
      const vendorEmail = req.params.email;
      
      const vendor = await VendorData.findOne({ vendor_email: vendorEmail });
      
      if (vendor) {
        resp.json(vendor);
      } else {
        resp.status(404).json({ error: 'Vendor not found' });
      }
    } else {
      resp.status(401).json({ error: 'Unauthorized - Admin access required' });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: 'server error' });
  }
});


app.post("/update_vendors", async (req, resp) => {
  try {
    // ✅ CHECK: Only admins can update vendors
    if (!req.session.isLoggedIn || req.session.usertype !== 'admin') {
      return resp.status(401).json({
        data: 'error',
        msg: 'Unauthorized - Admin access required'
      });
    }

    const snm = req.body.messname;
    const nm = req.body.owner;
    const adr = req.body.address;
    const mob = req.body.contact;
    const em = req.body.id; // This is the vendor_email
    
    // ✅ FIX: Use vendor_email, not email
    const filter = { vendor_email: em };  // ← FIXED!
    
    console.log("Update filter:", filter);
    console.log("Update data:", { messname: snm, owner: nm, address: adr, contact: mob });
    
    const update = { 
      messname: snm, 
      owner: nm, 
      vendor_address: adr, 
      vendor_contact: mob 
    };
    
    const result = await VendorData.findOneAndUpdate(filter, update, { new: true });
    
    if (result) {
      console.log("✅ Vendor updated:", result);
      resp.json({
        data: 'success',
        msg: 'Vendor updated successfully'
      });
    } else {
      console.log("❌ Vendor not found with email:", em);
      resp.status(404).json({
        data: 'error',
        msg: 'Vendor not found'
      });
    }
  } catch (e) {
    console.error("Error updating vendor:", e);
    resp.json({
      data: 'error',
      msg: 'Cannot save changes'
    });
  }
});

// ✅ UPDATED: Delete vendor endpoint with proper authentication
app.post("/delete_vendors", async (req, resp) => {
  try {
    if (req.session.isLoggedIn && req.session.usertype === 'admin') {  // ✅ Only admins
      const vendorEmail = req.body.id;  // id is the vendor email
      
      // Delete from VendorData
      const vendorResult = await VendorData.findOneAndDelete({ vendor_email: vendorEmail });
      
      if (!vendorResult) {
        return resp.status(404).json({
          data: 'error',
          msg: 'Vendor not found'
        });
      }
      
      // Also delete from LoginData
      await LoginData.findOneAndDelete({ email: vendorEmail });
      
      console.log(`Deleted vendor: ${vendorEmail}`);
      
      resp.json({
        data: 'success',
        msg: 'Vendor deleted successfully'
      });
    } else {
      resp.status(401).json({
        data: 'error',
        msg: 'Unauthorized - Admin access required'
      });
    }
  } catch (e) {
    console.log(e);
    resp.json({
      data: 'error',
      msg: 'Cannot delete vendor'
    });
  }
});



app.post("/change_pass", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const em = req.session.email
      const old = req.body.curr;
      const ps = req.body.pass;
      //const con=req.body.confirm;
      const filter = { email: em, password: old };

      const update = { password: ps };
      console.log(update);
      const result = await LoginData.findOneAndUpdate(filter, update, { new: true });
      console.log(result);
      resp.json({
        data: 'success',
        msg: 'Data Saved Successfully'
      });
    }
    else {
      resp.json({
        data: 'Failed',
        msg: 'Login To change'
      });
    }

  } catch (e) {
    console.log(e);
    resp.json({
      data: 'error',
      msg: 'Cannot save changes'
    });
  }
});


app.get("/get_admin", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {  // ✅ ADD CHECK
      const em = req.session.email; // ✅ ADD const
      const admin = await AdminData.findOne({ email: em });
      console.log("get_admin : ", admin);

      if (admin) {
        resp.json(admin);
      } else {
        resp.status(404).json({ data: 'error', msg: 'Admin not found' });
      }
    } else {
      resp.status(401).json({ data: 'error', msg: 'Not logged in' });
    }
  } catch (e) {
    console.log(e);
    resp.status(500).json({ data: 'error', msg: 'Cannot get admin' });
  }
});

app.post("/update_admin_profile", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const em = req.session.email
      const nm = req.body.name;
      const add = req.body.address;
      const cont = req.body.contact;
      //const con=req.body.confirm;
      const filter = { email: em };

      const update = { name: nm, address: add, contact: cont };
      console.log(update);
      const result = await AdminData.findOneAndUpdate(filter, update, { new: true });
      console.log(result);
      resp.json({
        data: 'success',
        msg: 'Data Saved Successfully'
      });
    }
    else {
      resp.json({
        data: 'Failed',
        msg: 'No changes made'
      });
    }

  } catch (e) {
    console.log(e);
    resp.json({
      data: 'error',
      msg: 'Cannot save changes'
    });
  }
});


app.get("/get_vendor", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {  // ✅ ADD CHECK
      const em = req.session.email; // ✅ ADD const
      const vendor = await VendorData.findOne({ vendor_email: em }); // ✅ FIX FIELD
      console.log("get_vendor : ", vendor);

      if (vendor) {
        resp.json(vendor);
      } else {
        resp.status(404).json({ data: 'error', msg: 'Vendor not found' });
      }
    } else {
      resp.status(401).json({ data: 'error', msg: 'Not logged in' });
    }
  } catch (e) {
    console.log(e);
    resp.status(500).json({ data: 'error', msg: 'Cannot get vendor' });
  }
});

// Ensure you have something like: const VendorData = require('./your_model_path');

app.post("/update_vendor_profile", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const em = req.session.email;
      const nm = req.body.messname;
      const ow = req.body.owner;
      const add = req.body.address;
      const cont = req.body.contact;

      // Make sure these field names MATCH your schema!
      const filter = { vendor_email: em }; // Fix: was { email: em }
      const update = {
        messname: nm,
        owner: ow,
        vendor_address: add,   // Fix: was just address
        vendor_contact: cont   // Fix: was just contact
      };

      console.log("Filter:", filter);
      console.log("Update:", update);

      const result = await VendorData.findOneAndUpdate(filter, update, { new: true });

      if (result) {
        resp.json({
          data: 'success',
          msg: 'Data Saved Successfully'
        });
      } else {
        resp.json({
          data: 'Failed',
          msg: 'Vendor not found, no changes made'
        });
      }
    } else {
      resp.json({
        data: 'Failed',
        msg: 'User not logged in, no changes made'
      });
    }
  } catch (e) {
    console.log(e);
    resp.json({
      data: 'error',
      msg: 'Cannot save changes'
    });
  }
});

app.get("/get_client", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const em = req.session.email;
      console.log("this is email in session", em);
      const client = await ClientData.findOne({ client_email: em });
      console.log("get_vendor : ", client);
      resp.json(client);
    }
    else {
      resp.json({
        data: 'error',
        msg: 'Login First'
      });
    }

  }
  catch (e) {
    console.log(e);
    resp.json({
      data: 'error',
      msg: 'Cannot get client'
    });
  }
});

app.post("/update_client_profile", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const em = req.session.email
      const nm = req.body.name;
      const cont = req.body.contact;
      const filter = { client_email: em };

      const update = { clientname: nm, client_contact: cont };
      console.log(update);
      const result = await ClientData.findOneAndUpdate(filter, update, { new: true });
      console.log(result);
      resp.json({
        data: 'success',
        msg: 'Data Saved Successfully'
      });
    }
    else {
      resp.json({
        data: 'Failed',
        msg: 'No changes made'
      });
    }

  } catch (e) {
    console.log(e);
    resp.json({
      data: 'error',
      msg: 'Cannot save changes'
    });
  }
});



// ✅ UPDATED - Replace your existing /client_by_email/:email endpoint
app.get("/client_by_email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const client = await ClientData.findOne({ client_email: email });

    if (!client) return res.status(404).json({ msg: "Client not found" });

    // ✅ If vendor is logged in, return mess-specific balance
    if (req.session.isLoggedIn && req.session.usertype === 'vendor') {
      const vendorEmail = req.session.email;
      
      const messWallet = client.mess_wallets?.find(
        w => w.vendor_email === vendorEmail
      );
      
      res.json({
        ...client.toObject(),
        client_balance: messWallet ? messWallet.balance : 0
      });
    } else {
      // ✅ FIX: For non-vendors (admin/client), calculate total balance across all mess wallets
      const totalBalance = client.mess_wallets?.reduce(
        (sum, wallet) => sum + (wallet.balance || 0), 
        0
      ) || 0;
      
      res.json({
        ...client.toObject(),
        client_balance: totalBalance  // ✅ Show total balance, not the deprecated field
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// app.post("/recharge_client", async (req, res) => {
//   if (req.session.isLoggedIn) {
//     const em = req.session.email;
//     try {
//       console.log("email from session", em);
//       console.log(req.body);
//       const { balance, type, clientname, email_user } = req.body;

//       const recharge = new MoneyData({
//         balance: balance,
//         clientname: clientname,
//         type: type,
//         email_user: email_user,
//         email_vendor: em,
//       });

//       // Find the client by email
//       const client = await ClientData.findOne({ client_email: email_user });

//       if (!client) {
//         return res.status(404).json({ status: "error", msg: "Client not found." });
//       }

//       let newBalance;

//       if (type === "credit") {
//         // Add balance
//         newBalance = client.client_balance + parseFloat(balance);
//       } else if (type === "debit") {
//         // Check for sufficient balance before subtracting
//         if (client.client_balance < parseFloat(balance)) {
//           return res.status(400).json({ status: "error", msg: "Insufficient client balance." });
//         }
//         newBalance = client.client_balance - parseFloat(balance);
//       } else {
//         return res.status(400).json({ status: "error", msg: "Invalid transaction type." });
//       }

//       // Update client balance in database
//       await ClientData.updateOne(
//         { client_email: email_user },
//         { $set: { client_balance: newBalance } }
//       );

//       // Save the recharge record
//       await recharge.save();

//       res.json({ status: "success", msg: "Recharge recorded successfully." });

//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ status: "error", msg: "Recharge failed." });
//     }
//   } else {
//     res.json({
//       data: 'Failed',
//       msg: 'Login Error'
//     });
//   }
// });



app.get('/get_foods', async (req, res) => {
  try {
    let query = {};

    // ✅ If vendor is logged in, show only their food items
    if (req.session.isLoggedIn && req.session.usertype === 'vendor') {
      query.vendor_email = req.session.email;
    }
    // If user has selected a nightmess, filter by that vendor
    else if (req.session.selectedVendorEmail) {
      query.vendor_email = req.session.selectedVendorEmail;
    }

    const foods = await FoodData.find(query);
    console.log(`Found ${foods.length} foods for vendor`);
    res.json(foods);
  } catch (err) {
    console.error("Error in /get_foods route:", err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});



app.post("/get_foodname", async (req, res) => {
  try {
    const foods = await FoodData.find();
    res.json(foods);
  } catch (err) {
    console.error("Error fetching food:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Book Order Route
app.post('/api/book', async (req, res) => {
  const { email, cartItems, total } = req.body;

  const client = await Client.findOne({ client_email: email });
  if (!client) return res.status(404).send('User not found');

  if (client.client_balance < total) {
    return res.status(400).send('Insufficient balance');
  }

  // Update client balance
  client.client_balance -= total;
  await client.save();

  // Log money transaction
  await Money.create({
    balance: total,
    clientname: client.clientname,
    type: 'debit',
    email_user: email,
    email_vendor: email
  });

  res.send({ success: true });
});


app.post("/addtocart", async (req, res) => {
  if (req.session.isLoggedIn) {
    const client_email = req.session.email;

    try {
      const {
        foodname,
        des,
        price,
        type,
        image,
        quantity = 1,    // Make sure front-end sends correct quantity!
        foodId,
      } = req.body;

      if (!client_email) {
        return res.status(400).json({ success: false, msg: "Client not logged in" });
      }

      if (!foodId) {
        return res.status(400).json({ success: false, msg: "Food ID is required" });
      }

      // Fetch food item from database
      const foodItem = await FoodData.findById(foodId);
      if (!foodItem) {
        return res.status(404).json({ success: false, msg: "Food item not found" });
      }

      // Check if there's enough stock
      if (foodItem.quantity < quantity) {
        return res.status(400).json({ success: false, msg: `Only ${foodItem.quantity} items left in stock` });
      }

      // Find any cart item for this food/user
      const existingCartItem = await Cart.findOne({
        client_email: client_email,
        foodId: foodId,
      });

      if (existingCartItem) {
        // Check if enough backend stock to add desired quantity
        if (foodItem.quantity < quantity) {
          return res.status(400).json({
            success: false,
            msg: "Not enough stock for requested quantity."
          });
        }

        // Increment existing cart item quantity by requested amount
        existingCartItem.quantity += quantity;
        await existingCartItem.save();

        // Subtract requested quantity from backend stock
        foodItem.quantity -= quantity;
        await foodItem.save();

        return res.json({
          success: true,
          msg: "Cart updated successfully",
        });
      } else {
        // New cart item, reserve requested quantity
        if (foodItem.quantity < quantity) {
          return res.status(400).json({
            success: false,
            msg: "Not enough stock for requested quantity.",
          });
        }

        const cartItem = new Cart({
          foodname,
          des,
          price,
          type,
          image,
          quantity: quantity,
          client_email,
          foodId,
        });

        await cartItem.save();

        // Subtract requested quantity from backend stock
        foodItem.quantity -= quantity;
        await foodItem.save();

        return res.status(200).json({
          success: true,
          msg: "Item added to cart",
        });
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      res.status(500).json({ success: false, msg: "Internal server error" });
    }
  } else {
    res.json({
      success: false,
      data: "Failed",
      msg: "Login To Add into Cart",
    });
  }
});



app.get("/show_cartdata", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const em = req.session.email;
      const carts = await Cart.find({ client_email: em });
      console.log(carts);
      resp.json(carts);
    }
    else {
      resp.json({
        data: 'Failed',
        msg: 'Login First to See Data'
      });
    }


  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: 'server error' });
  }
});


app.put("/update_cart_quantity", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const { id, quantity } = req.body;

      if (quantity < 1) {
        return resp.status(400).json({ success: false, msg: "Quantity must be at least 1" });
      }

      // Find cart item by id
      const cartItem = await Cart.findById(id);
      if (!cartItem) {
        return resp.status(404).json({ success: false, msg: "Cart item not found" });
      }

      // Find related food item
      const foodItem = await FoodData.findById(cartItem.foodId);
      if (!foodItem) {
        return resp.status(404).json({ success: false, msg: "Food item not found" });
      }

      // Calculate difference between new and old quantities
      const qtyDiff = quantity - cartItem.quantity;

      if (qtyDiff > 0) {
        // When increasing quantity, check availability
        if (foodItem.quantity < qtyDiff) {
          return resp.status(400).json({ success: false, msg: `Only ${foodItem.quantity} items left in stock` });
        }

        // Decrement stock by difference
        foodItem.quantity -= qtyDiff;
      } else if (qtyDiff < 0) {
        // When decreasing quantity, add difference back to stock
        foodItem.quantity += Math.abs(qtyDiff);
      }
      await foodItem.save();

      // Update cart quantity
      cartItem.quantity = quantity;
      await cartItem.save();

      resp.json({ success: true, msg: "Quantity updated" });
    } else {
      resp.json({ data: "Failed", msg: "Login First to Update Quantity" });
    }
  } catch (err) {
    console.error(err);
    resp.status(500).json({ error: "server error" });
  }
});


app.delete("/remove_from_cart/:id", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const id = req.params.id;

      await Cart.deleteOne({ _id: id, client_email: req.session.email });

      resp.json({ msg: "Item removed from cart" });
    } else {
      resp.json({ data: "Failed", msg: "Login First to Remove Item" });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "server error" });
  }
});


app.delete("/clear_cart", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      await Cart.deleteMany({ client_email: req.session.email });

      resp.json({ msg: "Cart cleared" });
    } else {
      resp.json({ data: "Failed", msg: "Login First to Clear Cart" });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "server error" });
  }
});


app.post("/confirm_order", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const clientEmail = req.session.email;
      const selectedVendorEmail = req.session.selectedVendorEmail;

      const client = await ClientData.findOne({ client_email: clientEmail });
      if (!client) {
        return resp.status(404).json({ msg: "Client not found" });
      }

      const vendor = await VendorData.findOne({ vendor_email: selectedVendorEmail });
      if (!vendor) {
        return resp.status(404).json({ msg: "Vendor not found" });
      }

      const cartItems = await Cart.find({ client_email: clientEmail });
      if (cartItems.length === 0) {
        return resp.status(400).json({ msg: "Cart is empty" });
      }

      let totalAmount = 0;
      cartItems.forEach(item => {
        totalAmount += item.quantity * parseFloat(item.price);
      });

      // ✅ Find wallet for THIS mess
      const messWallet = client.mess_wallets?.find(
        w => w.vendor_email === selectedVendorEmail
      );

      if (!messWallet || messWallet.balance < totalAmount) {
        return resp.json({
          data: "Failed",
          msg: `Insufficient balance in ${vendor.messname} wallet. Available: ₹${messWallet ? messWallet.balance : 0}`,
        });
      }

      // Place orders
      for (let item of cartItems) {
        const order = new Order({
          foodname: item.foodname,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          client_email: item.client_email,
          des: item.des,
          type: item.type,
          vendor_email: selectedVendorEmail,
          messname: vendor.messname,
          vendor_address: vendor.vendor_address,
          status: "Pending",
        });
        await order.save();
      }

      // ✅ Deduct from mess-specific wallet
      messWallet.balance -= totalAmount;
      await client.save();

      await Cart.deleteMany({ client_email: clientEmail });

      return resp.json({ msg: "Order confirmed" });
    } else {
      return resp.json({ data: "Failed", msg: "Login First to Place Order" });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "Server error" });
  }
});



app.get("/show_orders", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const orders = await Order.find({ client_email: req.session.email });
      resp.json(orders);
    } else {
      resp.json({
        data: "Failed",
        msg: "Login First to View Orders",
      });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "server error" });
  }
});

app.get("/client_balance", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const client = await ClientData.findOne({ client_email: req.session.email });
      
      // Get selected vendor/mess
      let messname = '';
      let balance = 0;
      
      if (req.session.selectedVendorEmail) {
        const vendor = await VendorData.findOne({ vendor_email: req.session.selectedVendorEmail });
        if (vendor) {
          messname = vendor.messname;
          
          // ✅ Find wallet for THIS mess
          const messWallet = client.mess_wallets?.find(
            w => w.vendor_email === req.session.selectedVendorEmail
          );
          
          balance = messWallet ? messWallet.balance : 0;
        }
      }
      
      resp.json({ 
        balance: balance,
        messname: messname
      });
    } else {
      resp.json({ data: "Failed", msg: "Login First to See Balance" });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "server error" });
  }
});


app.get("/cart_count", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const clientEmail = req.session.email;
      const selectedVendorEmail = req.session.selectedVendorEmail;

      if (!selectedVendorEmail) {
        // No mess selected, return 0
        return resp.json({ total: 0 });
      }

      // Get all cart items for this user
      const items = await Cart.find({ client_email: clientEmail });

      // Get food details to filter by vendor
      let totalItems = 0;
      
      for (const item of items) {
        try {
          const foodItem = await FoodData.findById(item.foodId);
          
          // Only count if item is from the selected mess
          if (foodItem && foodItem.vendor_email === selectedVendorEmail) {
            totalItems += item.quantity;
          }
        } catch (err) {
          console.error("Error fetching food item:", err);
        }
      }

      resp.json({ total: totalItems });
    } else {
      resp.json({ data: "Failed", msg: "Login First to See Cart" });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "server error" });
  }
});





app.get("/show_orders_vendor", async (req, resp) => {
  try {
    if (req.session.isLoggedIn && req.session.usertype === 'vendor') {
      const vendorEmail = req.session.email;

      // ✅ SIMPLE: Just filter by vendor_email
      const orders = await Order.find({
        vendor_email: vendorEmail
      }).sort({ createdAt: -1 });

      console.log(`Found ${orders.length} orders for vendor ${vendorEmail}`);
      resp.json(orders);
    } else {
      resp.status(401).json({
        data: "Failed",
        msg: "Login First to View Orders",
      });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "server error" });
  }
});


// CONFIRM ORDER STATUS - Proper daily orderNumber assignment
// CONFIRM ORDER STATUS - Proper daily orderNumber assignment PER MESS
app.put('/confirm_order_status', async (req, res) => {
  try {
    const orderId = req.body.id;
    if (!orderId) {
      return res.status(400).send({ success: false, msg: "Order ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).send({ success: false, msg: "Invalid Order ID" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ success: false, msg: "Order not found" });
    }

    const vendorEmail = order.vendor_email;

    // If order is being confirmed for first time
    if (!order.orderNumber) {
      const createdAt = order.createdAt || new Date();

      const year = createdAt.getFullYear();
      const month = String(createdAt.getMonth() + 1).padStart(2, "0");
      const day = String(createdAt.getDate()).padStart(2, "0");
      const dateStart = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      const dateEnd = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

      const ordersForDay = await Order.find({
        vendor_email: vendorEmail,
        status: { $in: ["Confirmed", "Ready"] },
        createdAt: { $gte: dateStart, $lte: dateEnd }
      });

      const sortedOrders = ordersForDay.sort((a, b) => {
        const tA = new Date(a.updatedAt || a.createdAt);
        const tB = new Date(b.updatedAt || b.createdAt);
        return tA - tB;
      });

      const index = sortedOrders.findIndex(o => o._id.equals(order._id));

      if (index !== -1) {
        order.orderNumber = index + 1;
      } else {
        order.orderNumber = sortedOrders.length + 1;
      }
    }

    order.status = "Confirmed";
    
    // ✅ NEW: Set estimated time if provided
    if (req.body.estimatedTime) {
      order.estimatedTime = req.body.estimatedTime;
    }
    
    await order.save();

    // ✅ NEW: Send email notification for order acceptance
    const messName = order.messname || 'Night Mess';
    const messAddress = order.vendor_address || 'Pickup counter';
    const estimatedTime = order.estimatedTime || 'shortly';

    try {
      await resend.emails.send({
        from: 'Nightmess <onboarding@resend.dev>',
        to: order.client_email,
        subject: `Order Accepted - ${order.foodname}`,
        text: `Hi!

Your order has been accepted and is being prepared.

Order Details:
Item: ${order.foodname}
Quantity: ${order.quantity}
Total: ₹${parseFloat(order.price) * order.quantity}
${order.estimatedTime ? `Estimated Time: ${order.estimatedTime} minutes` : ''}

Restaurant:
${messName}
${messAddress}

We'll notify you when your order is ready for pickup.

Thanks,
nightMess Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
              .status-badge { 
                display: inline-block;
                padding: 8px 16px;
                background: #ffc107;
                color: #000;
                border-radius: 5px;
                font-weight: bold;
                margin: 15px 0;
              }
              .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
              .detail-line { margin: 8px 0; }
              .restaurant-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196f3; }
              .restaurant-title { font-weight: bold; color: #1976d2; margin-bottom: 8px; }
              .footer { margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">Hi!</div>
              <p>Your order has been accepted and is being prepared.</p>
              
              <div class="status-badge">✓ Order Accepted</div>
              
              <div class="details">
                <div class="detail-line"><strong>Item:</strong> ${order.foodname}</div>
                <div class="detail-line"><strong>Quantity:</strong> ${order.quantity}</div>
                <div class="detail-line"><strong>Total:</strong> ₹${parseFloat(order.price) * order.quantity}</div>
                ${order.estimatedTime ? `<div class="detail-line"><strong>⏱️ Estimated Time:</strong> ${order.estimatedTime} minutes</div>` : ''}
              </div>
              
              <div class="restaurant-info">
                <div class="restaurant-title">🏪 Mess:</div>
                <div><strong>${messName}</strong></div>
                <div>📍 ${messAddress}</div>
              </div>
              
              <p style="margin-top: 20px;">We'll notify you when your order is ready for pickup.</p>
              
              <div class="footer">
                Thanks,<br>
                nightMess Team
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Order acceptance email sent to ${order.client_email}`);
    } catch (emailError) {
      console.error('❌ Email error:', emailError);
      // Don't fail the whole request if email fails
    }

    res.send({ success: true, order });
  } catch (error) {
    console.error("Error in /confirm_order_status:", error);
    res.status(500).send({ success: false, msg: "Error confirming order" });
  }
});



app.get("/get_cart", async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      const cartItems = await Cart.find({ client_email: req.session.email });
      res.json(cartItems);
    } else {
      res.status(401).json({ msg: "Please login first" });
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

app.get("/get_cart_quantity/:foodId", async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.json({ quantity: 0 });
    }

    const cartItem = await Cart.findOne({
      client_email: req.session.email,
      foodId: req.params.foodId
    });

    res.json({
      quantity: cartItem ? cartItem.quantity : 0
    });

  } catch (error) {
    console.error("Error getting cart quantity:", error);
    res.json({ quantity: 0 });
  }
});


app.put('/reject_order_status', async (req, res) => {
  const { id } = req.body;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === "Rejected") {
      return res.status(400).json({ message: 'Order is already rejected' });
    }
    if (order.status === "Confirmed") {
      return res.status(400).json({ message: 'Confirmed order cannot be rejected' });
    }

    // Update order status to Rejected
    order.status = 'Rejected';
    await order.save();

    // Find the client who placed the order
    const client = await ClientData.findOne({ client_email: order.client_email });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Calculate refund amount
    const refundAmount = parseFloat(order.price) * order.quantity;

    // ✅ Refund to mess-specific wallet
    const vendorEmail = order.vendor_email;
    
    if (!client.mess_wallets) {
      client.mess_wallets = [];
    }

    let messWallet = client.mess_wallets.find(
      w => w.vendor_email === vendorEmail
    );
    
    if (!messWallet) {
      // Get vendor details for wallet creation
      const vendor = await VendorData.findOne({ vendor_email: vendorEmail });
      messWallet = {
        vendor_email: vendorEmail,
        messname: vendor ? vendor.messname : 'Unknown Mess',
        balance: refundAmount
      };
      client.mess_wallets.push(messWallet);
    } else {
      messWallet.balance += refundAmount;
    }

    await client.save();

    // ✅ NEW: Send email notification for order rejection
    const messName = order.messname || 'Night Mess';
    const messAddress = order.vendor_address || 'Address not available';

    try {
      await resend.emails.send({
        from: 'Nightmess <onboarding@resend.dev>',
        to: order.client_email,
        subject: `Order Rejected - ${order.foodname}`,
        text: `Hi!

We're sorry, but your order could not be fulfilled and has been rejected.

Order Details:
Item: ${order.foodname}
Quantity: ${order.quantity}
Amount: ₹${refundAmount}

The full amount of ₹${refundAmount} has been refunded to your ${messName} wallet.

Restaurant:
${messName}
${messAddress}

We apologize for any inconvenience. Please feel free to place a new order.

Thanks,
nightMess Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
              .status-badge { 
                display: inline-block;
                padding: 8px 16px;
                background: #dc3545;
                color: #fff;
                border-radius: 5px;
                font-weight: bold;
                margin: 15px 0;
              }
              .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
              .detail-line { margin: 8px 0; }
              .refund-info { 
                background: #d4edda; 
                padding: 15px; 
                border-radius: 5px; 
                margin: 15px 0; 
                border-left: 4px solid #28a745; 
              }
              .refund-title { font-weight: bold; color: #155724; margin-bottom: 8px; }
              .restaurant-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
              .footer { margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">Hi!</div>
              <p>We're sorry, but your order could not be fulfilled and has been rejected.</p>
              
              <div class="status-badge">✗ Order Rejected</div>
              
              <div class="details">
                <div class="detail-line"><strong>Item:</strong> ${order.foodname}</div>
                <div class="detail-line"><strong>Quantity:</strong> ${order.quantity}</div>
                <div class="detail-line"><strong>Amount:</strong> ₹${refundAmount}</div>
              </div>
              
              <div class="refund-info">
                <div class="refund-title">💰 Refund Processed</div>
                <div>The full amount of <strong>₹${refundAmount}</strong> has been refunded to your <strong>${messName}</strong> wallet.</div>
              </div>
              
              <div class="restaurant-info">
                <div><strong>${messName}</strong></div>
                <div>📍 ${messAddress}</div>
              </div>
              
              <p style="margin-top: 20px;">We apologize for any inconvenience. Please feel free to place a new order.</p>
              
              <div class="footer">
                Thanks,<br>
                nightMess Team
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Order rejection email sent to ${order.client_email} - Refund: ₹${refundAmount}`);
    } catch (emailError) {
      console.error('❌ Email error:', emailError);
      // Don't fail the whole request if email fails
    }

    res.json({ 
      message: 'Order rejected and amount refunded successfully',
      refundAmount: refundAmount
    });
  } catch (error) {
    console.error('Error rejecting order and refunding:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/update_food_status', async (req, res) => {
  const { foodId, status } = req.body;
  if (!foodId || !status) {
    return res.json({ success: false, msg: "foodId or status missing" });
  }
  try {
    const updated = await FoodData.findByIdAndUpdate(
      foodId,
      { status },
      { new: true }
    );
    if (updated) {
      res.json({ success: true });
    } else {
      res.json({ success: false, msg: "Food item not found" });
    }
  } catch (err) {
    res.json({ success: false, msg: "Update failed" });
  }
});


// POST /update_food_quantity
app.post('/update_food_quantity', async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const qtyNum = Number(quantity);

    if (!foodId || isNaN(qtyNum) || qtyNum < 0) {
      return res.json({ success: false, msg: 'Invalid foodId or quantity' });
    }

    const updatedFood = await FoodData.findByIdAndUpdate(
      foodId,
      { quantity: qtyNum },
      { new: true }
    );

    if (updatedFood) {
      return res.json({ success: true, msg: 'Quantity updated successfully', data: updatedFood });
    } else {
      return res.json({ success: false, msg: 'Food item not found' });
    }
  } catch (error) {
    console.error('Error in /update_food_quantity:', error);
    res.status(500).json({ success: false, msg: 'Server error while updating quantity' });
  }
});



// Fix: Register on the Express app, not some router!
app.post('/set_order_time', async (req, res) => {
  try {
    const { orderId, time } = req.body;
    if (!orderId || !time) return res.status(400).send({ success: false, msg: "Missing orderId or time" });
    const order = await Order.findByIdAndUpdate(orderId, { estimatedTime: time }, { new: true });
    res.send({ success: true, order });
  } catch (err) {
    console.error("Error in /set_order_time:", err);
    res.status(500).send({ success: false, msg: "Failed to set order time" });
  }
});


// app.post('/mark_ready', async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     if (!orderId) return res.status(400).send({ success: false, msg: "Missing orderId" });
//     await Order.findByIdAndUpdate(orderId, { status: "Ready" });
//     res.send({ success: true, msg: "Order marked as ready" });
//   } catch (err) {
//     console.error("Error in /mark_ready:", err);
//     res.status(500).send({ success: false, msg: "Failed to mark ready" });
//   }
// });

const calculateDisplayOrderNumber = (allOrders, targetOrder, formatLocalDate) => {
  // Get the date for this order
  const orderDateStr = targetOrder.createdAt
    ? formatLocalDate(targetOrder.createdAt)
    : formatLocalDate(new Date(parseInt(targetOrder._id.substring(0, 8), 16) * 1000));

  // Filter orders for the same date
  const ordersForDate = allOrders.filter(o => {
    const oDateStr = o.createdAt
      ? formatLocalDate(o.createdAt)
      : formatLocalDate(new Date(parseInt(o._id.substring(0, 8), 16) * 1000));
    return oDateStr === orderDateStr;
  });

  // Only include confirmed or ready orders
  const confirmedOrReady = ordersForDate.filter(
    o => o.status === "Confirmed" || o.status === "Ready"
  );

  // Sort by approval timestamp (updatedAt or createdAt) - ASCENDING
  const sortedOrders = confirmedOrReady.sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt);
    const timeB = new Date(b.updatedAt || b.createdAt);
    return timeA - timeB; // Ascending
  });

  // Find the index of our order in the sorted list
  const index = sortedOrders.findIndex(o => o._id.toString() === targetOrder._id.toString());

  return index >= 0 ? index + 1 : null;
};

app.post('/mark_ready', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).send({ success: false, msg: "Missing orderId" });

    // Find the order first
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send({ success: false, msg: "Order not found" });
    }

    // Helper function to format date (same as frontend)
    const formatLocalDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // ✅ FIX: If order doesn't have an orderNumber yet, assign it NOW
    if (!order.orderNumber) {
      const createdAt = order.createdAt || new Date();
      const vendorEmail = order.vendor_email;  // ✅ Get vendor email from order

      // Get the date (YYYY-MM-DD) for grouping
      const year = createdAt.getFullYear();
      const month = String(createdAt.getMonth() + 1).padStart(2, "0");
      const day = String(createdAt.getDate()).padStart(2, "0");
      const dateStart = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      const dateEnd = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

      // ✅ FIX: Find all confirmed or ready orders for THIS VENDOR ONLY for this day
      const ordersForDay = await Order.find({
        vendor_email: vendorEmail,  // ✅ CRITICAL: Filter by vendor
        status: { $in: ["Confirmed", "Ready"] },
        orderNumber: { $exists: true, $ne: null },
        createdAt: { $gte: dateStart, $lte: dateEnd }
      }).sort({ orderNumber: 1 });

      // Assign the next available order number
      if (ordersForDay.length > 0) {
        const maxOrderNumber = Math.max(...ordersForDay.map(o => o.orderNumber));
        order.orderNumber = maxOrderNumber + 1;
      } else {
        order.orderNumber = 1;
      }
    }

    // Update the order status to Ready
    order.status = "Ready";
    order.estimatedTime = undefined;
    await order.save();

    // ✅ NOW get ALL orders for THIS VENDOR to calculate the CORRECT display number
    const allOrders = await Order.find({
      vendor_email: order.vendor_email,  // ✅ CRITICAL: Filter by vendor
      status: { $in: ["Confirmed", "Ready", "Pending", "Rejected"] }
    });

    // Calculate display order number using the EXACT frontend logic
    const displayOrderNumber = calculateDisplayOrderNumber(allOrders, order, formatLocalDate);

    // ✅ Get mess name and address from order (already stored in order)
    const messName = order.messname || 'Night Mess';
    const messAddress = order.vendor_address || 'Pickup counter';

    // Send email with mess details
    try {
      await resend.emails.send({
        from: 'Nightmess <onboarding@resend.dev>',
        to: order.client_email,
        subject: `Order #${displayOrderNumber} Ready - ${order.foodname}`,
        text: `Hi!

Your order is ready for pickup.

Order #${displayOrderNumber}
Item: ${order.foodname}
Quantity: ${order.quantity}
Total: ₹${parseFloat(order.price) * order.quantity}

Pickup Location:
${messName}
${messAddress}

Thanks,
nightMess Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
              .order-number { font-size: 24px; color: #e53e3e; font-weight: bold; margin: 15px 0; }
              .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
              .detail-line { margin: 8px 0; }
              .pickup-location { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4caf50; }
              .location-title { font-weight: bold; color: #2e7d32; margin-bottom: 8px; }
              .footer { margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">Hi!</div>
              <p>Your order is ready for pickup.</p>
              
              <div class="order-number">Order #${displayOrderNumber}</div>
              
              <div class="details">
                <div class="detail-line"><strong>Item:</strong> ${order.foodname}</div>
                <div class="detail-line"><strong>Quantity:</strong> ${order.quantity}</div>
                <div class="detail-line"><strong>Total:</strong> ₹${parseFloat(order.price) * order.quantity}</div>
              </div>
              
              <div class="pickup-location">
                <div class="location-title">📍 Pickup Location:</div>
                <div><strong>${messName}</strong></div>
                <div>${messAddress}</div>
              </div>
              
              <div class="footer">
                Thanks,<br>
                nightMess Team
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ Email sent to ${order.client_email} - Order #${displayOrderNumber} from ${messName}`);
    } catch (emailError) {
      console.error('❌ Email error:', emailError);
      // Don't fail the whole request if email fails
    }

    res.send({ success: true, msg: "Order marked as ready" });
  } catch (err) {
    console.error("Error in /mark_ready:", err);
    res.status(500).send({ success: false, msg: "Failed to mark ready" });
  }
});


app.delete('/remove_order/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    // Optional: Update status instead of deleting physically
    // await Order.findByIdAndUpdate(orderId, { status: "Removed" });
    await Order.findByIdAndDelete(orderId);
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to remove order" });
  }
});

app.post("/create_order", async (req, res) => {
  try {
    const orderNumber = await getNextOrderNumber();
    const newOrder = new Order({
      ...req.body,
      orderNumber,
      status: "Pending",
    });
    await newOrder.save();
    res.json({ success: true, data: newOrder });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, msg: "Failed to create order" });
  }
});





app.get('/api/export-orders-for-recommendations', async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['Confirmed', 'Ready'] }
    }).select('foodname client_email quantity createdAt type');

    console.log(`📊 Exporting ${orders.length} orders for recommendations`);

    if (orders.length === 0) {
      fs.writeFileSync('orders_data.csv', 'foodname,client_email,quantity,order_date,type\n');
      return res.json({
        success: true,
        message: 'No orders found, empty CSV created',
        totalOrders: 0
      });
    }

    // ✅ Convert to CSV format with proper type handling
    let csvData = 'foodname,client_email,quantity,order_date,type\n';
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const foodname = order.foodname.replace(/"/g, '""');
      const type = order.type || 'veg'; // ✅ Default to 'veg' if missing
      csvData += `"${foodname}","${order.client_email}",${order.quantity},"${date}","${type}"\n`;
    });

    fs.writeFileSync('orders_data.csv', csvData);

    console.log('✅ Orders CSV created successfully');
    console.log(`Sample data: ${csvData.split('\n').slice(0, 3).join('\n')}`);

    res.json({
      success: true,
      message: 'Orders data exported for recommendations',
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('❌ Error exporting orders:', error);
    res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
});


// 2. Generate recommendations for current user
app.get('/api/generate-recommendations', async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.status(401).json({
        success: false,
        message: 'User not logged in'
      });
    }

    const userEmail = req.session.email;

    // First, export the orders data
    const orders = await Order.find({
      status: { $in: ['Confirmed', 'Ready'] }
    }).select('foodname client_email quantity createdAt type');

    // Generate CSV
    let csvData = 'foodname,client_email,quantity,order_date,type\n';
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const foodname = order.foodname.replace(/"/g, '""');
      csvData += `"${foodname}","${order.client_email}",${order.quantity},"${date}","${order.type}"\n`;
    });
    fs.writeFileSync('orders_data.csv', csvData);

    // Run Python recommendation script
    const pythonProcess = spawn('python', ['recommendation_engine.py', userEmail]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        try {
          // Read the generated recommendations file
          const recommendationFile = `recommendations_${userEmail.replace('@', '_').replace(/\./g, '_')}.json`;

          if (fs.existsSync(recommendationFile)) {
            const recommendations = JSON.parse(fs.readFileSync(recommendationFile, 'utf8'));

            // Get full food details for recommended items
            const hybridRecs = recommendations.hybrid_recommendations || [];
            const foodDetails = await FoodData.find({
              foodname: { $in: hybridRecs },
              status: 'available'
            });

            res.json({
              success: true,
              recommendations: recommendations,
              foodDetails: foodDetails
            });
          } else {
            res.json({
              success: false,
              message: 'Recommendations file not generated',
              recommendations: null
            });
          }
        } catch (parseError) {
          console.error('Error parsing recommendations:', parseError);
          res.status(500).json({
            success: false,
            message: 'Error parsing recommendations',
            error: parseError.message
          });
        }
      } else {
        console.error('Python script error:', error);
        res.status(500).json({
          success: false,
          message: 'Error generating recommendations',
          error: error
        });
      }
    });

  } catch (error) {
    console.error('Error in generate recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// 3. Get quick recommendations (for homepage)
// app.get('/api/quick-recommendations', async (req, res) => {
//   try {
//     if (!req.session.isLoggedIn) {
//       // Don't show recommendations if user not logged in
//       return res.json([]);
//     }

//     const userEmail = req.session.email;

//     // Check if user has any order history
//     const userOrderCount = await Order.countDocuments({
//       client_email: userEmail,
//       status: { $in: ['Confirmed', 'Ready'] }
//     });

//     // If user has never ordered, don't show recommendations
//     if (userOrderCount === 0) {
//       return res.json([]);
//     }

//     // Check if recommendations file exists
//     const recommendationFile = `recommendations_${userEmail.replace('@', '_').replace(/\./g, '_')}.json`;

//     if (fs.existsSync(recommendationFile)) {
//       // Check if file is recent (less than 1 hour old)
//       const stats = fs.statSync(recommendationFile);
//       const fileAge = Date.now() - stats.mtime.getTime();
//       const oneHour = 60 * 60 * 1000;

//       if (fileAge < oneHour) {
//         // Use existing recommendations
//         const recommendations = JSON.parse(fs.readFileSync(recommendationFile, 'utf8'));
//         const hybridRecs = recommendations.hybrid_recommendations || [];

//         const foods = await FoodData.find({
//           foodname: { $in: hybridRecs.slice(0, 4) },
//           status: 'available'
//         }).limit(4);

//         return res.json(foods);
//       }
//     }

//     // Generate new recommendations in background
//     const orders = await Order.find({
//       status: { $in: ['Confirmed', 'Ready'] }
//     }).select('foodname client_email quantity createdAt type');

//     if (orders.length > 0) {
//       let csvData = 'foodname,client_email,quantity,order_date,type\n';
//       orders.forEach(order => {
//         const date = order.createdAt.toISOString().split('T')[0];
//         const foodname = order.foodname.replace(/"/g, '""');
//         csvData += `"${foodname}","${order.client_email}",${order.quantity},"${date}","${order.type}"\n`;
//       });
//       fs.writeFileSync('orders_data.csv', csvData);

//       // Run Python script in background
//       spawn('python', ['recommendation_engine.py', userEmail], {
//         detached: true,
//         stdio: 'ignore'
//       }).unref();
//     }

//     // Return popular items as fallback
//     const popularItems = await Order.aggregate([
//       { $match: { status: { $in: ['Confirmed', 'Ready'] } } },
//       { $group: { _id: '$foodname', totalOrders: { $sum: '$quantity' } } },
//       { $sort: { totalOrders: -1 } },
//       { $limit: 4 }
//     ]);

//     const popularFoodNames = popularItems.map(item => item._id);
//     const foods = await FoodData.find({
//       foodname: { $in: popularFoodNames },
//       status: 'available'
//     }).limit(4);

//     res.json(foods);

//   } catch (error) {
//     console.error('Error in quick recommendations:', error);

//     // Fallback to popular items
//     try {
//       const popularItems = await Order.aggregate([
//         { $match: { status: { $in: ['Confirmed', 'Ready'] } } },
//         { $group: { _id: '$foodname', totalOrders: { $sum: '$quantity' } } },
//         { $sort: { totalOrders: -1 } },
//         { $limit: 4 }
//       ]);

//       const popularFoodNames = popularItems.map(item => item._id);
//       const foods = await FoodData.find({
//         foodname: { $in: popularFoodNames },
//         status: 'available'
//       }).limit(4);

//       res.json(foods);
//     } catch (fallbackError) {
//       res.json([]);
//     }
//   }
// });

app.post('/api/generate-mess-recommendations', async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.status(401).json({
        success: false,
        message: 'User not logged in'
      });
    }

    const userEmail = req.session.email;
    const { vendorEmail } = req.body; // Accept vendor email in request

    // Get items available in this specific mess
    const availableItems = await FoodData.find({
      vendor_email: vendorEmail,
      status: 'available'
    }).select('foodname');

    const availableFoodNames = availableItems.map(item => item.foodname);

    // Generate recommendations as before...
    const orders = await Order.find({
      status: { $in: ['Confirmed', 'Ready'] },
      foodname: { $in: availableFoodNames } // ✅ Only include orders for items in this mess
    }).select('foodname client_email quantity createdAt type');

    // Continue with recommendation generation...
    res.json({ success: true, message: 'Mess-specific recommendations generated' });

  } catch (error) {
    console.error('Error generating mess recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

app.get('/api/quick-recommendations', async (req, res) => {
  try {
    console.log('🔍 Quick recommendations requested');
    console.log('Session:', {
      isLoggedIn: req.session.isLoggedIn,
      email: req.session.email,
      selectedVendorEmail: req.session.selectedVendorEmail // ✅ CHECK THIS
    });

    if (!req.session.isLoggedIn) {
      console.log('❌ User not logged in - no recommendations');
      return res.json([]);
    }

    // ✅ CHECK: If no mess selected, don't show recommendations
    if (!req.session.selectedVendorEmail) {
      console.log('❌ No mess selected - no recommendations');
      return res.json([]);
    }

    const userEmail = req.session.email;
    const selectedVendorEmail = req.session.selectedVendorEmail;

    // ✅ STEP 1: Get all available items from the SELECTED MESS ONLY
    const availableItemsInThisMess = await FoodData.find({
      vendor_email: selectedVendorEmail,
      status: 'available'
    }).select('foodname');

    const availableFoodNames = availableItemsInThisMess.map(item => item.foodname);

    console.log(`🏪 Selected mess has ${availableFoodNames.length} available items:`, availableFoodNames);

    if (availableFoodNames.length === 0) {
      console.log('❌ No items available in this mess');
      return res.json([]);
    }

    // ✅ STEP 2: Check user's order history (from ANY mess)
    const userOrderCount = await Order.countDocuments({
      client_email: userEmail,
      status: { $in: ['Confirmed', 'Ready'] }
    });

    console.log(`📦 User has ${userOrderCount} confirmed/ready orders (all messes)`);

    if (userOrderCount === 0) {
      console.log('❌ No order history - showing popular items from THIS mess');
      // Return popular items from THIS mess only
      const popularItemsInThisMess = await Order.aggregate([
        {
          $match: {
            status: { $in: ['Confirmed', 'Ready'] },
            foodname: { $in: availableFoodNames } // ✅ FILTER BY THIS MESS
          }
        },
        { $group: { _id: '$foodname', totalOrders: { $sum: '$quantity' } } },
        { $sort: { totalOrders: -1 } },
        { $limit: 4 }
      ]);

      const popularFoodNames = popularItemsInThisMess.map(item => item._id);
      const foods = await FoodData.find({
        foodname: { $in: popularFoodNames },
        vendor_email: selectedVendorEmail,
        status: 'available'
      }).limit(4);

      return res.json(foods);
    }

    // ✅ STEP 3: Try to get recommendations
    const recommendationFile = `recommendations_${userEmail.replace('@', '_').replace(/\./g, '_')}.json`;
    console.log(`📄 Checking for file: ${recommendationFile}`);

    if (fs.existsSync(recommendationFile)) {
      const stats = fs.statSync(recommendationFile);
      const fileAge = Date.now() - stats.mtime.getTime();
      const oneHour = 60 * 60 * 1000;

      console.log(`⏰ Recommendation file age: ${Math.floor(fileAge / 1000 / 60)} minutes`);

      if (fileAge < oneHour) {
        const recommendations = JSON.parse(fs.readFileSync(recommendationFile, 'utf8'));
        const hybridRecs = recommendations.hybrid_recommendations || [];

        console.log(`📊 Raw recommendations:`, hybridRecs);

        // ✅ CRITICAL FIX: Filter recommendations to only include items from THIS mess
        const filteredRecs = hybridRecs.filter(foodname =>
          availableFoodNames.includes(foodname)
        );

        console.log(`✅ Filtered recommendations for this mess:`, filteredRecs);

        if (filteredRecs.length === 0) {
          console.log('⚠️ No recommendations match this mess menu - falling back to popular items');
        } else {
          const foods = await FoodData.find({
            foodname: { $in: filteredRecs.slice(0, 4) },
            vendor_email: selectedVendorEmail,
            status: 'available'
          }).limit(4);

          console.log(`🍽️ Found ${foods.length} available food items from recommendations`);

          if (foods.length > 0) {
            return res.json(foods);
          }
        }
      } else {
        console.log('⏰ Recommendations file is stale, regenerating...');
      }
    } else {
      console.log('📄 No recommendations file found, generating new one...');
    }

    // ✅ STEP 4: Generate new recommendations (if needed)
    console.log('🔄 Generating new recommendations...');
    const orders = await Order.find({
      status: { $in: ['Confirmed', 'Ready'] }
    }).select('foodname client_email quantity createdAt type');

    if (orders.length > 0) {
      let csvData = 'foodname,client_email,quantity,order_date,type\n';
      orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        const foodname = order.foodname.replace(/"/g, '""');
        const type = order.type || 'veg';
        csvData += `"${foodname}","${order.client_email}",${order.quantity},"${date}","${type}"\n`;
      });
      fs.writeFileSync('orders_data.csv', csvData);

      console.log('✅ CSV created, running Python script...');

      const pythonProcess = spawn('python', ['recommendation_engine.py', userEmail]);

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      await new Promise((resolve) => {
        pythonProcess.on('close', (code) => {
          console.log(`Python process exited with code ${code}`);
          resolve();
        });
      });

      if (fs.existsSync(recommendationFile)) {
        const recommendations = JSON.parse(fs.readFileSync(recommendationFile, 'utf8'));
        const hybridRecs = recommendations.hybrid_recommendations || [];

        // ✅ Filter by current mess items
        const filteredRecs = hybridRecs.filter(foodname =>
          availableFoodNames.includes(foodname)
        );

        console.log(`✅ Generated and filtered recommendations:`, filteredRecs);

        const foods = await FoodData.find({
          foodname: { $in: filteredRecs.slice(0, 4) },
          vendor_email: selectedVendorEmail,
          status: 'available'
        }).limit(4);

        console.log(`🍽️ Found ${foods.length} available food items`);

        if (foods.length > 0) {
          return res.json(foods);
        }
      }
    }

    // ✅ STEP 5: Fallback to popular items FROM THIS MESS ONLY
    console.log('⚠️ Falling back to popular items from THIS mess');
    const popularItems = await Order.aggregate([
      {
        $match: {
          status: { $in: ['Confirmed', 'Ready'] },
          foodname: { $in: availableFoodNames } // ✅ ONLY THIS MESS
        }
      },
      { $group: { _id: '$foodname', totalOrders: { $sum: '$quantity' } } },
      { $sort: { totalOrders: -1 } },
      { $limit: 4 }
    ]);

    const popularFoodNames = popularItems.map(item => item._id);
    const foods = await FoodData.find({
      foodname: { $in: popularFoodNames },
      vendor_email: selectedVendorEmail,
      status: 'available'
    }).limit(4);

    console.log(`🔥 Returning ${foods.length} popular items from this mess`);
    res.json(foods);

  } catch (error) {
    console.error('❌ Error in quick recommendations:', error);
    res.json([]);
  }
});

// 6. Refresh recommendations (force regenerate)
app.post('/api/refresh-recommendations', async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.status(401).json({
        success: false,
        message: 'User not logged in'
      });
    }

    const userEmail = req.session.email;

    // Export orders
    const orders = await Order.find({
      status: { $in: ['Confirmed', 'Ready'] }
    }).select('foodname client_email quantity createdAt type');

    if (orders.length === 0) {
      return res.json({
        success: false,
        message: 'Not enough order data to generate recommendations'
      });
    }

    let csvData = 'foodname,client_email,quantity,order_date,type\n';
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      const foodname = order.foodname.replace(/"/g, '""');
      csvData += `"${foodname}","${order.client_email}",${order.quantity},"${date}","${order.type}"\n`;
    });
    fs.writeFileSync('orders_data.csv', csvData);

    // Run Python script
    const pythonProcess = spawn('python', ['recommendation_engine.py', userEmail]);

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res.json({
          success: true,
          message: 'Recommendations refreshed successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error refreshing recommendations',
          error: error
        });
      }
    });

  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});


// Add these routes after your existing vendor routes (around line 550, after app.get("/show_vendors"))

// ✅ NEW ROUTES FOR NIGHTMESS SELECTION

// Get all nightmesses (vendors) for selection page
app.get("/get_all_nightmesses", async (req, res) => {
  try {
    const vendors = await VendorData.find();
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Get selected nightmess
app.get("/get_selected_nightmess", async (req, res) => {
  try {
    if (req.session.isLoggedIn) {
      // Check session first
      if (req.session.selectedNightmessId && req.session.selectedVendorEmail) {
        return res.json({
          nightmessId: req.session.selectedNightmessId,
          vendorEmail: req.session.selectedVendorEmail
        });
      }
      
      // If not in session, check database (for persistence)
      const client = await ClientData.findOne({ client_email: req.session.email });
      if (client && client.last_selected_nightmess_id) {
        return res.json({
          nightmessId: client.last_selected_nightmess_id,
          vendorEmail: client.last_selected_vendor
        });
      }
      
      // No selection found
      return res.json({
        nightmessId: null,
        vendorEmail: null
      });
    } else {
      res.status(401).json({ error: "Not logged in" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add this NEW endpoint - accessible by all logged-in users
app.get("/show_all_orders_for_numbering", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      // Return all orders for numbering purposes (any authenticated user can access)
      const orders = await Order.find({
        status: { $in: ["Confirmed", "Ready", "Pending", "Rejected"] }
      }).sort({ createdAt: -1 });

      console.log(`Found ${orders.length} orders for numbering`);
      resp.json(orders);
    } else {
      resp.status(401).json({
        data: "Failed",
        msg: "Login First to View Orders",
      });
    }
  } catch (err) {
    console.error("Error in show_all_orders_for_numbering:", err);
    resp.status(500).json({ error: "server error" });
  }
});

// ✅ UPDATED: Set selected nightmess in session (CLIENTS ONLY)
app.post("/set_selected_nightmess", async (req, res) => {
  try {
    if (req.session.usertype === 'vendor') {
      return res.status(403).json({ 
        success: false, 
        msg: "Vendors cannot select nightmess. You should access vendor dashboard directly." 
      });
    }

    if (req.session.usertype !== 'client') {
      return res.status(403).json({ 
        success: false, 
        msg: "Only clients can select nightmess" 
      });
    }
    
    const { nightmessId, vendorEmail } = req.body;
    
    // Store in session
    req.session.selectedNightmessId = nightmessId;
    req.session.selectedVendorEmail = vendorEmail;
    
    // ✅ SAVE TO DATABASE for persistence
    await ClientData.findOneAndUpdate(
      { client_email: req.session.email },
      { 
        last_selected_vendor: vendorEmail,
        last_selected_nightmess_id: nightmessId
      }
    );
    
    res.json({ 
      success: true, 
      msg: "Nightmess selected successfully" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      msg: "Failed to set nightmess" 
    });
  }
});



// ============================================
// UPDATED BACKEND APIs - Replace in index.js
// ============================================



// ✅ 2. UPDATED /client_balance - Returns balance AND selected mess name
app.get("/client_balance", async (req, resp) => {
  try {
    if (req.session.isLoggedIn) {
      const client = await ClientData.findOne({ client_email: req.session.email });
      
      // Get selected vendor/mess name
      let messname = '';
      if (req.session.selectedVendorEmail) {
        const vendor = await VendorData.findOne({ vendor_email: req.session.selectedVendorEmail });
        if (vendor) {
          messname = vendor.messname;
        }
      }
      
      resp.json({ 
        balance: client.client_balance,
        messname: messname  // Include mess name for modal display
      });
    } else {
      resp.json({ data: "Failed", msg: "Login First to See Balance" });
    }
  } catch (err) {
    console.log(err);
    resp.status(500).json({ error: "server error" });
  }
});

// ✅ 3. /request_recharge - Client sends request to SELECTED mess
app.post("/request_recharge", async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.json({ success: false, msg: "Please login first" });
    }

    const { amount } = req.body;
    const clientEmail = req.session.email;
    const selectedVendorEmail = req.session.selectedVendorEmail;

    if (!selectedVendorEmail) {
      return res.json({ success: false, msg: "Please select a mess first" });
    }

    const client = await ClientData.findOne({ client_email: clientEmail });
    const vendor = await VendorData.findOne({ vendor_email: selectedVendorEmail });

    if (!client || !vendor) {
      return res.json({ success: false, msg: "Client or vendor not found" });
    }

    const rechargeRequest = new RechargeRequest({
      client_email: clientEmail,
      clientname: client.clientname,
      vendor_email: selectedVendorEmail,
      messname: vendor.messname,
      amount: amount,
      status: 'pending'
    });

    await rechargeRequest.save();

    res.json({ 
      success: true, 
      msg: `Recharge request sent to ${vendor.messname}` 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});


// ✅ 4. /get_recharge_requests - Vendor gets ONLY their pending requests
app.get("/get_recharge_requests", async (req, res) => {
  try {
    if (req.session.isLoggedIn && req.session.usertype === 'vendor') {
      const vendorEmail = req.session.email;
      
      const requests = await RechargeRequest.find({
        vendor_email: vendorEmail,
        status: 'pending'
      }).sort({ createdAt: -1 });

      res.json(requests);
    } else {
      res.status(401).json({ msg: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ 5. /approve_recharge_request - Vendor approves and credits wallet
// ✅ COMPLETE /approve_recharge_request API - Vendor approves and credits wallet
app.post("/approve_recharge_request", async (req, res) => {
  try {
    if (req.session.isLoggedIn && req.session.usertype === 'vendor') {
      const { requestId } = req.body;
      const vendorEmail = req.session.email;
      
      console.log(`\n🔍 APPROVE REQUEST DEBUG:`);
      console.log(`Vendor Email: ${vendorEmail}`);
      console.log(`Request ID: ${requestId}`);
      
      const request = await RechargeRequest.findById(requestId);
      
      if (!request) {
        return res.json({ success: false, msg: "Request not found" });
      }

      console.log(`Request Details:`, {
        vendor_email: request.vendor_email,
        client_email: request.client_email,
        amount: request.amount,
        status: request.status,
        messname: request.messname
      });

      // ✅ CRITICAL: Verify this request belongs to THIS vendor
      if (request.vendor_email !== vendorEmail) {
        console.log(`❌ ERROR: Request doesn't belong to this vendor!`);
        return res.json({ 
          success: false, 
          msg: "You cannot approve requests for other messes" 
        });
      }

      if (request.status !== 'pending') {
        return res.json({ success: false, msg: "Request already processed" });
      }

      // Find client
      const client = await ClientData.findOne({ client_email: request.client_email });
      
      if (!client) {
        return res.json({ success: false, msg: "Client not found" });
      }

      // ✅ Initialize mess_wallets array if it doesn't exist
      if (!client.mess_wallets) {
        client.mess_wallets = [];
      }

      // ✅ Find or create mess-specific wallet
      let messWallet = client.mess_wallets.find(
        w => w.vendor_email === request.vendor_email
      );
      
      if (!messWallet) {
        console.log(`Creating new wallet for ${request.messname}`);
        client.mess_wallets.push({
          vendor_email: request.vendor_email,
          messname: request.messname,
          balance: request.amount
        });
      } else {
        console.log(`Adding to existing wallet. Old balance: ${messWallet.balance}`);
        messWallet.balance += request.amount;
        console.log(`New balance: ${messWallet.balance}`);
      }

      await client.save();

      // Update request status
      request.status = 'approved';
      await request.save();

      console.log(`✅ Approved: ₹${request.amount} → ${request.clientname} (${request.messname})`);

      // ✅ Send email notification for recharge approval
      try {
        await resend.emails.send({
          from: 'Nightmess <onboarding@resend.dev>',
          to: request.client_email,
          subject: `Wallet Recharged - ₹${request.amount}`,
          text: `Hi ${request.clientname}!

Your wallet recharge request has been approved.

Recharge Details:
Amount: ₹${request.amount}
Mess: ${request.messname}
Status: Approved

Your ${request.messname} wallet has been credited with ₹${request.amount}.

You can now place orders from ${request.messname}.

Thanks,
nightMess Team`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
                .status-badge { 
                  display: inline-block;
                  padding: 8px 16px;
                  background: #28a745;
                  color: #fff;
                  border-radius: 5px;
                  font-weight: bold;
                  margin: 15px 0;
                }
                .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .detail-line { margin: 8px 0; }
                .amount { font-size: 24px; color: #28a745; font-weight: bold; margin: 15px 0; }
                .mess-info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196f3; }
                .footer { margin-top: 20px; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">Hi ${request.clientname}!</div>
                <p>Your wallet recharge request has been approved.</p>
                
                <div class="status-badge">✓ Recharge Approved</div>
                
                <div class="amount">₹${request.amount}</div>
                
                <div class="details">
                  <div class="detail-line"><strong>Mess:</strong> ${request.messname}</div>
                  <div class="detail-line"><strong>Status:</strong> Approved</div>
                </div>
                
                <div class="mess-info">
                  <div>Your <strong>${request.messname}</strong> wallet has been credited with <strong>₹${request.amount}</strong>.</div>
                </div>
                
                <p style="margin-top: 20px;">You can now place orders from ${request.messname}.</p>
                
                <div class="footer">
                  Thanks,<br>
                  nightMess Team
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`✅ Recharge approval email sent to ${request.client_email}`);
      } catch (emailError) {
        console.error('❌ Email error:', emailError);
        // Don't fail the whole request if email fails
      }

      res.json({ 
        success: true, 
        msg: `₹${request.amount} credited to ${request.clientname}'s ${request.messname} wallet` 
      });

    } else {
      res.status(401).json({ success: false, msg: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

// ✅ COMPLETE /reject_recharge_request API - Vendor rejects request
app.post("/reject_recharge_request", async (req, res) => {
  try {
    if (req.session.isLoggedIn && req.session.usertype === 'vendor') {
      const { requestId } = req.body;
      
      const request = await RechargeRequest.findById(requestId);
      
      if (!request) {
        return res.json({ success: false, msg: "Request not found" });
      }

      request.status = 'rejected';
      await request.save();

      // ✅ Send email notification for recharge rejection
      try {
        await resend.emails.send({
          from: 'Nightmess <onboarding@resend.dev>',
          to: request.client_email,
          subject: `Wallet Recharge Request Declined - ${request.messname}`,
          text: `Hi ${request.clientname},

Your wallet recharge request has been declined.

Request Details:
Amount: ₹${request.amount}
Mess: ${request.messname}
Status: Declined

Your recharge request for ${request.messname} could not be processed at this time.

Please contact ${request.messname} directly if you have any questions, or try submitting a new request later.

Thanks,
nightMess Team`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
                .status-badge { 
                  display: inline-block;
                  padding: 8px 16px;
                  background: #dc3545;
                  color: #fff;
                  border-radius: 5px;
                  font-weight: bold;
                  margin: 15px 0;
                }
                .details { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
                .detail-line { margin: 8px 0; }
                .info-box { 
                  background: #fff3cd; 
                  padding: 15px; 
                  border-radius: 5px; 
                  margin: 15px 0; 
                  border-left: 4px solid #ffc107; 
                }
                .footer { margin-top: 20px; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">Hi ${request.clientname},</div>
                <p>Your wallet recharge request has been declined.</p>
                
                <div class="status-badge">✗ Request Declined</div>
                
                <div class="details">
                  <div class="detail-line"><strong>Amount:</strong> ₹${request.amount}</div>
                  <div class="detail-line"><strong>Mess:</strong> ${request.messname}</div>
                  <div class="detail-line"><strong>Status:</strong> Declined</div>
                </div>
                
                <div class="info-box">
                  <div>Your recharge request for <strong>${request.messname}</strong> could not be processed at this time.</div>
                </div>
                
                <p style="margin-top: 20px;">Please contact <strong>${request.messname}</strong> directly if you have any questions, or try submitting a new request later.</p>
                
                <div class="footer">
                  Thanks,<br>
                  nightMess Team
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log(`✅ Recharge rejection email sent to ${request.client_email}`);
      } catch (emailError) {
        console.error('❌ Email error:', emailError);
        // Don't fail the whole request if email fails
      }

      res.json({ success: true, msg: "Request rejected" });
    } else {
      res.status(401).json({ success: false, msg: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});


// ✅ REPLACE your existing /show_clients_amt endpoint with this:

app.get("/show_clients_amt", async (req, resp) => {
  try {
    if (req.session.isLoggedIn && req.session.usertype === 'vendor') {
      const vendorEmail = req.session.email;
      
      console.log(`\n=== SHOW_CLIENTS_AMT ===`);
      console.log(`Vendor Email: ${vendorEmail}`);
      
      // ✅ Get ONLY APPROVED requests for THIS vendor
      const approvedRequests = await RechargeRequest.find({
        vendor_email: vendorEmail,
        status: 'approved'
      });

      console.log(`Found ${approvedRequests.length} approved requests`);

      if (approvedRequests.length === 0) {
        console.log(`No approved requests found for vendor ${vendorEmail}`);
        return resp.json([]);
      }

      // Get unique client emails from approved requests only
      const uniqueEmails = [...new Set(approvedRequests.map(r => r.client_email))];
      console.log(`Unique client emails:`, uniqueEmails);

      // Fetch client details for these emails only
      const clients = await ClientData.find({
        client_email: { $in: uniqueEmails }
      });

      console.log(`Found ${clients.length} clients`);

      // ✅ CRITICAL FIX: Add mess-specific balance to each client
      const clientsWithMessBalance = clients.map(client => {
        const messWallet = client.mess_wallets?.find(
          w => w.vendor_email === vendorEmail
        );
        
        const clientObj = {
          ...client.toObject(),
          client_balance: messWallet ? messWallet.balance : 0
        };
        
        console.log(`Client ${client.clientname}: Balance = ₹${clientObj.client_balance}`);
        
        return clientObj;
      });

      console.log(`Returning ${clientsWithMessBalance.length} clients with balances\n`);
      resp.json(clientsWithMessBalance);
    } else {
      console.log(`Unauthorized access attempt`);
      resp.status(401).json({ msg: "Unauthorized" });
    }
  } catch (err) {
    console.error("Error in /show_clients_amt:", err);
    resp.status(500).json({ error: 'server error' });
  }
});



// ============================================
// RAZORPAY ROUTES - Add these routes to index.js
// ============================================

// Create Razorpay order
app.post('/createOrder', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Create order options
    const options = {
      amount: Math.round(amount * 100), // Convert to paise and ensure integer
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1
    };

    // Create order using Razorpay instance
    const order = await razorpayInstance.orders.create(options);

    console.log('✅ Razorpay order created:', order.id);

    res.json({
      success: true,
      order: order,
      key_id: process.env.RAZORPAY_ID_KEY || 'your_razorpay_key_id'
    });

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify Razorpay payment
app.post('/verifyPayment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Create signature for verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY || 'your_razorpay_secret_key')
      .update(sign.toString())
      .digest("hex");

    // Verify signature
    if (razorpay_signature === expectedSign) {
      console.log('✅ Payment verified:', razorpay_payment_id);
      
      return res.json({
        success: true,
        message: "Payment verified successfully",
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      console.log('❌ Payment signature verification failed');
      
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// ============================================
// NOTES FOR INTEGRATION:
// ============================================
// 1. Add these routes to your existing index.js file
// 2. Make sure to install Razorpay: npm install razorpay
// 3. Add Razorpay credentials to your .env file:
//    RAZORPAY_ID_KEY=your_key_id
//    RAZORPAY_SECRET_KEY=your_secret_key
// 4. Replace the Cart.jsx file in your frontend
// ============================================


module.exports = app;

//start server on port 5000
app.listen(5000);
