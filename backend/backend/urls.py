from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from back.views import login_view, product_list, product_detail, register_view ,add_to_cart , get_cart_items , checkout , product_lookup , get_order_confirmation , remove_cart_item , get_user_orders, admin_dashboard_stats, admin_products_list, admin_orders_list, admin_users_list
from django.conf import settings
from django.conf.urls.static import static


def home(request):
    return JsonResponse({"message": "Django backend is running "})  # หน้าแรก ใช้สำหรับทดสอบว่า backend ทำงานอยู่

urlpatterns = [
    path('', home),  #หน้า default เพื่อตอบกลับข้อความจาก backend
    path('admin/', admin.site.urls),  #หน้า admin ของ Django

    path('login/', login_view),  #API สำหรับล็อกอินผู้ใช้
    path('register/', register_view),  #API สำหรับลงทะเบียนผู้ใช้ใหม่
    path('products/', product_list),  #ดึงรายการสินค้าทั้งหมด
    path('products/<int:id>/', product_detail),  #ดึงรายละเอียดสินค้ารายตัวจาก id

    path('add-to-cart/', add_to_cart),  #เพิ่มสินค้าลงในตะกร้า
    path('cart/<int:user_id>/', get_cart_items),  #ดึงรายการสินค้าที่อยู่ในตะกร้าของผู้ใช้
    path('cart/<int:user_id>/remove/<int:item_id>/', remove_cart_item),  #ลบสินค้าออกจากตะกร้า

    path('checkout/', checkout),  #ทำรายการ checkout และสร้าง order
    path('orders/', get_user_orders),  #ดึงรายการ order ของผู้ใช้ที่ล็อกอิน
    path('order/<int:order_id>/confirmation/', get_order_confirmation),  #แสดงรายละเอียดการสั่งซื้อหลังจาก checkout

    path('product/lookup/', product_lookup),  #ค้นหาสินค้าจาก id หรือชื่อสินค้าแบบยืดหยุ่น

    #เส้นทางสำหรับผู้ดูแลระบบ (Admin)
    path('api/admin/stats/', admin_dashboard_stats),  #ดึงสถิติโดยรวมของระบบ
    path('api/admin/products/', admin_products_list),  #ดึงรายการสินค้าทั้งหมด (เฉพาะแอดมิน)
    path('api/admin/orders/', admin_orders_list),  #ดึงรายการคำสั่งซื้อทั้งหมด
    path('api/admin/users/', admin_users_list),  #ดึงรายการผู้ใช้งานทั้งหมด
]

# เส้นทางสำหรับเสิร์ฟไฟล์ media ในโหมด DEBUG
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

