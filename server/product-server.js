const Product = require("../models/productMode");

const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadImageMix } = require("../middlewares/uploadImage");

const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handlerFactory");
const { asyncErrorHandler } = require("express-error-catcher");
const { uploadImage } = require("../utils/cloudinaryCofig");

const uploadProductImage = uploadImageMix("imgCover", "images");

const resizeImageProducts = asyncErrorHandler(async (req, res, next) => {
  if (req.files) {
    if (req.files.imgCover) {
      const imgCoverFileName = `product-${uuidv4()}-${Date.now()}.jpeg`;
      const tempFile = `/tmp/${imgCoverFileName}`;
      await sharp(req.files.imgCover[0].buffer).toFile(`/${tempFile}`);

      const result = uploadImage(tempFile);
      req.body.imgCover = result.url;
    }
    if (req.files.images) {
      req.body.images = [];
      Promise.all(
        req.files.images.map(async (img) => {
          const imagesFileName = `product-${uuidv4()}-${Date.now()}.jpeg`;
          const tempFile = `/tmp/${imagesFileName}`;
          await sharp(img.buffer).toFile(`${tempFile}`);

          const result = uploadImage(tempFile);
          req.body.images.push(result.url);
        })
      );
    }
  }
  next();
});

const createProduct = createOne(Product);

const getAllProduct = getAll(Product);

const getProduct = getOne(Product, "reviews");
const updateProduct = updateOne(Product);
const deleteProduct = deleteOne(Product);

module.exports = {
  createProduct,
  getAllProduct,

  getProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  resizeImageProducts,
};
