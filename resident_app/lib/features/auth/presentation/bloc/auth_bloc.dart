import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../../core/config/api_client.dart';

// Events
abstract class AuthEvent {}

class CheckAuthStatus extends AuthEvent {}

class LoginRequested extends AuthEvent {
  final String phone;
  final String password;

  LoginRequested({required this.phone, required this.password});
}

class RegisterRequested extends AuthEvent {
  final String firstName;
  final String lastName;
  final String phone;
  final String password;
  final String? email;

  RegisterRequested({
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.password,
    this.email,
  });
}

class OtpVerifyRequested extends AuthEvent {
  final String phone;
  final String otp;

  OtpVerifyRequested({required this.phone, required this.otp});
}

class LogoutRequested extends AuthEvent {}

// States
abstract class AuthState {}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final Map<String, dynamic> user;

  AuthAuthenticated({required this.user});
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;

  AuthError({required this.message});
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final storage = const FlutterSecureStorage();

  AuthBloc() : super(AuthInitial()) {
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<OtpVerifyRequested>(_onOtpVerifyRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onCheckAuthStatus(
    CheckAuthStatus event,
    Emitter<AuthState> emit,
  ) async {
    try {
      final token = await storage.read(key: 'access_token');
      if (token != null) {
        final response = await ApiClient.getProfile();
        emit(AuthAuthenticated(user: response.data));
      } else {
        emit(AuthUnauthenticated());
      }
    } catch (e) {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final response = await ApiClient.login(event.phone, event.password);
      await storage.write(
        key: 'access_token',
        value: response.data['access_token'],
      );
      await storage.write(
        key: 'refresh_token',
        value: response.data['refresh_token'],
      );
      emit(AuthAuthenticated(user: response.data['user']));
    } catch (e) {
      emit(AuthError(message: 'Invalid phone or password'));
    }
  }

  Future<void> _onRegisterRequested(
    RegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      await ApiClient.register({
        'first_name': event.firstName,
        'last_name': event.lastName,
        'phone': event.phone,
        'password': event.password,
        'email': event.email,
      });
      emit(AuthAuthenticated(user: {}));
    } catch (e) {
      emit(AuthError(message: 'Registration failed'));
    }
  }

  Future<void> _onOtpVerifyRequested(
    OtpVerifyRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final response = await ApiClient.verifyOtp(event.phone, event.otp);
      await storage.write(
        key: 'access_token',
        value: response.data['access_token'],
      );
      emit(AuthAuthenticated(user: response.data['user']));
    } catch (e) {
      emit(AuthError(message: 'Invalid OTP'));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await storage.delete(key: 'access_token');
    await storage.delete(key: 'refresh_token');
    emit(AuthUnauthenticated());
  }
}
