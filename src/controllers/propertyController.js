import Property from "../models/propertyModel.js";
import "../models/reviewModel.js";
import "../models/userModel.js";

//================================================

export const addProperty = async (req, res) => {
  try {
    const {
      name,
      images,
      rentPerMonth,
      currency,
      address,
      longitude,
      latitude,
      bedrooms,
      bathrooms,
      area,
      yearBuilt,
      parking,
      description,
    } = req.body;

    const newProperty = await Property.create({
      name,
      images,
      rentPerMonth,
      currency,
      address,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      bedrooms,
      bathrooms,
      area,
      yearBuilt,
      parking,
      description,
      agent: req.user._id, // From protect middleware
    });

    res.status(201).json({
      success: true,
      data: newProperty,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//================================================

export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate(
      "agent",
      "name image profession",
    );
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//================================================

export const getRecommendedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      averageRating: { $gte: 3.5 },
    })
      .sort({ averageRating: -1 })
      .limit(10)
      .select("name images rentPerMonth address");

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//================================================

export const getPopularProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      ratingCount: { $gt: 0 },
    })
      .sort({ ratingCount: -1, averageRating: -1 })
      .limit(10)
      .select("name images rentPerMonth address");

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//================================================

export const getNearbyProperties = async (req, res) => {
  try {
    const { longitude, latitude, start, limit } = req.query;
    const arrayOfNumbers = [latitude, latitude, start, limit].map((num) =>
      Number(num),
    );
    const [latitudeNumber, longitudeNumber, startNumber, limitNumber] =
      arrayOfNumbers;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide both longitude and latitude query parameters",
      });
    }

    // 100km radius = 100000 meters
    const properties = await Property.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(longitudeNumber),
              parseFloat(latitudeNumber),
            ],
          },
          $maxDistance: 100000,
        },
      },
    })
      .select("name images rentPerMonth address averageRating ratingCount")
      .skip(startNumber)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//================================================

export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id)
      .populate("agent", "name image phone profession")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          model: "User",
        },
      });
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
