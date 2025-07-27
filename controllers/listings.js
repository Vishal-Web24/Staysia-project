const Listing = require("../models/listing");
const { type } = require("../schema");
const { geometry } = require("../models/listing");
module.exports.index = async (req, res) => {
  let allListings = await Listing.find();
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  console.log(req.user);
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // try {
  //   const { listing } = req.body;
  //   // Step 1: Geocode the location (e.g., "Jaipur, India")
  //   const geoRes = await fetch(
  //     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
  //       listing.location
  //     )}`
  //   );
  //   const geoData = await geoRes.json();
  //   if (!geoData.length) {
  //     req.flash("error", "Location not found! Please enter a valid location.");
  //     return res.redirect("/listings/new");
  //   }
  //   // Step 2: Convert to GeoJSON format
  //   const lat = parseFloat(geoData[0].lat);
  //   const lon = parseFloat(geoData[0].lon);
  //   let url = req.file.path;
  //   let filename = req.file.filename;
  //   // console.log(url, "..", filename);
  //   const newListing = new Listing(req.body.listing);
  //   // console.log(req.user);
  //   newListing.owner = req.user._id;
  //   newListing.image = { url, filename };
  //   newListing.geometry = {
  //     type: "Point",
  //     coordinates: [lon, lat], // GeoJSON format: [longitude, latitude]
  //   };
  //   let savedListing = await newListing.save();
  //   console.log(savedListing);
  //   req.flash("success", "New Listing Created!");
  //   res.redirect("/listings");
  // } catch (err) {
  //   next(err);
  // }

  // FIXME: Server returned HTML instead of JSON – likely an error page (404/500 or redirect).
  // TODO: Check backend route /upload for errors and ensure JSON response is returned.

  try {
    const { listing } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      req.flash("error", "Please upload an image!");
      return res.redirect("/listings/new");
    }

    // Step 1: Geocode the location (e.g., "Jaipur, India")
    let geoRes, geoData;

    try {
      geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          listing.location
        )}`,
        {
          headers: {
            "User-Agent": "Staysia App", // OpenStreetMap requires a User-Agent
          },
        }
      );

      if (!geoRes.ok) {
        throw new Error(`Geocoding failed: ${geoRes.status}`);
      }

      geoData = await geoRes.json();
    } catch (geoError) {
      console.error("Geocoding error:", geoError);
      req.flash(
        "error",
        "Unable to find location. Please try a different location name."
      );
      return res.redirect("/listings/new");
    }

    if (!geoData || !geoData.length) {
      req.flash("error", "Location not found! Please enter a valid location.");
      return res.redirect("/listings/new");
    }

    // Step 2: Convert to GeoJSON format
    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lon)) {
      req.flash("error", "Invalid location coordinates received.");
      return res.redirect("/listings/new");
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    newListing.geometry = {
      type: "Point",
      coordinates: [lon, lat], // GeoJSON format: [longitude, latitude]
    };

    let savedListing = await newListing.save();
    console.log("New listing created:", savedListing._id);
    req.flash("success", "New Listing Created!");

    res.redirect("/listings");
  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", "Something went wrong while creating the listing.");
    res.redirect("/listings/new");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
