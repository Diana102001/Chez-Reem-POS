from rest_framework import viewsets
from .models import Payment
from .serializers import PaymentSerializer
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsCashier


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsCashier]
    
