from django.db import models
from django.contrib.auth.models import User  

# ProductManager: ฟังก์ชันเสริม flexible_lookup() ใช้ค้นหาสินค้าจาก id หรือ name แบบยืดหยุ่น
class ProductManager(models.Manager):
    def flexible_lookup(self, product_id=None, name=None):
        if product_id: 
            try:
                return self.get(id=product_id)
            except self.model.DoesNotExist:
                if name:
                    return self.filter(name__icontains=name).first()
                return None
        elif name:
            return self.filter(name__icontains=name).first()
        return None

# Product: เก็บข้อมูลสินค้า เช่น ชื่อ ราคา คลังสินค้า หมวดหมู่ รูปภาพ
# ใช้ ProductManager ในการจัดการ custom query
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True) 
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    category = models.CharField(max_length=255)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    objects = ProductManager()
    def __str__(self):
        return self.name

# Payment: เก็บข้อมูลการชำระเงิน เช่น วิธีบัตร ชื่อผู้ถือบัตร วันหมดอายุ
# เชื่อมโยงกับ User ที่เป็นเจ้าของการชำระเงิน
class Payment(models.Model):
    method = models.CharField(max_length=255)
    card_no = models.CharField(max_length=20, blank=True)
    expired = models.CharField(max_length=5)
    holder_name = models.CharField(max_length=500)
    payment_owner = models.ForeignKey(User, on_delete=models.CASCADE)
    payment_date = models.DateTimeField()

    def __str__(self):
        return f"{self.method} - {self.holder_name}"

# Order: เก็บคำสั่งซื้อของผู้ใช้
# มีข้อมูลรวมราคาทั้งหมด การจ่ายเงิน สถานะ วันที่ และที่อยู่จัดส่ง
class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    total_price = models.FloatField()
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=25)
    order_date = models.DateTimeField()
    shipping_name = models.CharField(max_length=255, blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True)
    shipping_state = models.CharField(max_length=100, blank=True)
    shipping_postal = models.CharField(max_length=20, blank=True)
    shipping_country = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer}"

# ProductOrder: เชื่อมโยงระหว่างสินค้าและคำสั่งซื้อ (Many-to-Many with extra fields)
# มีระบบตัด stock ทันทีตอนสั่งซื้อ ถ้า stock ไม่พอจะ raise error
class ProductOrder(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    total_price = models.FloatField()
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    def save(self, *args, **kwargs):
        if not self.pk:  #เป็นการสร้างใหม่ ไม่ใช่อัปเดต
            if self.product.stock < self.quantity:
                raise ValueError(f"Not enough stock for {self.product.name}")
            self.product.stock -= self.quantity
            self.product.save()
        super().save(*args, **kwargs)
        
# CartItem: เก็บรายการที่ผู้ใช้เพิ่มลงตะกร้า
# มี method total_price() เพื่อคำนวณราคาของ item นั้นๆ
class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"

    def total_price(self):
        return self.product.price * self.quantity

