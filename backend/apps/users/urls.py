from django.urls import path

from apps.users import views

app_name = "users"

urlpatterns = [
    path("staff/", views.StaffAccountCreateView.as_view(), name="staff-create"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("", views.UserListView.as_view(), name="user-list"),
    path("me/", views.UserMeView.as_view(), name="user-me"),
    path("<int:pk>/", views.UserDetailView.as_view(), name="user-detail"),
    path("<int:pk>/edit/", views.UserUpdateView.as_view(), name="user-update"),
    path("<int:pk>/role/", views.RoleUpdateView.as_view(), name="user-role"),
    path("<int:pk>/delete/", views.UserDeleteView.as_view(), name="user-delete"),
]