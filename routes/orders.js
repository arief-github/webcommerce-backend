const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-items');
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orderList) {
        res.status(500).json({ success: false })
    }

    res.send(orderList);
});

router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category'
            }
        });

    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order);
});

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);

    if (!totalSales) {
        return res.status(400).send(' The Order sales cannot be generated ')
    }

    res.send({ totalSales: totalSales.pop().totalSales })
});

router.get('/get/count', async(req, res) => {
    const orderCount = await Order.countDocuments();

    if(!orderCount) {
        res.status(500).json({ success: false })
    }

    res.send({
        orderCount: orderCount
    })
})

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
        console.log(orderItem.product.price);
    }))

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order)
        return res.status(400).send('the order cannot be created!')

    res.send(order);
})

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    }, { new: true });

    if (!order)
        return res.status(400).send('The order cannot be update!');

    res.send(order);
})

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndRemove(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            })
        }

        // also delete the order items
        await OrderItem.deleteMany({ _id: { $in: order.orderItems } })

        res.json({
            success: true,
            message: 'Order deleted',
        })

    } catch (err) {
        return res.status(500).json({
            status: false,
            error: err
        })
    }
})

// other solutions
// router.delete('/:id', (req, res)=>{
//     Order.findByIdAndRemove(req.params.id).then(async order =>{
//         if(order) {
//             await order.orderItems.map(async orderItem => {
//                 await OrderItem.findByIdAndRemove(orderItem)
//             })
//             return res.status(200).json({success: true, message: 'the order is deleted!'})
//         } else {
//             return res.status(404).json({success: false , message: "order not found!"})
//         }
//     }).catch(err=>{
//        return res.status(500).json({success: false, error: err}) 
//     })
// })

module.exports = router;