
const Models = {
    user: {
        name: null,
        role: null,
        contact_info: null
    }, supplier: {
        name: null,
        contact_info: null,
        address: null
    }, product: {
        name: null,
        description: null,
        category: null,
        price: null,
        supplier_id: null
    }, transaction: {
        user_id: null,
        transaction_type: null,
        total_amount: null,
        payment_method: null,
        status: null,
    },
    transaction_item: {
        transaction_id: null,
        product_id: null,
        quantity: null,
        price: null,
    }, inventory: {
        product_id: null,
        quantity_in_stock: null
    }
}
module.exports = Models