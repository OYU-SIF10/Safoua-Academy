const Course = require('../models/Course');

// GET /api/categories
// → Liste toutes les catégories avec statistiques
const getAllCategories = async (req, res) => {
  try {
    const categories = ['Coran', 'Langue Arabe', 'Sciences Islamiques'];
    const languages = ['Arabe', 'Français', 'Anglais'];
    const levels = ['Débutant', 'Intermédiaire', 'Avancé'];

    const result = await Promise.all(
      categories.map(async (categorie) => {
        const [count, courses] = await Promise.all([
          Course.countDocuments({ categorie, est_publie: true }),
          Course.find({ categorie, est_publie: true })
            .populate('enseignant_id', 'nom email')
            .select('-lecons')
            .sort({ nombre_inscrits: -1, note_moyenne: -1 })
            .limit(3), // 3 top courses
        ]);

        return {
          nom: categorie,
          total_cours: count,
          featured_courses: courses,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/categories/:categorie
// → Récupère tous les cours d'une catégorie avec pagination
const getCoursesByCategory = async (req, res) => {
  try {
    const { categorie } = req.params;
    const { page = 1, limit = 10, niveau, langue } = req.query;

    const validCategories = ['Coran', 'Langue Arabe', 'Sciences Islamiques'];
    if (!validCategories.includes(categorie)) {
      return res.status(400).json({
        success: false,
        message: `Catégorie invalide. Valides: ${validCategories.join(', ')}`,
      });
    }

    const filter = { categorie, est_publie: true };
    if (niveau) filter.niveau = niveau;
    if (langue) filter.langue = langue;

    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('enseignant_id', 'nom email')
        .select('-lecons')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Course.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      categorie,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/categories/stats
// → Statistiques globales de toutes les catégories
const getCategoriesStats = async (req, res) => {
  try {
    const stats = await Course.aggregate([
      { $match: { est_publie: true } },
      {
        $group: {
          _id: '$categorie',
          total_cours: { $sum: 1 },
          total_inscrits: { $sum: '$nombre_inscrits' },
          note_moyenne: { $avg: '$note_moyenne' },
        },
      },
      { $sort: { total_inscrits: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCoursesByCategory,
  getCategoriesStats,
};
