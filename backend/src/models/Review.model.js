import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    establishment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Establishment",
      default: null,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "La valoración debe ser un número entero",
      },
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  { user: 1, establishment: 1 },
  {
    unique: true,
    partialFilterExpression: { establishment: { $ne: null } },
  },
);
reviewSchema.index(
  { user: 1, item: 1 },
  {
    unique: true,
    partialFilterExpression: { item: { $ne: null } },
  },
);

reviewSchema.pre("save", function () {
  if (!this.establishment && !this.item)
    throw new Error(
      "La valoración debe pertenecer a un establecimiento o a una tapa",
    );
  if (this.establishment && this.item)
    throw new Error("La valoración no puede pertenecer a ambos a la vez");
});
const Review = mongoose.model("Review", reviewSchema);
export default Review;
