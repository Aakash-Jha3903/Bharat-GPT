from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from .views import ChatRoomListCreateView, ChatRoomDetailView, send_prompt_to_room, register_user

urlpatterns = [
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # path("api/process-prompt/", views.process_prompt, name="process_prompt"),
    path('register/', register_user),
    path("chatrooms/", ChatRoomListCreateView.as_view(), name="chatroom-list-create"),
    path("chatrooms/<int:pk>/", ChatRoomDetailView.as_view(), name="chatroom-detail"),
    path("chatrooms/<int:room_id>/prompt/",send_prompt_to_room,name="send-prompt-to-room",),
]
