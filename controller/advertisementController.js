const Advertisement = require("../models/advertisement.models");
const Vendor = require("../models/vendor.models");
const Review = require('../models/review.models')
const {STATUS_500, STATUS_400, STATUS_200_WITH_DATA, STATUS_200} = require("../const/const");
const path = require('path')
const fs = require('fs')

const saveAdvertisement = async (req, res) => {
    try {
        const {
            vendorId,
            title,
            description,
            category,
            isLimitedTimeOffer,
            offerStartDate,
            offerEndDate,
            price
        } = req.body;


        if (!vendorId || !title || !category) {
            return res.status(400).json(STATUS_400("Vendor ID, Title, and Category are required", false));
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json(STATUS_400("Vendor not found", false));
        }

        const serverUrl = `${req.protocol}://${req.get("host")}`;
        const images = req.files ? req.files.map(file => `${serverUrl}/uploads/${file.filename}`) : [];

        const advertisement = new Advertisement({
            vendorId,
            title,
            description: description || "",
            category,
            isLimitedTimeOffer: isLimitedTimeOffer === 1,
            offerStartDate: isLimitedTimeOffer === 1 ? new Date(offerStartDate) : null,
            offerEndDate: isLimitedTimeOffer === 1 ? new Date(offerEndDate) : null,
            images,
            price: price || 0,
            paymentStatus: "PENDING"
        });

        const savedAd = await advertisement.save();

        const responseData = {
            vendor: {
                name: vendor.name,
                email: vendor.email,
                mobileNumber: vendor.mobileNumber
            },
            advertisement: savedAd
        };

        res.status(200).json(STATUS_200_WITH_DATA(responseData, true, "Advertisement saved successfully"));

    } catch (error) {
        console.error(error);
        res.status(500).json(STATUS_500);
    }
};

const getAllCompletedAdvertisementsByVendor = async (req, res) => {
    try {
        const {vendorId} = req.params;
        const {paymentStatus, page, limit} = req.query;

        if (!vendorId) {
            return res.status(400).json(STATUS_400('Vendor ID is required', false));
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json(STATUS_400("Vendor not found", false));
        }

        const filter = {vendorId};
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus.toUpperCase();
        }

        const skip = (page - 1) * limit;

        const advertisements = await Advertisement.find(filter)
            .sort({createdAt: -1})
            .skip(skip)
            .limit(Number(limit))
            .lean();

        const reviews = await Review.find({vendorId});
        const totalReviews = reviews.length;
        const averageRating = totalReviews
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        const totalAdvertisements = await Advertisement.countDocuments(filter);

        const responseData = {
            advertisements: advertisements.map(ad => ({
                _id: ad._id,
                title: ad.title,
                description: ad.description,
                category: ad.category,
                isLimitedTimeOffer: ad.isLimitedTimeOffer,
                offerStartDate: ad.offerStartDate || null,
                offerEndDate: ad.offerEndDate || null,
                images: ad.images || [],
                price: ad.price,
                createdAt: ad.createdAt,
                vendorId: vendor._id,
                vendorName: vendor.name,
                logo: vendor.logo || null,
                address: vendor.address,
                mobileNumber: vendor.mobileNumber,
                email: vendor.email,
                website: vendor.website,
                averageRating: Number(averageRating.toFixed(1)),
                totalReviews
            })),
            currentPage: Number(page),
            totalPages: Math.ceil(totalAdvertisements / limit)
        };

        res.status(200).json(STATUS_200_WITH_DATA(responseData, true, 'Operation Successfully'));
    } catch (error) {
        console.error("❌ Error fetching advertisements:", error);
        res.status(500).json(STATUS_500);
    }
};

const getAllAdvertisementsForVendor = async (req, res) => {
    try {
        const {vendorId} = req.params;

        if (!vendorId) {
            return res.status(400).json(STATUS_400("Vendor ID is required", false));
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json(STATUS_400("Vendor not found", false));
        }

        const advertisements = await Advertisement.find({vendorId})
            .sort({createdAt: -1})
            .lean();

        const responseObject = {
            vendor: {
                name: vendor.name,
                email: vendor.email,
                mobileNumber: vendor.mobileNumber
            },
            advertisements
        }

        res.status(200).json(STATUS_200_WITH_DATA(responseObject, true, "Operation Successfully"));
    } catch (error) {
        console.error("❌ Error fetching advertisements:", error);
        res.status(500).json(STATUS_500);
    }
}

const updateAdvertisement = async (req, res) => {
    try {
        const {advertisementId} = req.params;

        if (!advertisementId) {
            return res.status(400).json(STATUS_400("Advertisement ID is required", false));
        }

        const existingAd = await Advertisement.findById(advertisementId);
        if (!existingAd) {
            return res.status(404).json(STATUS_400("Advertisement not found", false));
        }

        const {
            title,
            description,
            category,
            isLimitedTimeOffer,
            offerStartDate,
            offerEndDate,
            price,
            paymentStatus
        } = req.body;

        let updatedImages = []
        const serverUrl = `${req.protocol}://${req.get("host")}`;
        if (req.files && req.files.length > 0) updatedImages = req.files.map(file => `${serverUrl}/uploads/${file.filename}`);

        existingAd.title = title || existingAd.title;
        existingAd.description = description || existingAd.description;
        existingAd.category = category || existingAd.category;
        existingAd.isLimitedTimeOffer = isLimitedTimeOffer !== undefined ? isLimitedTimeOffer : existingAd.isLimitedTimeOffer;
        existingAd.offerStartDate = isLimitedTimeOffer && offerStartDate ? new Date(offerStartDate) : existingAd.offerStartDate;
        existingAd.offerEndDate = isLimitedTimeOffer && offerEndDate ? new Date(offerEndDate) : existingAd.offerEndDate;
        existingAd.price = price !== undefined ? price : existingAd.price;
        if (paymentStatus !== undefined) {
            existingAd.paymentStatus = paymentStatus;
        }
        if (req.files && req.files.length > 0) {
            existingAd.images = updatedImages;
        }

        const updatedAd = await existingAd.save();

        res.status(200).json(STATUS_200_WITH_DATA(updatedAd, true, "Advertisement updated successfully"));
    } catch (error) {
        console.error("❌ Error updating advertisement:", error);
        res.status(500).json(STATUS_500);
    }
}

const deleteAdvertisement = async (req, res) => {
    try {
        const {advertisementId} = req.params;

        if (!advertisementId) {
            return res.status(400).json(STATUS_400("Advertisement ID is required", false));
        }

        const existingAd = await Advertisement.findById(advertisementId);
        if (!existingAd) {
            return res.status(404).json(STATUS_400("Advertisement not found", false));
        }

        if (existingAd.images && existingAd.images.length > 0) {
            existingAd.images.forEach(imageUrl => {
                const filePath = path.join(__dirname, "../../uploads", path.basename(imageUrl));
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
        }

        await Advertisement.findByIdAndDelete(advertisementId);

        res.status(200).json(STATUS_200("Advertisement deleted successfully", true));
    } catch (error) {
        console.error("❌ Error deleting advertisement:", error);
        res.status(500).json(STATUS_500);
    }
};

const getFilteredAdvertisements = async (req, res) => {
    try {
        const {
            keyword,
            location,
            category,
            minPrice,
            maxPrice,
            maxRating,
            sortByPrice,
            page,
            limit
        } = req.query;

        const filter = {paymentStatus: "COMPLETED"};

        if (keyword) {
            filter.$or = [
                {title: {$regex: keyword, $options: "i"}},
                {description: {$regex: keyword, $options: "i"}}
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (minPrice !== undefined && maxPrice !== undefined) {
            filter.price = {$gte: Number(minPrice), $lte: Number(maxPrice)};
        } else if (minPrice !== undefined) {
            filter.price = {$gte: Number(minPrice)};
        } else if (maxPrice !== undefined) {
            filter.price = {$lte: Number(maxPrice)};
        }

        let vendorIds = [];
        if (location) {
            const vendors = await Vendor.find({
                location: {$regex: `^${location}$`, $options: "i"}
            });

            vendorIds = vendors.map(v => v._id);

            if (vendorIds.length > 0) {
                filter.vendorId = {$in: vendorIds};
            } else {
                filter.vendorId = null;
            }
        }

        if (maxRating !== undefined) {
            const allVendors = await Vendor.find();

            const matchedVendorIds = await Promise.all(
                allVendors.map(async (vendor) => {
                    const reviews = await Review.find({vendorId: vendor._id});
                    const totalReviews = reviews.length;
                    const averageRating = totalReviews
                        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                        : 0;

                    if (maxRating !== undefined ? averageRating <= maxRating : true) {
                        return vendor._id.toString();
                    }
                    return null;
                })
            );

            vendorIds = matchedVendorIds.filter(id => id !== null);
            if (vendorIds.length > 0) {
                filter.vendorId = {$in: vendorIds};
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        let query = Advertisement.find(filter)
            .populate("vendorId")
            .skip(skip)
            .limit(Number(limit));

        if (sortByPrice) {
            query = query.sort({price: sortByPrice === "asc" ? 1 : -1});
        } else {
            query = query.sort({createdAt: -1});
        }

        const advertisements = await query;

        const formattedAds = await Promise.all(
            advertisements.map(async (ad) => {
                const reviews = await Review.find({vendorId: ad.vendorId._id});
                const totalReviews = reviews.length;
                const averageRating = totalReviews
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                    : 0;

                return {
                    _id: ad._id,
                    title: ad.title,
                    description: ad.description,
                    category: ad.category,
                    isLimitedTimeOffer: ad.isLimitedTimeOffer,
                    offerStartDate: ad.offerStartDate,
                    offerEndDate: ad.offerEndDate,
                    images: ad.images,
                    price: ad.price,
                    createdAt: ad.createdAt,
                    vendorId: ad.vendorId._id,
                    vendorName: ad.vendorId.name,
                    logo: ad.vendorId.logo,
                    address: ad.vendorId.address,
                    mobileNumber: ad.vendorId.mobileNumber,
                    email: ad.vendorId.email,
                    website: ad.vendorId.website,
                    averageRating: Number(averageRating.toFixed(1)),
                    totalReviews
                };
            })
        );

        const totalAdvertisements = await Advertisement.countDocuments(filter);

        const responseData = {
            advertisements: formattedAds,
            currentPage: Number(page),
            totalPages: Math.ceil(totalAdvertisements / limit),
            totalElements: Number(totalAdvertisements)
        };

        res.status(200).json(STATUS_200_WITH_DATA(responseData, true, "Operation Successfully"));
    } catch (error) {
        console.error("❌ Error fetching advertisements:", error);
        res.status(500).json(STATUS_500);
    }
};

const getAdvertisementDetails = async (req, res) => {
    try {
        const {advertisementId} = req.params;

        if (!advertisementId) {
            return res.status(400).json(STATUS_400("Advertisement ID is required", false));
        }

        const advertisement = await Advertisement.findById(advertisementId)
            .populate("vendorId");

        if (!advertisement) {
            return res.status(404).json(STATUS_400("Advertisement not found", false));
        }

        const vendorId = advertisement.vendorId._id;

        const totalCompletedAds = await Advertisement.countDocuments({
            vendorId,
            paymentStatus: "COMPLETED"
        });

        const reviews = await Review.find({vendorId});
        const totalReviews = reviews.length;
        const averageRating = totalReviews
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        const responseData = {
            _id: advertisement._id,
            title: advertisement.title,
            description: advertisement.description,
            category: advertisement.category,
            isLimitedTimeOffer: advertisement.isLimitedTimeOffer,
            offerStartDate: advertisement.offerStartDate || null,
            offerEndDate: advertisement.offerEndDate || null,
            images: advertisement.images || [],
            price: advertisement.price,
            paymentStatus: advertisement.paymentStatus,
            createdAt: advertisement.createdAt,
            vendor: advertisement.vendorId
                ? {
                    _id: advertisement.vendorId._id,
                    name: advertisement.vendorId.name,
                    email: advertisement.vendorId.email,
                    mobileNumber: advertisement.vendorId.mobileNumber || "",
                    address: advertisement.vendorId.address || "",
                    location: advertisement.vendorId.location || "",
                    logo: advertisement.vendorId.logo || null,
                    website: advertisement.vendorId.website || "",
                    verified: advertisement.vendorId.verified || false,
                    totalCompletedAds,
                    averageRating: Number(averageRating.toFixed(1)),
                    totalReviews
                }
                : null
        };

        res.status(200).json(STATUS_200_WITH_DATA(responseData, true, "Operation Successfully"));
    } catch (error) {
        console.error("❌ Error fetching advertisement details:", error);
        res.status(500).json(STATUS_500);
    }
};

module.exports = {
    saveAdvertisement,
    getAllCompletedAdvertisementsByVendor,
    getAllAdvertisementsForVendor,
    updateAdvertisement,
    deleteAdvertisement,
    getFilteredAdvertisements,
    getAdvertisementDetails
};
