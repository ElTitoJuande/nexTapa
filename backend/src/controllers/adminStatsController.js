// controllers/adminStatsController.js
import Establishment from "../models/Establishment.model.js";
import Item from "../models/Item.model.js";
import User from "../models/User.model.js";
import Review from "../models/Review.model.js";

export const getAdminStats = async (req, res) => {
  try {
    const [
      establishments,
      establishmentsActive,
      establishmentsPending,
      items,
      itemsActive,
      users,
      clients,
      hosteleros,
      hostelerosVerified,
      reviews,
    ] = await Promise.all([
      Establishment.countDocuments({ deleted: { $ne: true } }),
      Establishment.countDocuments({ deleted: { $ne: true }, active: true }),
      Establishment.countDocuments({ deleted: { $ne: true }, verified: false }),
      Item.countDocuments({ deleted: { $ne: true } }),
      Item.countDocuments({ deleted: { $ne: true }, available: true }),
      User.countDocuments({ active: true }),
      User.countDocuments({ active: true, role: "cliente" }),
      User.countDocuments({ active: true, role: "hostelero" }),
      User.countDocuments({ active: true, role: "hostelero", verified: true }),
      Review.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        establishments,
        establishmentsActive,
        establishmentsPending,
        items,
        itemsActive,
        users,
        clients,
        hosteleros,
        hostelerosVerified,
        reviews,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error obteniendo estadísticas",
        error: error.message,
      });
  }
};
