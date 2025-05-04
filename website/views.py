from flask import Blueprint, render_template, request, flash, jsonify, redirect, url_for
from flask_login import login_required, current_user
from .models import User, Reservation, MenuItem, Order, OrderItem
from . import db
from datetime import datetime
import json

views = Blueprint('views', __name__)

@views.route('/')
def home():
    menu_items = MenuItem.query.filter_by(is_available=True).all()
    return render_template("home.html", user=current_user, menu_items=menu_items)

@views.route('/menu')
def menu():
    categories = db.session.query(MenuItem.category).distinct().all()
    menu_items = MenuItem.query.filter_by(is_available=True).all()
    return render_template("menu.html", user=current_user, menu_items=menu_items, categories=categories)

@views.route('/reservations', methods=['GET', 'POST'])
@login_required
def reservations():
    if request.method == 'POST':
        customer_name = request.form.get('customer_name')
        phone_number = request.form.get('phone_number')
        email = request.form.get('email')
        reservation_date = request.form.get('reservation_date')
        reservation_time = request.form.get('reservation_time')
        party_size = request.form.get('party_size')
        special_requests = request.form.get('special_requests')
        table_number = request.form.get('table_number')

        try:
            reservation_date = datetime.strptime(reservation_date, '%Y-%m-%d').date()
            reservation_time = datetime.strptime(reservation_time, '%H:%M').time()
            party_size = int(party_size)
            table_number = int(table_number) if table_number else None

            new_reservation = Reservation(
                customer_name=customer_name,
                phone_number=phone_number,
                email=email,
                reservation_date=reservation_date,
                reservation_time=reservation_time,
                party_size=party_size,
                special_requests=special_requests,
                table_number=table_number,
                user_id=current_user.id
            )
            db.session.add(new_reservation)
            db.session.commit()
            flash('Reservation created successfully!', category='success')
            return redirect(url_for('views.my_reservations'))
        except Exception as e:
            flash('Error creating reservation: ' + str(e), category='error')

    return render_template("reservations.html", user=current_user)

@views.route('/my-reservations')
@login_required
def my_reservations():
    reservations = Reservation.query.filter_by(user_id=current_user.id).order_by(Reservation.reservation_date.desc()).all()
    return render_template("my_reservations.html", user=current_user, reservations=reservations)

@views.route('/place-order', methods=['POST'])
@login_required
def place_order():
    if request.method == 'POST':
        try:
            cart = json.loads(request.form.get('cart'))
            special_requests = request.form.get('special_requests')
            
            # Calculate total amount
            total = 0
            for item in cart:
                menu_item = MenuItem.query.get(item['id'])
                total += menu_item.price * item['quantity']
            
            # Create order
            new_order = Order(
                user_id=current_user.id,
                total_amount=total,
                special_requests=special_requests,
                status='pending'
            )
            db.session.add(new_order)
            db.session.commit()
            
            # Add order items
            for item in cart:
                order_item = OrderItem(
                    order_id=new_order.id,
                    menu_item_id=item['id'],
                    quantity=item['quantity'],
                    special_requests=item.get('specialRequests', '')
                )
                db.session.add(order_item)
            
            db.session.commit()
            flash('Order placed successfully!', category='success')
            return redirect(url_for('views.order_confirmation', order_id=new_order.id))
        except Exception as e:
            db.session.rollback()
            flash('Error placing order: ' + str(e), category='error')
            return redirect(url_for('views.menu'))

@views.route('/order-confirmation/<int:order_id>')
@login_required
def order_confirmation(order_id):
    order = Order.query.get_or_404(order_id)
    if order.user_id != current_user.id and not current_user.is_staff:
        flash('You are not authorized to view this order.', category='error')
        return redirect(url_for('views.home'))
    
    return render_template("order_confirmation.html", user=current_user, order=order)

@views.route('/my-orders')
@login_required
def my_orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.order_date.desc()).all()
    return render_template("my_orders.html", user=current_user, orders=orders)

# Admin routes
@views.route('/admin/reservations')
@login_required
def admin_reservations():
    if not current_user.is_staff:
        flash('You are not authorized to access this page.', category='error')
        return redirect(url_for('views.home'))
    
    reservations = Reservation.query.order_by(Reservation.reservation_date.desc()).all()
    return render_template("admin/reservations.html", user=current_user, reservations=reservations)

@views.route('/admin/orders')
@login_required
def admin_orders():
    if not current_user.is_staff:
        flash('You are not authorized to access this page.', category='error')
        return redirect(url_for('views.home'))
    
    orders = Order.query.order_by(Order.order_date.desc()).all()
    return render_template("admin/orders.html", user=current_user, orders=orders)

@views.route('/admin/menu', methods=['GET', 'POST'])
@login_required
def admin_menu():
    if not current_user.is_staff:
        flash('You are not authorized to access this page.', category='error')
        return redirect(url_for('views.home'))
    
    if request.method == 'POST':
        try:
            name = request.form.get('name')
            description = request.form.get('description')
            price = float(request.form.get('price'))
            category = request.form.get('category')
            image_path = request.form.get('image_path')
            
            new_item = MenuItem(
                name=name,
                description=description,
                price=price,
                category=category,
                image_path=image_path
            )
            db.session.add(new_item)
            db.session.commit()
            flash('Menu item added successfully!', category='success')
        except Exception as e:
            db.session.rollback()
            flash('Error adding menu item: ' + str(e), category='error')
    
    menu_items = MenuItem.query.all()
    return render_template("admin/menu.html", user=current_user, menu_items=menu_items)

@views.route('/update-reservation-status/<int:reservation_id>', methods=['POST'])
@login_required
def update_reservation_status(reservation_id):
    if not current_user.is_staff:
        return jsonify({'error': 'Unauthorized'}), 403
    
    reservation = Reservation.query.get_or_404(reservation_id)
    new_status = request.json.get('status')
    
    if new_status not in ['pending', 'confirmed', 'cancelled', 'completed']:
        return jsonify({'error': 'Invalid status'}), 400
    
    reservation.status = new_status
    db.session.commit()
    
    return jsonify({'success': True, 'new_status': new_status})

@views.route('/update-order-status/<int:order_id>', methods=['POST'])
@login_required
def update_order_status(order_id):
    if not current_user.is_staff:
        return jsonify({'error': 'Unauthorized'}), 403
    
    order = Order.query.get_or_404(order_id)
    new_status = request.json.get('status')
    
    if new_status not in ['pending', 'preparing', 'ready', 'delivered', 'cancelled']:
        return jsonify({'error': 'Invalid status'}), 400
    
    order.status = new_status
    db.session.commit()
    
    return jsonify({'success': True, 'new_status': new_status})

@views.route('/toggle-menu-item/<int:item_id>', methods=['POST'])
@login_required
def toggle_menu_item(item_id):
    if not current_user.is_staff:
        return jsonify({'error': 'Unauthorized'}), 403
    
    menu_item = MenuItem.query.get_or_404(item_id)
    menu_item.is_available = not menu_item.is_available
    db.session.commit()
    
    return jsonify({
        'success': True,
        'is_available': menu_item.is_available,
        'item_id': item_id
    })