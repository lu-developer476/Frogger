from django.contrib import admin
from django.urls import path
from game.views import health, index, ranking

urlpatterns = [path("", index, name="index"), path("ranking/", ranking, name="ranking"), path("health/", health, name="health"), path("admin/", admin.site.urls)]
