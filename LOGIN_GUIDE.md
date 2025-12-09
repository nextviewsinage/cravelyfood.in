# 🔐 LOGIN TESTING GUIDE - Food Delivery App

## Current Status
✅ Django Server: Running on http://127.0.0.1:8000
✅ React App: Running on http://localhost:3000
✅ Admin User: Created with credentials

---

## Admin Credentials (Already Created)
```
Username: admin
Password: admin@123
```

---

## How to Test Login

### Step 1: Open React App
1. Go to http://localhost:3000
2. You should see the Food Delivery homepage

### Step 2: Click Login
1. Click the red "Login" button in the top right of Navbar
2. You'll be redirected to `/login` page

### Step 3: Enter Credentials
1. **Username field:** Enter `admin`
2. **Password field:** Enter `admin@123`
3. Click the "🔓 Login" button

### Step 4: Expected Behavior
✅ If login is successful:
- Tokens saved to localStorage
- Redirect to home page
- Navbar "Login" button changes to "Logout"

❌ If login fails:
- Error message will display below the form
- Check browser console for detailed error (F12 → Console)

---

## Testing Protected Routes

### Access Profile Page
1. Click "Profile" in Navbar
2. If logged in: Shows profile content
3. If NOT logged in: Redirects to login page

### Access Orders Page
1. Click "Orders" in Navbar
2. If logged in: Shows orders content
3. If NOT logged in: Redirects to login page

---

## API Endpoints (For Reference)

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/auth/token/` | Login |
| POST | `/api/auth/register/` | Register |
| POST | `/api/auth/token/refresh/` | Refresh Token |
| GET | `/api/auth/profile/` | Get User Profile |

---

## Troubleshooting

### Issue: "Connection refused" error
**Solution:** Make sure Django server is running
```bash
cd D:\mysite\mysite
python manage.py runserver
```

### Issue: "Invalid credentials" error
**Solution:** Check username and password
- Username: `admin` (case-sensitive)
- Password: `admin@123`

### Issue: Login button not working
**Solution:** Check browser console for errors
1. Press F12 in browser
2. Go to "Console" tab
3. Look for red error messages
4. Share the error message

### Issue: CORS error
**Solution:** Already configured in Django settings.py
- CORS_ALLOWED_ORIGINS includes localhost:3000

---

## Register New User (Optional)

If you want to create a new user:

1. Go to http://localhost:3000/register
2. Fill in the form:
   - Username (required)
   - First Name (optional)
   - Last Name (optional)
   - Email (required)
   - Password (required)
   - Confirm Password (required)
3. Click "✨ Sign Up"
4. You'll be redirected to login page
5. Login with your new credentials

---

## Logout

Click the "Logout" button in the Navbar (only visible when logged in).

This will:
- Clear localStorage tokens
- Redirect to login page
- Navbar changes back to "Login" button

---

**Ready to test? Go to http://localhost:3000 and click Login!** 🚀
