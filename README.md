# 💳 PayPal Project

A Node.js backend application integrating PayPal payment functionality with user authentication and structured API routes.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB, Mongoose
* **Payments:** PayPal Checkout Server SDK
* **Authentication:** JWT, bcrypt
* **Security & Validation:** Helmet, Express Rate Limit, Express Validator

## 📁 Project Structure

```text
paypal_project/
├── controllers/   # Request handling
├── middleware/    # Middleware functions
├── models/        # Database models
├── routes/        # API routes
├── services/      # Business logic and services
├── public/        # Public assets
├── server.js      # Application entry point
└── package.json   # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

* Node.js
* MongoDB
* PayPal developer credentials

### Installation

```bash
git clone https://github.com/pohwanimohit/paypal_project.git
cd paypal_project
npm install
```

### Configuration

Create a `.env` file and configure the environment variables required by the application, including database connection details and PayPal credentials.

Never commit secrets or API credentials to GitHub.

### Run the Application

Check `server.js` for the application entry point and configure an appropriate start command in `package.json` before running it.

## 🎯 Purpose

Explore backend development, payment integration, API design, authentication, and security practices using the Node.js ecosystem.

## 👨‍💻 Author

**Mohit Pohwani**

[GitHub](https://github.com/pohwanimohit) · [LinkedIn](https://www.linkedin.com/in/mohit-pohwani-07b1b01ab/)
