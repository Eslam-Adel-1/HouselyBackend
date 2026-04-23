import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (propertyId) {
  const stats = await this.aggregate([
    { $match: { property: propertyId } },
    {
      $group: {
        _id: "$property",
        ratingCount: { $sum: 1 },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Property").findByIdAndUpdate(propertyId, {
      ratingCount: stats[0].ratingCount,
      averageRating: stats[0].averageRating,
    });
  } else {
    await mongoose.model("Property").findByIdAndUpdate(propertyId, {
      ratingCount: 0,
      averageRating: 0,
    });
  }
};

// Call calcAverageRating after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.property);
});

// Call calcAverageRating before remove (or using findOneAndDelete)
reviewSchema.post("remove", function () {
  this.constructor.calcAverageRating(this.property);
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
