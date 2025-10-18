const Persona = require('../services/persona.service');

// Obtener todas las personas
exports.getAll = async (req, res) => {
    try {
        const data = await Persona.getAllPersonas();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Obtener una persona por ID
exports.getById = async (req, res) => {
    try {
        const data = await Persona.getPersonaById(req.params.id);
        if (!data) return res.status(404).json({ error: 'Persona no encontrada' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear una nueva persona
exports.create = async (req, res) => {
    try {
        const data = await Persona.createPersona(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar una persona por ID
exports.update = async (req, res) => {
    try {
        const data = await Persona.updatePersona(req.params.id, req.body);
        if (!data) return res.status(404).json({ error: 'Persona no encontrada' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Eliminar una persona por ID
exports.remove = async (req, res) => {
    try {
        const data = await Persona.deletePersona(req.params.id);
        if (!data) return res.status(404).json({ error: 'Persona no encontrada' });
        res.json({ message: 'Persona eliminada exitosamente', data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Buscar personas por nombre
exports.search = async (req, res) => {
    try {
        const name = req.params.name;
        if (!name) return res.status(400).json({ error: 'Debe proporcionar un nombre para buscar' });

        const data = await Persona.searchPersonasByName(name);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getByCorreo = async (req, res) => {
    try {
        const correo = req.query.correo?.trim().toLowerCase();
        console.log('📤 Enviando correo al servicio:', correo); // ← Aquí

        if (!correo) return res.status(400).json({ error: 'Debe proporcionar un correo' });

        const data = await Persona.getPersonaByCorreo(correo);
        console.log('📥 Recibido desde el servicio:', data); // ← Aquí

        if (!data) {
            return res.status(404).json({ error: 'Persona no encontrada' });
        }

        res.json(data);
    } catch (err) {
        console.error('❌ Error en getByCorreo:', err);
        res.status(500).json({ error: err.message || 'Error interno' });
    }
};
