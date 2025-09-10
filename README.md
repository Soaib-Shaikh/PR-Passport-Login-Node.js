# Blog-Project 


A **full-featured blogging platform** built with **Node.js, Express, MongoDB, Passport.js, Multer, and Cloudinary**.  
It allows users to **sign up, log in, create, edit, delete, search, and view blog posts** with image upload support.  
All uploaded images are stored both **locally** and on **Cloudinary**.  

**Live Demo:** 

Deploy Link:-  https://pr-passport-login-node-js.onrender.com

# Output: 

1. Signup page 

![alt text](./output/signup.png) 

2. loginup page 

![alt text](./output/login.png) 

3. Home page 

![alt text](./output/blogHome.png) 

4. createBlog page 

![alt text](./output/createBlog.png) 

5. searchBlog page 

![alt text](./output/searchBlog.png) 

6. Profile page 

![alt text](./output/profile.png) 

7. EditProfile 

![alt text](./output/editProfile.png) 

8. Change Password 

![alt text](./output/changePassword.png) 


## ✨ Features  

- 🔐 User Authentication with **Passport.js** (local strategy)  
- 📝 User Registration, Login, Logout, and Session Management  
- 🔎 **Search Blogs** by title, tags, or keywords  
- 📚 **CRUD** Operations (Create, Read, Update, Delete) for Blog Posts  
- 🖼️ Upload and manage blog cover images (stored **locally** & on **Cloudinary**)  
- ❤️ Like and 💬 Comment on blog posts  
- 👤 Profile Management (Edit Profile, Update Profile Picture)  
- 🔑 Change Password functionality  
- ✅ Secure user authorization (only owners can edit/delete their posts)  
- 📢 Flash Messages & Error Handling  
- 📱 Responsive UI with **Bootstrap** + custom CSS  
- 🌐 SEO-friendly dynamic routes (`/blog/:id`, `/user/:username`) 

## Folder Structure
/project-root
├── /configs # Configuration files (Cloudinary, DB, etc.)
├── /controllers # Controller files for business logic (postController.js)
├── /middlewares # Middlewares like upload handlers (multer)
├── /models # Mongoose schemas: User, Post
├── /public # Static files + local uploads
│ └── /uploads # Locally stored images
├── /routers # Route definitions
├── /views # EJS templates for rendering pages
│ ├── /pages
│ │ ├── /blog # Blog related views
│ │ └── /writer # Writer views
├── index.js # Main Express app setup and entry point
├── package.json # Node dependencies and scripts
└── README.md # This file


## Installation & Setup

1. Clone the repository:
bash git clone

2. Install dependencies:
bash npm install

3. Set up environment variables in a `.env` file:

- env DB_URL=mongodb+srv://soaibshaikh:12345@blog-project.e6ptai6.mongodb.net/blog_project - SESSION_SECRET=soaib1002 
- CLOUDINARY_CLOUD_NAME=dav5tpyet 
- CLOUDINARY_KEY=213397776336737 
- CLOUDINARY_SECRET=vly7gGGczXqMYiEXMa2GLQnvFJ0

4. Run the application:
bash npm start

5. Access the app at `http://localhost:8081`.

---

## 🛠️ Technologies Used

- Backend: Node.js, Express.js

- Database: MongoDB, Mongoose

- Authentication: Passport.js (Local Strategy), bcrypt

- File Uploads: Multer, Cloudinary SDK

- Frontend: EJS, Bootstrap, CSS3, JavaScript (ES6+)

- Session Management: express-session, connect-mongo

- Other Tools: dotenv, morgan, flash messages
---

## 👨‍💻 Usage

- Register and log in using your credentials.
- Create, edit, and delete blog posts with images. 
- Search blogs by keywords or titles.
- Like and comment on posts.
- Manage your profile, update details, and change password securely.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---