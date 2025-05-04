# Gourmet Haven - Restaurant Management System

![App Screenshot](/static/images/screenshot.png)

A complete restaurant management system with online reservations, menu ordering, and admin dashboard.

## Features

- 📱 Responsive design for all devices
- 🍽️ Interactive menu with categories
- 📅 Online reservation system
- 🛒 Order management with cart
- 👨‍🍳 Admin dashboard
- 🔒 User authentication

## Quick Start

1. Clone repo:
```bash
git clone https://github.com/yourusername/restaurant-system.git
cd restaurant-system
```

2. Create virtual environment:

```bash
python -m venv venv
# Windows: venv\Scripts\activate
source venv/bin/activate
```

3. Install requirements:

```bash
pip install -r requirements.txt
```

4. Run application:

```bash
python main.py
```

Project Structure :
restaurant.
├── instance/          # Database files
├── static/            # CSS, JS, images
├── templates/         # HTML templates
├── website/           # Flask application
│   ├── __init__.py
│   ├── auth.py        # Authentication routes
│   ├── models.py      # Database models
│   └── views.py       # Main routes
└── main.py            # Entry point

