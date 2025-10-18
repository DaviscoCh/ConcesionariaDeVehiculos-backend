// src/services/persona.service.js
const model = require('../models/persona.models');

exports.getAllPersonas = async () => {
    return await model.findAll();
};

exports.getPersonaById = async (id) => {
    return await model.findById(id);
};

exports.createPersona = async (data) => {
    return await model.create(data);
};

exports.updatePersona = async (id, data) => {
    return await model.update(id, data);
};

exports.deletePersona = async (id) => {
    return await model.remove(id);
};

exports.searchPersonasByName = async (name) => {
    return await model.searchByName(name);
};

exports.getPersonaByCorreo = async (correo) => {
    return await model.findByCorreo(correo);
};
