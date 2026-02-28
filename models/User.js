const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  mot_de_passe: { type: String, required: true },      // ✅ renommé
  photo_profil: { type: String, default: null },        // ✅ renommé
  role: {
    type: String,
    enum: ['admin', 'etudiant', 'enseignant'],
    default: 'etudiant',
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('mot_de_passe')) return next();  // ✅ cohérent
  const salt = await bcrypt.genSalt(10);
  this.mot_de_passe = await bcrypt.hash(this.mot_de_passe, salt);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.mot_de_passe); // ✅ cohérent
};

module.exports = mongoose.model('User', userSchema);