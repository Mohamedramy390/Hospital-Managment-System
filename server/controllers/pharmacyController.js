const Pharmacy = require('../models/Pharmacy');

exports.getMedicine = async (req, res) => {
    try {
        const [meds] = await Pharmacy.getMedicine();
        res.json(meds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInventory = async (req, res) => {
    try {
        const [inv] = await Pharmacy.getInventory();
        res.json(inv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInventoryWithWarnings = async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;
        const [inv] = await Pharmacy.getInventoryWithWarnings(threshold);
        res.json(inv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLowStockMedicines = async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;
        const [meds] = await Pharmacy.getLowStockMedicines(threshold);
        res.json(meds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getExpiringMedicines = async (req, res) => {
    try {
        const days = req.query.days || 30;
        const [meds] = await Pharmacy.getExpiringMedicines(days);
        res.json(meds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addMedicine = async (req, res) => {
    try {
        const [result] = await Pharmacy.addMedicine(req.body.name);
        res.status(201).json({ message: 'Medicine added', medicineId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addBatch = async (req, res) => {
    try {
        const batchId = await Pharmacy.addBatch(req.body);
        res.status(201).json({ message: 'Batch added successfully', batchId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateInventory = async (req, res) => {
    try {
        await Pharmacy.updateInventoryQuantity(req.params.inventoryId, req.body.quantity);
        res.json({ message: 'Inventory updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.dispense = async (req, res) => {
    try {
        await Pharmacy.dispenseMedicine(req.body);
        res.json({ message: 'Medicine dispensed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
