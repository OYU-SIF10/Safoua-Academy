///// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect, authorizeRoles } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.post(
  "/register",
  upload.single("image"),  // ← champ image
  userController.register
);


router.post("/register", userController.register);
router.post("/login", userController.login);

// 🔒 route protégée admin uniquement
router.post(
  "/ajouter",
  protect,
  authorizeRoles("admin"),
  userController.ajouterUtilisateur
);


// 🔒 route protégée
router.get("/", protect,authorizeRoles("admin") ,userController.listerUtilisateurs);



router.post("/ajouter", userController.ajouterUtilisateur);
router.get("/", userController.listerUtilisateurs);
router.get("/:id", userController.getUtilisateurById);
router.put("/:id", userController.updateUtilisateur);
router.delete("/:id", userController.deleteUtilisateur);


module.exports = router;
