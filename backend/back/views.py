from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Product, User ,CartItem
from .serializers import UserSerializer, ProductSerializer
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from rest_framework import status
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from .models import CartItem, Product, User, Payment, Order, ProductOrder 
from django.db.models import Q, Sum

#ดึงข้อมูลผู้ใช้งานที่ล็อกอินอยู่
@api_view(['GET'])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

#ล็อกอินผู้ใช้ด้วย username หรือ email → ส่ง token และ role กลับ
@api_view(['POST'])
def login_view(request):
    try:
        input_id = request.data.get('username')  
        password = request.data.get('password')

        if not input_id or not password:
            return Response({"error": "Username/email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        #ค้นหา user โดย username หรือ email
        try:
            user = User.objects.get(Q(username=input_id) | Q(email=input_id))
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        #ตรวจสอบ password
        if not user.check_password(password):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        #login สำเร็จ → ส่ง token
        token, created = Token.objects.get_or_create(user=user)


        is_staff = user.is_staff
        is_superuser = user.is_superuser
        print(f"User {user.username} - is_staff: {is_staff}, is_superuser: {is_superuser}")
        

        user_role = 'admin' if (is_staff or is_superuser) else 'customer'
        print(f"Assigned role: {user_role}")

        response_data = {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user_role,
                "is_staff": is_staff,
                "is_superuser": is_superuser
            },
            "token": token.key
        }
        
        print("Sending response:", response_data)
        return Response(response_data)



    except Exception as e:
        print(f"Login error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



#ดึงรายการสินค้า
@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()
    products_data = [
        {
            'id': product.id,
            'name': product.name,
            'category': product.category,
            'price': str(product.price),
            'image': product.image.url if product.image else None,
        }
        for product in products
    ]
    return Response(products_data)

#ดึงรายละเอียดสินค้าตาม id
@api_view(['GET'])
def product_detail(request, id):
    try:
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ProductSerializer(product)
    return Response(serializer.data)

#ลงทะเบียนผู้ใช้ใหม่จาก JSON ที่รับมาด้วย POST
@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            username = data.get('username')
            password = data.get('password')
            first_name = data.get('first_name')
            last_name = data.get('last_name')

            if not all([username, password]):
                return JsonResponse({'error': 'Username and password are required'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)

            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=first_name,
                last_name=last_name
            )

            return JsonResponse({'message': 'User created successfully'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

#เพิ่มสินค้าไปยังตะกร้า ตรวจ stock และรวมจำนวนเดิม
@csrf_exempt
def add_to_cart(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user = User.objects.get(id=data['user_id'])
            product = Product.objects.get(id=data['product_id'])
            quantity = int(data.get('quantity', 0))

            if quantity <= 0:
                return JsonResponse({'error': 'Invalid quantity'}, status=400)

            if product.stock < quantity:
                return JsonResponse({
                    'error': f'Not enough stock. Only {product.stock} items available.',
                    'available': product.stock
                }, status=400)

            current_cart_quantity = 0
            try:
                cart_item = CartItem.objects.get(user=user, product=product)
                current_cart_quantity = cart_item.quantity
            except CartItem.DoesNotExist:
                cart_item = None

            if (current_cart_quantity + quantity) > product.stock:
                return JsonResponse({
                    'error': f'Cannot add {quantity} more items. You already have {current_cart_quantity} in your cart, and only {product.stock} are available in total.',
                    'available': product.stock,
                    'in_cart': current_cart_quantity
                }, status=400)

            if cart_item:
                cart_item.quantity += quantity
            else:
                cart_item = CartItem(user=user, product=product, quantity=quantity)

            cart_item.save()
            return JsonResponse({
                'message': 'Item added to cart',
                'quantity': cart_item.quantity,
                'available': product.stock - cart_item.quantity
            }, status=201)

        except (User.DoesNotExist, Product.DoesNotExist):
            return JsonResponse({'error': 'User or product not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid method'}, status=405)

#ดึงรายการสินค้าในตะกร้าของผู้ใช้ตาม user_id
@api_view(['GET'])
def get_cart_items(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        cart_items = CartItem.objects.filter(user=user)
        data = [
            {
                "id": str(item.id),
                "productId": item.product.id,
                "name": item.product.name,
                "description": item.product.description,
                "price": float(item.product.price),
                "quantity": item.quantity,
                "available": item.product.stock,
                "imageUrl": item.product.image.url if item.product.image else ""
            }
            for item in cart_items
        ]
        return Response(data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


#ทำการ checkout → สร้าง Payment + Order + ProductOrder และล้างตะกร้า
@api_view(['POST'])
def checkout(request):
    try:
        data = request.data
        user_id = data.get("userId")

        if not user_id:
            return Response({"error": "Missing userId"}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        payment_method = data.get("paymentMethod", "")
        payment_details = data.get("paymentDetails", {})

        print("Received payment method:", data.get("paymentMethod"))
        payment = Payment.objects.create(
            method=payment_method,
            card_no=payment_details.get("cardNumber", "") if payment_method == "creditCard" else "",
            expired=payment_details.get("expirationDate", "") if payment_method == "creditCard" else "",
            holder_name=payment_details.get("cardholderName", "") if payment_method == "creditCard" else "",
            payment_owner=user,
            payment_date=timezone.now()
        )

        # Create Order
        order = Order.objects.create(
            customer=user,
            total_price=data.get("total"),
            payment=payment,
            status="pending",
            order_date=timezone.now(),
            shipping_name=data["shippingInfo"].get("fullName", ""),
            shipping_address=data["shippingInfo"].get("address", ""),
            shipping_city=data["shippingInfo"].get("city", ""),
            shipping_state=data["shippingInfo"].get("stateProvince", ""),
            shipping_postal=data["shippingInfo"].get("postalCode", ""),
            shipping_country=data["shippingInfo"].get("country", ""),    
        )

        # Create ProductOrder
        for item in data["items"]:
            print("Processing item:", item)
            ProductOrder.objects.create(
                order=order,
                product_id=item.get("productId") or item.get("id"),
                quantity=item["quantity"],
                total_price=item["price"] * item["quantity"]
            )

        # Clear cart
        CartItem.objects.filter(user=user).delete()

        return Response({"message": "Order created", "order_id": order.id}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)



    
#ค้นหาสินค้าด้วย id หรือชื่อ (ใช้ flexible_lookup)
@api_view(['GET'])
def product_lookup(request):
    search_id = request.query_params.get('id')
    search_name = request.query_params.get('name')

    if not (search_id or search_name):
        return Response({'ok': False, 'error': 'Please provide either id or name to search.'}, status=status.HTTP_400_BAD_REQUEST)

    product = Product.objects.flexible_lookup(product_id=search_id, name=search_name)

    if not product:
        return Response({
            'ok': False,
            'error': 'Product not found.',
            'searched_id': search_id,
            'searched_name': search_name
        }, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'ok': True,
        'product': {
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'stock': product.stock,
            'category': product.category,
            'description': product.description
        }
    }, status=status.HTTP_200_OK)

#ดึงข้อมูลสรุปของออเดอร์ตาม order_id → สำหรับหน้ายืนยันคำสั่งซื้อ
@api_view(['GET'])
def get_order_confirmation(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        product_orders = ProductOrder.objects.filter(order=order)

        data = {
            "customer_email": order.customer.username,
            "orderId": str(order.id),
            "orderDate": order.order_date.strftime("%B %d, %Y %H:%M"),
            "status": order.status,
            "items": [
                {
                    "id": str(po.product.id),
                    "name": po.product.name,
                    "quantity": po.quantity,
                    "price": float(po.product.price),
                    "imageUrl": f"/media/{po.product.image}" if po.product.image else ""

                }
                for po in product_orders
            ],
            "shipping": {
            "name": order.shipping_name,
            "address": order.shipping_address,
            "city": order.shipping_city,
            "state": order.shipping_state,
            "postalCode": order.shipping_postal,
            "country": order.shipping_country,
        },
            "payment": {
                "method": order.payment.method if order.payment else "unknown",
                "last4": order.payment.card_no[-4:] if order.payment and order.payment.card_no else ""
            },
            "subtotal": sum(po.quantity * float(po.product.price) for po in product_orders),
            "shippingCost": 5.00,
            "tax": 0.1 * sum(po.quantity * float(po.product.price) for po in product_orders),
            "total": order.total_price,
            "estimatedDelivery": (order.order_date + timezone.timedelta(days=7)).strftime("%B %d, %Y")
        }

        return Response(data, status=200)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

#ลบสินค้าออกจากตะกร้าตาม user_id และ item_id
@api_view(['DELETE'])
def remove_cart_item(request, user_id, item_id):
    try:
        cart_item = CartItem.objects.get(user_id=user_id, id=item_id)
        cart_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except CartItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)

#ดึงรายการออเดอร์ทั้งหมดของผู้ใช้ที่ล็อกอินอยู่
@api_view(['GET'])
def get_user_orders(request):
    try:
        user = request.user
        orders = Order.objects.filter(customer=user).order_by('-order_date')

        results = []
        for order in orders:
            product_orders = ProductOrder.objects.filter(order=order)
            results.append({
                "id": order.id,
                "date": order.order_date.strftime("%Y-%m-%d"),
                "status": order.status,
                "total": float(order.total_price),
                "items": sum(po.quantity for po in product_orders),
                "trackingNumber": "",  # ใส่ได้ถ้ามี
                "deliveryEstimate": (order.order_date + timezone.timedelta(days=7)).strftime("%Y-%m-%d")
            })

        return Response({"orders": results}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

#ดึงสถิติเชิงภาพรวมของระบบ (ใช้ในแอดมินแดชบอร์ด) เช่น total sales, users, orders
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    # Check if user is admin
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    # Get stats
    total_products = Product.objects.count()
    total_users = User.objects.count()
    total_orders = Order.objects.count()
    
    # Calculate total sales
    total_sales = Order.objects.aggregate(
        total=Sum('total_price')  # Use Sum directly, not models.Sum
    )['total'] or 0
    
    # Get pending orders count
    pending_orders = Order.objects.filter(status='pending').count()
    
    # Get low stock products count
    low_stock_products = Product.objects.filter(stock__lt=20).count()
    
    return Response({
        'totalSales': float(total_sales),
        'totalOrders': total_orders,
        'totalProducts': total_products,
        'totalUsers': total_users,
        'pendingOrders': pending_orders,
        'lowStockProducts': low_stock_products
    })

#ดึงรายการสินค้าแบบละเอียด (เฉพาะ admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_products_list(request):
    # Check if user is admin
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    products = Product.objects.all()
    products_data = [
        {
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'inventory': product.stock,
            'category': product.category,
            'status': 'active',  # You may need to add a status field to your Product model
            'description': product.description,
            'image': request.build_absolute_uri(product.image.url) if product.image else None,
        }
        for product in products
    ]
    return Response(products_data)

#ดึงรายการคำสั่งซื้อทั้งหมด (เฉพาะ admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders_list(request):
    # Check if user is admin
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.all().order_by('-order_date')
    orders_data = [
        {
            'id': f'ECO-{order.id}',
            'date': order.order_date.strftime('%b %d, %Y'),
            'customer': order.shipping_name or order.customer.username,
            'total': float(order.total_price),
            'status': order.status,
        }
        for order in orders
    ]
    return Response(orders_data)

#ดึงรายการผู้ใช้งานทั้งหมด (เฉพาะ admin)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    # Check if user is admin
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({"error": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all()
    users_data = [
        {
            'id': f'U{user.id:03d}',
            'name': f'{user.first_name} {user.last_name}' if user.first_name or user.last_name else user.username,
            'email': user.email,
            'role': 'admin' if user.is_staff or user.is_superuser else 'customer',
            'lastLogin': user.last_login.strftime('%b %d, %Y') if user.last_login else 'Never',
        }
        for user in users
    ]
    return Response(users_data)