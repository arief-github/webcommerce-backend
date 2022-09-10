const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({ success: false })
    }

    res.send(categoryList);
});

router.post(`/`, async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category = await category.save();

    if (!category) {
        return res.status(404).send('the category cannot be created')
    }

    res.send(category);
});

router.delete(`/:id`, async (req, res) => {
    Category.findByIdAndRemove(req.params.id).then((category) => {
    	if(category) {
    		return res.status(200).json({ success: true, message: 'the category is delete' })
    	} else {
    		return res.status(404).json({ success: false, message: 'category not found' })
    	}
    }).catch((err) => {
    	return res.status(400).json({success: false, error: err})
    })
})

module.exports = router;