from rest_framework import serializers
from .models import User, Product, CartItem, Order, ProductOrder

# Serializer สำหรับแสดงข้อมูลผู้ใช้
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # ระบุ field ที่ต้องการแสดงผล (ต้องมีใน model จริง)
        fields = ['id', 'username', 'fullname', 'email', 'role', 'address', 'tel']


# Serializer สำหรับแสดงข้อมูลสินค้า
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        # แสดงข้อมูลพื้นฐานของสินค้า
        fields = ['id', 'name', 'description', 'price', 'stock', 'category', 'image']


# Serializer สำหรับรายการสินค้าในแต่ละออเดอร์
class ProductOrderSerializer(serializers.ModelSerializer):
    # ดึงชื่อสินค้าจาก ForeignKey product
    product_name = serializers.CharField(source='product.name')

    class Meta:
        model = ProductOrder
        fields = ['product_name', 'quantity', 'total_price']


# Serializer สำหรับคำสั่งซื้อ (Order)
# รวมสินค้าในออเดอร์ด้วยฟิลด์เสริม 'items'
class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()  # ใช้เมธอด get_items ดึงข้อมูลสินค้าในออเดอร์

    class Meta:
        model = Order
        fields = ['id', 'order_date', 'status', 'total_price', 'items']

    def get_items(self, obj):
        # ดึง ProductOrder ทั้งหมดที่เชื่อมกับออเดอร์นี้
        product_orders = ProductOrder.objects.filter(order=obj)
        # แปลงเป็น list ด้วย serializer
        return ProductOrderSerializer(product_orders, many=True).data


# Serializer สำหรับตะกร้าสินค้า (CartItem)
# แสดงข้อมูลสินค้าในแต่ละ cart item โดยดึงจาก ForeignKey product
class CartItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='product.name')  # ชื่อสินค้า
    description = serializers.CharField(source='product.description')  # รายละเอียดสินค้า
    price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2)  # ราคาสินค้า
    available = serializers.IntegerField(source='product.stock')  # จำนวนคงเหลือ
    imageUrl = serializers.ImageField(source='product.image')  # รูปภาพสินค้า

    class Meta:
        model = CartItem
        fields = ['id', 'name', 'description', 'price', 'quantity', 'available', 'imageUrl']
