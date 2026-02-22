"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from django.contrib import admin
# from django.urls import path

# urlpatterns = [
#     path('admin/', admin.site.urls),
# ]

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from products.views import CategoryViewSet, ProductViewSet
from orders.views import (
    OrderViewSet,
    OrderItemViewSet,
    TaxTypeViewSet,
    dashboard_stats,
    close_daily_pos_report,
    start_daily_pos_report,
    daily_pos_report,
    daily_pos_report_pdf,
    export_daily_report_pdf,
)
from payments.views import PaymentViewSet
from users.views import UserViewSet

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'tax-types', TaxTypeViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/dashboard-stats/', dashboard_stats, name='dashboard-stats'),
    path('api/reports/daily-pos/', daily_pos_report, name='daily-pos-report'),
    path('api/reports/daily-pos/start/', start_daily_pos_report, name='start-daily-pos-report'),
    path('api/reports/daily-pos/close/', close_daily_pos_report, name='close-daily-pos-report'),
    path('api/reports/daily-pos/pdf/', daily_pos_report_pdf, name='daily-pos-report-pdf'),
    path('api/reports/daily/pdf/<str:date>/', export_daily_report_pdf, name='export-daily-report-pdf'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

