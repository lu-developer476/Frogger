from django.http import JsonResponse
from django.shortcuts import render


def index(request):
    return render(request, "index.html")


def ranking(request):
    return render(request, "ranking.html")


def health(request):
    return JsonResponse({"status": "ok", "service": "frogger"})
