const productService = require('../services/productService');
const list = async (req, res) => res.json({ success: true, data: await productService.list(req.validated.query) });
const get = async (req, res) => res.json({ success: true, data: await productService.get(req.validated.params.id) });
const create = async (req, res) => res.status(201).json({ success: true, data: await productService.create(req.validated.body) });
const update = async (req, res) => res.json({ success: true, data: await productService.update(req.validated.params.id, req.validated.body) });
const remove = async (req, res) => { await productService.remove(req.validated.params.id); res.status(204).send(); };
module.exports = { list, get, create, update, remove };
