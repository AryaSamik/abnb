const Review = require("../models/reviews");
const Listing = require("../models/listing")

module.exports.create = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created");
    res.redirect(`/listing/${listing._id}`);
};

module.exports.delete = async (req, res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete({_id: reviewId});

    req.flash("success", "Review Deleted");
    res.redirect(`/listing/${id}`);
};