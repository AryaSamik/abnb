const express = require("express");
const router = express.Router();
const asyncWrap = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");

const listingController = require("../controllers/listing.js");

const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

let isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    next();
}

const validateListing = (err, req, res, next) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) {
        let errMsg = result.error.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }
    else {
        next();
    }
};

const isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listing/${id}`);
    }
    next();
}

router.route("/")
.get(asyncWrap(listingController.index))
.post(isLoggedIn, upload.single('listing[image]'), validateListing, asyncWrap(listingController.create));

router.get("/new", isLoggedIn, listingController.new);

router.route("/:id")
.get(asyncWrap(listingController.show))
.patch(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, asyncWrap(listingController.patch))
.delete(isLoggedIn, isOwner, asyncWrap(listingController.delete));

router.get("/:id/update", isLoggedIn, isOwner, asyncWrap(listingController.update));

module.exports = router;