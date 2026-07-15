from django.http import JsonResponse
from django.shortcuts import render

from .texts import UI_TEXTS


def index(request):
    return render(request, "index.html", {"texts": UI_TEXTS})


def ranking(request):
    return render(request, "ranking.html", {"texts": UI_TEXTS})


def health(request):
    return JsonResponse({"status": "ok", "service": "frogger"})
