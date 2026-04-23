import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
    },
    rentPerMonth: {
      type: Number,
      required: [true, "Rent amount is required"],
    },
    currency: {
      type: String,
      default: "USD",
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Coordinates are required"],
      },
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    yearBuilt: {
      type: Number,
    },
    parking: {
      type: String,
    },
    status: {
      type: String,
      enum: ["For Rent", "Rented", "Sold", "For Sale"],
      default: "For Rent",
    },
    description: {
      type: String,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be above 0"],
      max: [5, "Rating must be below 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Property must belong to an agent"],
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Create a 2dsphere index for location
propertySchema.index({ location: "2dsphere" });

const Property = mongoose.model("Property", propertySchema);

export default Property;
