from . import db
from flask_login import UserMixin
from sqlalchemy.sql import func

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    last_name = db.Column(db.String(150))
    phone = db.Column(db.String(20))
    is_staff = db.Column(db.Boolean, default=False)
    reservations = db.relationship('Reservation', backref='customer', lazy=True)
    orders = db.relationship('Order', backref='customer', lazy=True)

class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(150))
    phone_number = db.Column(db.String(20))
    email = db.Column(db.String(150))
    reservation_date = db.Column(db.Date)
    reservation_time = db.Column(db.Time)
    party_size = db.Column(db.Integer)
    special_requests = db.Column(db.Text)
    table_number = db.Column(db.Integer)
    status = db.Column(db.String(50), default='pending')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2))
    category = db.Column(db.String(100))
    image_path = db.Column(db.String(255))
    is_available = db.Column(db.Boolean, default=True)
    order_items = db.relationship('OrderItem', backref='menu_item', lazy=True)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    order_date = db.Column(db.DateTime, default=func.now())
    status = db.Column(db.String(50), default='pending')
    total_amount = db.Column(db.Numeric(10, 2))
    special_requests = db.Column(db.Text)
    items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'))
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id'))
    quantity = db.Column(db.Integer)
    special_requests = db.Column(db.Text)