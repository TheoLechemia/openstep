from django.http import HttpResponse

# from account.models import User
def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")