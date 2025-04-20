import express from 'express';
import Resource from '../models/Resource.js';
import Module from '../models/Module.js';
import auth from '../middleware/auth.js';
import { isTeacher } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all resources for a module
router.get('/module/:moduleId', async (req, res) => {
  try {
    const resources = await Resource.find({ module: req.params.moduleId })
      .sort('order');
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
});

// Get single resource
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resource', error: error.message });
  }
});

// Create resource
router.post('/', async (req, res) => {
  try {
    const { title, type, content, module, order } = req.body;

    // Verify module exists
    const moduleExists = await Module.findById(module);
    if (!moduleExists) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const resource = new Resource({
      title,
      type,
      content,
      module,
      order
    });

    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error creating resource', error: error.message });
  }
});

// Update resource
router.put('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error updating resource', error: error.message });
  }
});

// Delete resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource', error: error.message });
  }
});

export default router; 