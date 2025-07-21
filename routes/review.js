const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn,isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/review.js");


//* Reviews
//* Post reviews Route
router.post("/", isLoggedIn, validateReview, reviewController.createReview);

//* Delete reviews Route
router.delete(
  "/:reviewId",isLoggedIn,isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
