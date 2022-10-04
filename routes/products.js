const { Product } = require('../models/product');
const { Category } = require('../models/category');
const express = require('express');
const mongoose = require('mongoose');
const multer  = require('multer');
const router = express.Router();

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

// setup multer for uploading file
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');

        if(isValid) {
            uploadError = null;
        }

        cb(uploadError, 'public/uploads')
    },
    filename: function(req, file, cb) {
        const fileName = file.originalname.replace(' ', '-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        const uniqueSuffix = `${fileName}-${Date.now()}.${extension}`;
        cb(null, fileName + '-' + uniqueSuffix)
    }
})

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    // show product with complete information
    // const productList = await Product.find();

    // show product just showing name, image. but id is removed.
    // const productList = await Product.find().select('name image -_id');

    // query parameters for filtering product
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') }
    }

    // populate product to category reference
    const productList = await Product.find(filter).populate('category');
    if (!productList) {
        res.status(500).json({ success: false })
    }

    res.send(productList);
});

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(500).json({ success: false });
    }

    res.send(product);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    // check validate if front-end send invalid category
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')

    // check validate if front end not send image file
    const file = req.file;
    if (!file) return res.status(400).send('No Images are uploaded')
    
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if (!product)
        return res.status(500).send('The product cannot be created')

    res.send(product);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    // validation id 
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    if(file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        }, { new: true }
    )

    if (!updatedProduct)
        return res.status(500).send('the product cannot be updated!')

    res.send(updatedProduct);
});

router.delete(`/:id`, async (req, res) => {
    Product.findByIdAndRemove(req.params.id).then((product) => {
        if (product) {
            return res.status(200).json({ success: true, message: 'the product is delete' })
        } else {
            return res.status(404).json({ success: false, message: 'product not found' })
        }
    }).catch((err) => {
        return res.status(500).json({ success: false, error: err })
    })
});

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();

    if (!productCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        productCount: productCount
    });
});

router.get(`/get/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false });
    }

    res.send(products);
})

module.exports = router;