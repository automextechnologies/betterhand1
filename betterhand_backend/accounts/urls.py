from django.urls import path
from . import views

urlpatterns = [
    path('hospital/register/',   views.HospitalRegisterView.as_view()),
    path('donor/register/',      views.DonorRegisterView.as_view()),
    path('login/',               views.LoginView.as_view()),
    path('logout/',              views.LogoutView.as_view()),
    path('me/',                  views.MeView.as_view()),
    path('change-password/',     views.ChangePasswordView.as_view()),
    path('hospital/profile/',    views.HospitalProfileView.as_view()),
    path('donor/profile/',       views.DonorProfileView.as_view()),
    path('location/',            views.UpdateLocationView.as_view()),
    path('fcm-token/',           views.UpdateFCMTokenView.as_view()),
    path('donors/search/',       views.DonorSearchView.as_view()),
    path('donor/availability/',  views.DonorAvailabilityToggleView.as_view()),
    path('colleges/',            views.CollegeListView.as_view()),
    path('donor/questionnaire/', views.QuestionnaireView.as_view()),
]