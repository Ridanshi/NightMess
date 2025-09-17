// backendfolder/index.js
//Connect to mongodb using mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/', {
    dbName: 'nightMess',
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => err ? console.log(err) :
    console.log('Connected to database successfully'));


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
    }
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

const ImageSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    }
})

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
},{ timestamps: true })

const orderSchema = new mongoose.Schema({
  foodname: String,
  price: String,
  quantity: Number,
  image: String,
  des: String,
  client_email: String,
  status: String,
  orderNumber: Number,           
  estimatedTime: String          
},{ timestamps: true });


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
const ImageData = mongoose.model('imagedata', ImageSchema);
ImageData.createIndexes();
const Cart = mongoose.model('Cart', CartSchema);
Cart.createIndexes();
const Order = mongoose.model('Order', orderSchema);
Order.createIndexes();


//create server
const express = require('express');

const session = require('express-session');
var cookieParser = require('cookie-parser');


const app = express();
const cors = require("cors");
console.log("service started at http://localhost:5000");
app.use(express.json());
app.use(cors());
app.use(cookieParser());




app.post("/check_login", async (req, res) => {
    try {
        const em = req.body.email;
        const ps = req.body.password;
        console.log(em);
        const user = await LoginData.findOne({ email: em, password: ps });
        console.log(user);

        session.email = em;
        session.usertype = user.usertype;
        session.isLoggedIn = true;


        res.json({
            usertype: user.usertype
        });
    } catch (e) {
        console.log("Error: Problem");
        console.log(e);
        res.status(500).json({ error: 'server error' });
    }
});



app.get("/isUser", async (req, res) => {
    console.log("The session is: ", session);
    if (session.isLoggedIn) {
        res.json({
            usertype: session.usertype,
            email: session.email
        });
    }
    else {
        res.json({
            "usertype": "no user"
        });
    }
});

app.get("/logout", async (req, res) => {
    session.isLoggedIn = false;
    session.email = "";
    session.usertype = "";
    res.json({
        "msg": "success"
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
                msg: "Client already registered",
            });
        }

        const newClient = new ClientData({ clientname: name, client_contact: contact, client_email: email, client_password: password });
        const lgn = new LoginData({ email: email, password: password, usertype: utype });

        let result = await newClient.save();
        let result1 = await lgn.save();

        result = result.toObject();

        if (result) {
            resp.json({
                data: "success",
                msg: "Client registered successfully",
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
        console.log(session.email);
        if (session.isLoggedIn) {
            em = session.email
            const data = req.body;
            console.log(data);
            const bl = req.body.balance;
            console.log(em, bl);

            const ad1 = new MoneyData({ client_balance: bl });

            let result = await ad1.save();
            result = result.toObject();
            console.log(result);
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
        else {
            res.json({
                data: 'Failed',
                msg: 'Login Error'
            });
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
        console.log(session.email);
        if (session.isLoggedIn) {
            const em = session.email;
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

// Keep the single upload endpoint as backup
app.post("/single", upload.single("image"), async (req, res) => {
    try {
        const { path, filename } = req.file
        const image = new ImageData({ path, filename })
        await image.save()
        res.send({ "msg": "Image Uploaded" })
    } catch (error) {
        res.send({ "error": "Unable to upload image" })
    }
})

// Fix 2: Corrected image retrieval endpoint
app.get("/img/:id", async (req, res) => {
    const { id } = req.params
    try {
        const image = await ImageData.findById(id)
        if (!image) {
            return res.status(404).send({ "msg": "Image not found" })
        }
        // Fix: Use path.join instead of this.path.join
        const imagePath = path.join(__dirname, "public", "Images", image.filename)
        res.sendFile(imagePath)
    } catch (error) {
        console.log(error)
        res.status(500).send({ "error": "Unable to get image" })
    }
})

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

app.post("/get_vendors", async (req, resp) => {
    try {
        // console.log("entered in get vendor")
        // if (session.isLoggedIn) {
            em = session.email;
            //console.log("this is vendors email", em);
            const vendor = await VendorData.findOne({ email: em });
            //console.log(vendor);
            resp.json(vendor);
        //}

    }
    catch (err) {
        console.log(err);
        resp.status(500).json({ error: 'server error' });
    }
});

app.post("/update_vendors", async (req, resp) => {
    try {
        const snm = req.body.messname;
        const nm = req.body.owner;
        const adr = req.body.address;
        const mob = req.body.contact;
        const em = req.body.id;
        const filter = { email: em };
        console.log(filter);
        const update = { messname: snm, owner: nm, vendor_address: adr, vendor_contact: mob, vendor_email: em };
        console.log(update);
        const result = await VendorData.findOneAndUpdate(filter, update, { new: true }); //filter: condition on which document is updated. update: parameters of the documnent to be updated. new:true-> new updated document
        console.log(result);
        resp.json({
            data: 'success',
            msg: 'Data Saved Successfully'
        });
    } catch (e) {
        console.log(e);
        resp.json({
            data: 'error',
            msg: 'Cannot save changes'
        });
    }
});

app.post("/delete_vendors", async (req, resp) => {
    try {
        const snm = req.body.messname;
        const nm = req.body.owner;
        const adr = req.body.address;
        const mob = req.body.contact;
        const em = req.body.id;
        const filter = { email: em };
        console.log(filter);
        const del = { messname: snm, owner: nm, vendor_address: adr, vendor_contact: mob, vendor_email: em };
        console.log(del);
        const result = await VendorData.findOneAndDelete(filter, del);
        console.log(result);
        resp.json({
            data: 'success',
            msg: 'Data Deleted Successfully'
        });
    } catch (e) {
        console.log(e);
        resp.json({
            data: 'error',
            msg: 'Cannot save changes'
        });
    }
});


app.post("/change_pass", async (req, resp) => {
    try {
        if (session.isLoggedIn) {
            em = session.email
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
        em = session.email;
        const admin = await AdminData.findOne({ email: em });
        console.log("get_admin : ", admin);
        resp.json(admin);
    }
    catch (e) {
        console.log(e);
        resp.json({
            data: 'error',
            msg: 'Cannot get admin'
        });
    }
});

app.post("/update_admin_profile", async (req, resp) => {
    try {
        if (session.isLoggedIn) {
            em = session.email
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
        em = session.email;
        const vendor = await VendorData.findOne({ email: em });
        console.log("get_vendor : ", vendor);
        resp.json(vendor);
    }
    catch (e) {
        console.log(e);
        resp.json({
            data: 'error',
            msg: 'Cannot get vendor'
        });
    }
});

// Ensure you have something like: const VendorData = require('./your_model_path');

app.post("/update_vendor_profile", async (req, resp) => {
    try {
        if (session.isLoggedIn) {
            const em = session.email;
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
        if (session.isLoggedIn) {
            em = session.email;
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
        if (session.isLoggedIn) {
            em = session.email
            const nm = req.body.name;
            const cont = req.body.contact;
            const filter = { email: em };

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



app.get("/client_by_email/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const client = await ClientData.findOne({ client_email: email });

        if (!client) return res.status(404).json({ msg: "Client not found" });

        res.json(client);
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Server error" });
    }
});

app.post("/recharge_client", async (req, res) => {
    if (session.isLoggedIn) {
        const em = session.email;
        try {
            console.log("email from session", em);
            console.log(req.body);
            const { balance, type, clientname, email_user } = req.body;

            const recharge = new MoneyData({
                balance: balance,
                clientname: clientname,
                type: type,
                email_user: email_user,
                email_vendor: em,
            });

            // Find the client by email
            const client = await ClientData.findOne({ client_email: email_user });

            if (!client) {
                return res.status(404).json({ status: "error", msg: "Client not found." });
            }

            let newBalance;

            if (type === "credit") {
                // Add balance
                newBalance = client.client_balance + parseFloat(balance);
            } else if (type === "debit") {
                // Check for sufficient balance before subtracting
                if (client.client_balance < parseFloat(balance)) {
                    return res.status(400).json({ status: "error", msg: "Insufficient client balance." });
                }
                newBalance = client.client_balance - parseFloat(balance);
            } else {
                return res.status(400).json({ status: "error", msg: "Invalid transaction type." });
            }

            // Update client balance in database
            await ClientData.updateOne(
                { client_email: email_user },
                { $set: { client_balance: newBalance } }
            );

            // Save the recharge record
            await recharge.save();

            res.json({ status: "success", msg: "Recharge recorded successfully." });

        } catch (err) {
            console.error(err);
            res.status(500).json({ status: "error", msg: "Recharge failed." });
        }
    } else {
        res.json({
            data: 'Failed',
            msg: 'Login Error'
        });
    }
});



app.get('/get_foods', async (req, res) => {
  try {
    const foods = await FoodData.find({});
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
  if (session.isLoggedIn) {
    const client_email = session.email;

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
        if(session.isLoggedIn)
        {
            const em = session.email;
            const carts = await Cart.find({ client_email: em });
            console.log(carts);
            resp.json(carts);
        }
        else{
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
    if (session.isLoggedIn) {
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
    if (session.isLoggedIn) {
      const id = req.params.id;

      await Cart.deleteOne({ _id: id, client_email: session.email });

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
    if (session.isLoggedIn) {
      await Cart.deleteMany({ client_email: session.email });

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
    if (session.isLoggedIn) {
      const clientEmail = session.email;

      // Fetch client
      const client = await ClientData.findOne({ client_email: clientEmail });
      if (!client) {
        return resp.status(404).json({ msg: "Client not found" });
      }

      // Fetch cart items
      const cartItems = await Cart.find({ client_email: clientEmail });
      if (cartItems.length === 0) {
        return resp.status(400).json({ msg: "Cart is empty" });
      }

      // Calculate total amount
      let totalAmount = 0;
      cartItems.forEach(item => {
        totalAmount += item.quantity * parseFloat(item.price);
      });

      // Check balance
      if (client.client_balance < totalAmount) {
        return resp.json({
          data: "Failed",
          msg: "Insufficient balance",
        });
      }

      // Place each item as an order
      for (let item of cartItems) {
        const order = new Order({
          foodname: item.foodname,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          client_email: item.client_email,
          des: item.des,
          status: "Pending",
        });
        await order.save();
      }

      // Deduct balance
      client.client_balance -= totalAmount;
      await client.save();

      // ✅ Log transaction in MoneySchema
      const moneyLog = new MoneyData({
        balance: totalAmount,
        clientname: client.clientname,
        type: "Debit",
        email_user: client.client_email,
        email_vendor: "Booked by User",
      });
      await moneyLog.save();

      // Clear cart
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
    if (session.isLoggedIn) {
      const orders = await Order.find({ client_email: session.email });
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
    if (session.isLoggedIn) {
      const client = await ClientData.findOne({ client_email: session.email });
      resp.json({ balance: client.client_balance });
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
    if (session.isLoggedIn) {
      const items = await Cart.find({ client_email: session.email });

      let totalItems = 0;
      items.forEach((item) => {
        totalItems += item.quantity;
      });

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
    if (session.isLoggedIn) {
      const orders = await Order.find();
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

// CONFIRM ORDER STATUS - Proper daily orderNumber assignment
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

    // If order is being confirmed for first time
    if (!order.orderNumber) {
      const createdAt = order.createdAt || new Date();

      // Get the date (YYYY-MM-DD) for grouping
      const year = createdAt.getFullYear();
      const month = String(createdAt.getMonth() + 1).padStart(2, "0");
      const day = String(createdAt.getDate()).padStart(2, "0");
      const dateStart = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      const dateEnd = new Date(`${year}-${month}-${day}T23:59:59.999Z`);

      // Find all confirmed or ready orders for this day
      const ordersForDay = await Order.find({
        status: { $in: ["Confirmed", "Ready"] },
        createdAt: { $gte: dateStart, $lte: dateEnd }
      });

      // Sort by approval timestamp ascending (using updatedAt or createdAt)
      const sortedOrders = ordersForDay.sort((a, b) => {
        const tA = new Date(a.updatedAt || a.createdAt);
        const tB = new Date(b.updatedAt || b.createdAt);
        return tA - tB;
      });

      // Find index of this order in sorted array
      const index = sortedOrders.findIndex(o => o._id.equals(order._id));

      if (index !== -1) {
        order.orderNumber = index + 1;
      } else {
        // If order not in list (probably first confirm), assign next number
        order.orderNumber = sortedOrders.length + 1;
      }
    }

    order.status = "Confirmed";
    await order.save();
    res.send({ success: true, order });
  } catch (error) {
    console.error("Error in /confirm_order_status:", error);
    res.status(500).send({ success: false, msg: "Error confirming order" });
  }
});


app.get("/get_cart", async (req, res) => {
    try {
        if (session.isLoggedIn) {
            const cartItems = await Cart.find({ client_email: session.email });
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
        if (!session.isLoggedIn) {
            return res.json({ quantity: 0 });
        }

        const cartItem = await Cart.findOne({
            client_email: session.email,
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
    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only proceed if order status is not already rejected or confirmed
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

    // Calculate refund amount = price * quantity (price is string, parse it as float)
    const refundAmount = parseFloat(order.price) * order.quantity;

    // Add refundAmount to client's wallet balance
    client.client_balance += refundAmount;
    await client.save();

    // Log the refund in moneydata collection - 'credit' type
    const moneyLog = new MoneyData({
      balance: refundAmount,
      clientname: client.clientname,
      type: "Credit",
      email_user: client.client_email,
      email_vendor: "Refund from order rejection",
    });
    await moneyLog.save();

    // Respond success
    res.json({ message: 'Order rejected and amount refunded successfully' });
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


app.post('/mark_ready', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).send({ success: false, msg: "Missing orderId" });
    await Order.findByIdAndUpdate(orderId, { status: "Ready" });
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

module.exports = app;

//start server on port 5000
app.listen(5000);
