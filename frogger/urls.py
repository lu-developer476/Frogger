from django.contrib import admin
from django.urls import path
from game.views import health, index

urlpatterns = [path("", index, name="index"), path("health/", health, name="health"), path("admin/", admin.site.urls)]
