# Password Reset Flow - Integration Guide

## ✅ What Has Been Integrated

### Backend
- ✅ User model: Added `resetPasswordToken` and `resetPasswordExpire` fields
- ✅ Email utility: Created `utils/sendEmail.js` using Nodemailer
- ✅ Controller methods: `forgotPassword()` and `resetPassword()` added to `userController.js`
- ✅ Routes: POST `/api/users/forgot-password` and PUT `/api/users/reset-password/:token`
- ✅ Environment variables: Added EMAIL_USER, EMAIL_PASSWORD, FRONTEND_URL to .env

### Frontend
- ✅ ForgotPassword component: `/react/front/src/pages/ForgotPassword.jsx`
- ✅ ResetPassword component: `/react/front/src/pages/ResetPassword.jsx`
- ✅ Routes: Added to `App.jsx` for `/forgot-password` and `/reset-password/:token`
- ✅ Login link: Added "Mot de passe oublié" link to Login page

---

## 🔧 Setup Instructions

### 1. Gmail Configuration (Required)
You need to set up an App Password for Gmail:

1. Go to https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Enable **2-Step Verification** (if not enabled)
4. Search for **App passwords**
5. Select **Mail** and **Windows Computer** (or your device)
6. Copy the 16-character password

### 2. Update .env file
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # The 16-char password from step 1
FRONTEND_URL=http://localhost:5173
```

### 3. Install Dependencies
Verify all required packages are installed:
```bash
npm install nodemailer bcryptjs jsonwebtoken crypto
```

### 4. Start the Backend
```bash
npm run dev
```

### 5. Start the Frontend
```bash
cd react/front
npm run dev
```

---

## 📋 Password Reset Flow

### 1️⃣ Forgot Password
- User clicks "Mot de passe oublié" link on Login page
- Enters email and clicks "Envoyer le lien"
- Backend validates email, generates token (valid 15 minutes), sends email
- Frontend shows success message

### 2️⃣ Email with Reset Link
- User receives email with reset link: `http://localhost:5173/reset-password/{token}`
- User clicks link and is taken to reset password page

### 3️⃣ Reset Password
- User enters new password and confirmation
- Frontend validates passwords match (minimum 6 characters)
- Backend verifies token is still valid
- Password is hashed and saved
- User is redirected to login

---

## 🧪 Testing Locally

### Test ForgotPassword Flow
```bash
# 1. Open browser and go to login page
http://localhost:5173/login

# 2. Click "Mot de passe oublié"
# 3. Enter test email (e.g., admin@demo.com)
# 4. Check email for reset link (in development, check console/logs)
```

### Using Mailtrap for Testing (Alternative to Gmail)
If you want to test without Gmail:
1. Sign up at https://mailtrap.io/
2. Create a project and copy SMTP credentials
3. Update .env:
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=465
EMAIL_USER=your-mailtrap-email
EMAIL_PASSWORD=your-mailtrap-password
```

---

## 🔐 Security Features Implemented

✅ **Token Security**
- Random 32-byte tokens generated with crypto
- Tokens are hashed before storing in database
- Tokens expire after 15 minutes
- Tokens are cleared after successful password reset

✅ **Password Security**
- Passwords are hashed with bcryptjs (salt rounds: 10)
- Password confirmation validation
- Minimum 6-character requirement
- Pre('save') middleware auto-hashes on save

✅ **Privacy**
- Email not revealed if doesn't exist (prevent user enumeration)
- Error messages are generic
- Reset tokens are never exposed in URLs (only valid once)

---

## 📁 Files Changed

### Created
- `utils/sendEmail.js` - Email sending utility
- `react/front/src/pages/ForgotPassword.jsx` - Forgot password component
- `react/front/src/pages/ResetPassword.jsx` - Reset password component

### Modified
- `models/User.js` - Added reset token fields
- `controllers/userController.js` - Added 2 new methods
- `routes/userRoutes.js` - Added 2 new routes
- `react/front/src/App.jsx` - Added new routes
- `react/front/src/pages/Login.jsx` - Added forgot password link
- `.env` - Added email configuration

---

## ❓ Troubleshooting

### "Email not sent"
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Verify Gmail App Password (not regular password)
- Ensure 2-Step Verification is enabled on Gmail account

### "Token invalid or expired"
- Reset link must be used within 15 minutes
- Check database to ensure token is being saved

### "Passwords don't match"
- Frontend validation will catch before backend
- Ensure both fields have exact same value

### CORS Issues
- Backend CORS is configured for http://localhost:5173
- Change if frontend runs on different port
