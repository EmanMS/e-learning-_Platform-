# 🎓 E-Learn - Full Stack Learning Management System (LMS)

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue?style=for-the-badge&logo=react)
![Django](https://img.shields.io/badge/Backend-Django%20REST%20Framework-092E20?style=for-the-badge&logo=django)
![Stripe](https://img.shields.io/badge/Payment-Stripe%20Integration-635BFF?style=for-the-badge&logo=stripe)
![Bootstrap](https://img.shields.io/badge/UI-Bootstrap%205-7952B3?style=for-the-badge&logo=bootstrap)

> A modern, responsive E-Learning platform connecting instructors and students. Built with **Django** (Backend) and **React** (Frontend), featuring secure payments, video streaming, progress tracking, and automated PDF certification.

---

## 🌟 Key Features

### 👨‍🎓 For Students
*   **Browse & Search:** Advanced search & filtering system (Live Search).
*   **Enrollment:** Secure checkout using **Stripe Payment Gateway**.
*   **Learning Experience:** Interactive video player & lesson tracking.
*   **Progress:** Visual progress bar & course completion status.
*   **Certificates:** Automated **PDF Certificate** generation upon 100% completion.
*   **Interaction:** Review & Rating system.
*   **Wishlist:** Save courses for later.

### 👨‍🏫 For Instructors
*   **Instructor Studio:** Dedicated dashboard to manage content.
*   **Course Management:** Create, Edit, and Delete courses easily.
*   **Content Creation:** Add video lessons & descriptions via Rich Text Editor.
*   **Analytics:** Track enrolled students and revenue.

### 👑 For Admins
*   **Super Dashboard:** Complete overview of system statistics.
*   **User Management:** Manage Instructors and Students.
*   **Content Moderation:** Approve, edit, or delete courses.

### 🎨 UI/UX Features
*   **Dark/Light Mode:** Fully supported theme toggling.
*   **Responsive Design:** Works perfectly on Desktop, Tablet, and Mobile.
*   **Smooth Animations:** Powered by `Framer Motion`.
*   **Skeleton Loading:** Enhanced user experience during data fetching.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React (Vite), React Router, Axios, Bootstrap 5, Framer Motion |
| **Backend** | Python, Django, Django REST Framework (DRF) |
| **Database** | SQLite (Dev) / PostgreSQL (Prod ready) |
| **Auth** | JWT (JSON Web Tokens) - SimpleJWT |
| **Payment** | Stripe API |
| **Tools** | ReportLab (PDFs), React Quill (Rich Text), SweetAlert2 |

---

## 📸 Screenshots

![Home Page]
<div>
<img width="2500" height="2000" alt="Image" src="https://github.com/user-attachments/assets/6b985db8-f645-4f10-91c8-20974ef970dc" />
</div>

![ِDashboard]
<div>
<img width="1500" height="2000" alt="Image" src="https://github.com/user-attachments/assets/a29098b4-0ef9-431e-93fd-661c69630cdb" />
</div>

![Course Detail]
<div>
<img width="1500" height="1834" alt="Image" src="https://github.com/user-attachments/assets/d307752b-ca34-436f-815b-129fc557dd0e" /></div>

![Sign up page]

<div>
<img width="1920" height="1417" alt="Image" src="https://github.com/user-attachments/assets/e8f4049e-a66c-47cd-b44f-34c7b9627085" /></div>

![login page]
<div>
<img width="1800" height="1000" alt="Image" src="https://github.com/user-attachments/assets/f8ff047f-5e3b-4fb1-814e-403bb4164310" /></div>

![ProfileSetting page]
<div>
<img width="1800" height="1500" alt="Image" src="https://github.com/user-attachments/assets/40cb4809-5958-4d9b-8d12-97e184b7194b" />
</div>

![Wishlist page]

<div>
<img width="1800" height="1000" alt="Image" src="https://github.com/user-attachments/assets/1a74b835-084b-4efa-a32f-6e6dc52ff39c" /></div>

## 🚀 How to Run Locally

Follow these steps to set up the project on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/EmanMS/e-learning-_Platform-.git
cd e-learning-_Platform


# Enter backend folder: root
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Database Migrations
python manage.py makemigrations
python manage.py migrate

# Create Admin User
python manage.py createsuperuser

# Run Server
python manage.py runserver


# Open new terminal & navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run Frontend
npm run dev



#Environment Variables (.env)
Create a .env file in the root directory and add the following keys:
SECRET_KEY=your_django_secret_key
DEBUG=True
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

#Made with ❤️ by Eman Salem
