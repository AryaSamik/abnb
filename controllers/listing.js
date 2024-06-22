const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("./listings/index.ejs", { allListings });
};

module.exports.create = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    req.body.listing.owner = res.locals.currUser.id;
    let list = new Listing(req.body.listing);
    list.image = {url, filename};
    await list.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listing");
};

module.exports.new = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.update = async (req, res) => {
    let list = await Listing.findById(req.params.id);
    let originalImageUrl = list.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300/w_250");
    res.render("./listings/update.ejs", { list, originalImageUrl });
};

module.exports.show = async (req, res) => {
    let id = req.params.id;
    let list = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path: "author"
        }
    })
    .populate("owner");
    if (!list) {
        req.flash("error", "Listing you requested does not exist");
        res.redirect("/listing");
    }
    else {
        res.render("./listings/show.ejs", { list });
    }
};

module.exports.patch = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file != "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listing/${req.params.id}`);
};

module.exports.delete = async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing Deleted");
    res.redirect(`/listing`);
}