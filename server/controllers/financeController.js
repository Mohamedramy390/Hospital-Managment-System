const Finance = require('../models/Finance');

exports.generateInvoice = async (req, res) => {
    try {
        const invoiceId = await Finance.generateInvoice(req.params.visitId);
        res.status(201).json({ message: 'Invoice generated', invoiceId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Finance.getInvoice(req.params.invoiceId);
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVisitInvoices = async (req, res) => {
    try {
        const [invoices] = await Finance.getInvoicesByVisit(req.params.visitId);
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.processPayment = async (req, res) => {
    try {
        await Finance.addPayment(req.body);
        res.status(201).json({ message: 'Payment processed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllInvoices = async (req, res) => {
    try {
        const [invoices] = await Finance.getAll();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
