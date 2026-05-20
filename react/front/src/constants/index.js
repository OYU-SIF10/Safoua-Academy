export const ROLES = {
  STUDENT: 'etudiant',
  TEACHER: 'enseignant',
  ADMIN: 'admin',
};

export const ROLE_ROUTES = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.TEACHER]: '/enseignant',
  [ROLES.STUDENT]: '/catalogue',
};

export const LEVEL_COLORS = {
  'Débutant': 'bg-[#1a7a4a] text-white',
  'Intermédiaire': 'bg-amber-100 text-amber-700',
  'Expert': 'bg-gray-800 text-white',
  'Avancé': 'bg-blue-100 text-blue-700',
};
