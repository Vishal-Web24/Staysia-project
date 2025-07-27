if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverRide = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { error } = require("console");

const dbUrl = process.env.ATLASDB_URL;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverRide("_method"));
app.engine("ejs", ejsMate);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret:process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error",(err)=>{
  console.log( "ERROR IN MONGO SESSION STORE",err);
})

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// TEMPORARY SEEDING ROUTE - REMOVE AFTER USE
app.get("/seed-production", async (req, res) => {
  try {
    // Sample users data
    const sampleUsers = [
     {
    username: "alice_host",
    email: "alice@example.com",
    password: "password123"
  },
  {
    username: "bob_traveler",
    email: "bob@example.com",
    password: "password123"
  },
  {
    username: "carol_explorer",
    email: "carol@example.com",
    password: "password123"
  },
  {
    username: "david_adventures",
    email: "david@example.com",
    password: "password123"
  },
  {
    username: "emma_homes",
    email: "emma@example.com",
    password: "password123"
  },
  {
    username: "raj_properties",
    email: "raj@example.com",
    password: "password123"
  },
  {
    username: "priya_stays",
    email: "priya@example.com",
    password: "password123"
  },
  {
    username: "vikram_resorts",
    email: "vikram@example.com",
    password: "password123"
  },
  {
    username: "pottar_travels",
    email: "kavya@example.com",
    password: "password123"
  },
  {
    username: "arjun_hospitality",
    email: "arjun@example.com",
    password: "password123"
  }
    ];

    // Your listings data (copy from your paste.txt)
    const sampleListings = [
       {
    title: "Cozy Beachfront Cottage",
    geometry: { type: "Point", coordinates: [-118.7798, 34.0259] },
    description: "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1500,
    location: "Malibu",
    country: "United States",
  },
  {
    title: "Modern Loft in Downtown",
    geometry: { type: "Point", coordinates: [-74.006, 40.7128] },
    description: "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1200,
    location: "New York City",
    country: "United States",
  },
  {
    title: "Mountain Retreat",
    geometry: { type: "Point", coordinates: [-106.837, 39.1911] },
    description: "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1000,
    location: "Aspen",
    country: "United States",
  },
  {
    title: "Luxury Villa in Goa",
    geometry: { type: "Point", coordinates: [73.8567, 15.2993] },
    description: "Experience luxury at its finest in this beautiful villa with private pool and beach access in North Goa.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 3500,
    location: "Goa",
    country: "India",
  },
  {
    title: "Heritage Haveli in Jaipur",
    geometry: { type: "Point", coordinates: [75.7873, 26.9124] },
    description: "Stay in a traditional Rajasthani haveli converted into a boutique hotel. Experience royal hospitality.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 2200,
    location: "Jaipur",
    country: "India",
  },
  {
    title: "Houseboat in Kerala Backwaters",
    geometry: { type: "Point", coordinates: [76.2673, 9.9312] },
    description: "Float through the serene backwaters of Kerala in this traditional houseboat. Includes meals and guided tours.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 1800,
    location: "Alleppey",
    country: "India",
  },
  {
    title: "Himalayan Retreat in Manali",
    geometry: { type: "Point", coordinates: [77.1892, 32.2432] },
    description: "Wake up to snow-capped mountains in this cozy cottage. Perfect for adventure enthusiasts and nature lovers.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 1200,
    location: "Manali",
    country: "India",
  },
  {
    title: "Beach Shack in Gokarna",
    geometry: { type: "Point", coordinates: [74.3233, 14.5442] },
    description: "Simple beachside accommodation perfect for backpackers. Wake up to the sound of waves.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 800,
    location: "Gokarna",
    country: "India",
  },
  {
    title: "Tea Estate Bungalow in Darjeeling",
    geometry: { type: "Point", coordinates: [88.2636, 27.036] },
    description: "Stay in a colonial-era bungalow surrounded by tea gardens. Enjoy fresh mountain air and stunning sunrise views.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 1500,
    location: "Darjeeling",
    country: "India",
  },
  {
    title: "Desert Camp in Jaisalmer",
    geometry: { type: "Point", coordinates: [70.9083, 26.9157] },
    description: "Experience the Thar Desert with camel rides, folk music, and stargazing. Luxury tents with modern amenities.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 2000,
    location: "Jaisalmer",
    country: "India",
  },
  {
    title: "Treehouse in Wayanad",
    geometry: { type: "Point", coordinates: [76.1319, 11.6854] },
    description: "Unique treehouse experience in the Western Ghats. Perfect for wildlife enthusiasts and eco-tourists.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 1100,
    location: "Wayanad",
    country: "India",
  },
  {
    title: "Palace Suite in Udaipur",
    geometry: { type: "Point", coordinates: [73.7125, 24.571] },
    description: "Live like royalty in this converted palace hotel overlooking Lake Pichola. Includes butler service.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 4500,
    location: "Udaipur",
    country: "India",
  },
  {
    title: "Ashram Retreat in Rishikesh",
    geometry: { type: "Point", coordinates: [78.2676, 30.0869] },
    description: "Find inner peace at this riverside ashram. Includes yoga classes, meditation sessions, and vegetarian meals.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 900,
    location: "Rishikesh",
    country: "India",
  },
  {
    title: "Lighthouse Cottage in Diu",
    geometry: { type: "Point", coordinates: [70.9811, 20.7144] },
    description: "Unique stay in a lighthouse keeper's cottage. Panoramic ocean views and peaceful atmosphere.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 1300,
    location: "Diu",
    country: "India",
  },
  {
    title: "Spice Plantation Stay in Coorg",
    geometry: { type: "Point", coordinates: [75.9064, 12.3375] },
    description: "Immerse yourself in coffee and spice plantations. Guided tours, fresh coffee, and local cuisine included.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 1400,
    location: "Coorg",
    country: "India",
  },
  {
    title: "Lake View Cottage in Nainital",
    geometry: { type: "Point", coordinates: [79.4419, 29.3803] },
    description: "Charming cottage overlooking Naini Lake. Perfect for honeymoons and peaceful getaways.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 1600,
    location: "Nainital",
    country: "India",
  },
  {
    title: "Fort Hotel in Jodhpur",
    geometry: { type: "Point", coordinates: [73.0243, 26.2389] },
    description: "Stay within the walls of Mehrangarh Fort. Spectacular city views and royal Rajasthani architecture.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 3200,
    location: "Jodhpur",
    country: "India",
  },
  {
    title: "Beach Resort in Andaman",
    geometry: { type: "Point", coordinates: [92.6586, 11.7401] },
    description: "Private beach resort with water sports, scuba diving, and pristine coral reefs. All meals included.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 5000,
    location: "Port Blair",
    country: "India",
  },
  {
    title: "Monastery Guest House in Ladakh",
    geometry: { type: "Point", coordinates: [77.5771, 34.1526] },
    description: "Authentic Ladakhi experience in a traditional monastery guest house. High altitude adventure base.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 800,
    location: "Leh",
    country: "India",
  },
  {
    title: "Wine Resort in Nashik",
    geometry: { type: "Point", coordinates: [73.7898, 19.9975] },
    description: "Luxury stay at a vineyard resort. Wine tasting tours, gourmet dining, and grape harvest experiences.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
    },
    price: 2800,
    location: "Nashik",
    country: "India",
  },
    ];

    // Clear old data
    await Listing.deleteMany({});
    await User.deleteMany({});

    // Create users
    console.log("Creating users...");
    const createdUsers = [];
    for (let userData of sampleUsers) {
      const { username, email, password } = userData;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      createdUsers.push(registeredUser);
    }

    // Create listings with random owners
    const getRandomUser = () => createdUsers[Math.floor(Math.random() * createdUsers.length)]._id;
    const listingsWithOwners = sampleListings.map((listing) => ({
      ...listing,
      owner: getRandomUser()
    }));

    const savedListings = await Listing.insertMany(listingsWithOwners);
    
    res.json({
      success: true,
      message: "Database seeded successfully!",
      usersCreated: createdUsers.length,
      listingsCreated: savedListings.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

main()
  .then(() => {
    console.log("connection successfull");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  await mongoose.connect(dbUrl);
}

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("listen on port ");
});
