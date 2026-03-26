from django.urls import path
from django.http import HttpResponse

def index(request):
    return HttpResponse(
        "<h2>🍕 FoodDelivery API is running!</h2>"
        "<p>Frontend: <a href='http://localhost:3000'>http://localhost:3000</a></p>"
        "<p>API: <a href='/api/foods/'>/api/foods/</a></p>"
        "<p>Admin: <a href='/admin/'>/admin/</a></p>"
    )

urlpatterns = [
    path('', index),
]
