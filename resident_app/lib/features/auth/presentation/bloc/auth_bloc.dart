/**
 * Auth BLoC
 * Authentication State Management
 */

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String phone;
  final String password;

  AuthLoginRequested({required this.phone, required this.password});

  @override
  List<Object?> get props => [phone, password];
}

class AuthOtpRequested extends AuthEvent {
  final String phone;

  AuthOtpRequested({required this.phone});

  @override
  List<Object?> get props => [phone];
}

class AuthOtpVerified extends AuthEvent {
  final String otp;
  final String phone;
  final bool isRegistration;

  AuthOtpVerified({required this.otp, required this.phone, required this.isRegistration});

  @override
  List<Object?> get props => [otp, phone, isRegistration];
}

class AuthLogoutRequested extends AuthEvent {}

class AuthSocietySelected extends AuthEvent {
  final String societyId;

  AuthSocietySelected({required this.societyId});

  @override
  List<Object?> get props => [societyId];
}

// States
abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final User user;

  AuthAuthenticated({required this.user});

  @override
  List<Object?> get props => [user];
}

class AuthUnauthenticated extends AuthState {}

class AuthOtpSent extends AuthState {
  final String phone;

  AuthOtpSent({required this.phone});

  @override
  List<Object?> get props => [phone];
}

class AuthError extends AuthState {
  final String message;

  AuthError({required this.message});

  @override
  List<Object?> get props => [message];
}

// User Model
class User {
  final String id;
  final String? firstName;
  final String? lastName;
  final String phone;
  final String? email;
  final String? profileImage;
  final String? societyId;
  final String? flatId;
  final String? flatNumber;
  final String userType;

  User({
    required this.id,
    this.firstName,
    this.lastName,
    required this.phone,
    this.email,
    this.profileImage,
    this.societyId,
    this.flatId,
    this.flatNumber,
    this.userType = 'RESIDENT',
  });

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      firstName: json['first_name'],
      lastName: json['last_name'],
      phone: json['phone'] ?? '',
      email: json['email'],
      profileImage: json['profile_image'],
      societyId: json['society_id'],
      flatId: json['flat_id'],
      flatNumber: json['flat_number'],
      userType: json['user_type'] ?? 'RESIDENT',
    );
  }
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<AuthCheckRequested>(_onAuthCheckRequested);
    on<AuthLoginRequested>(_onAuthLoginRequested);
    on<AuthOtpRequested>(_onAuthOtpRequested);
    on<AuthOtpVerified>(_onAuthOtpVerified);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
    on<AuthSocietySelected>(_onAuthSocietySelected);
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      // Check for stored token
      // final token = await SecureStorage.getToken();
      // if (token != null) {
      //   final user = await ApiService.getCurrentUser(token);
      //   emit(AuthAuthenticated(user: user));
      // } else {
      emit(AuthUnauthenticated());
      // }
    } catch (e) {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 1));
      
      // Mock successful login
      final user = User(
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        phone: event.phone,
        email: 'john@example.com',
        societyId: 'society-1',
        flatId: 'flat-1',
        flatNumber: '101',
        userType: 'RESIDENT',
      );
      
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthOtpRequested(
    AuthOtpRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      // Simulate OTP sending
      await Future.delayed(const Duration(seconds: 1));
      emit(AuthOtpSent(phone: event.phone));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthOtpVerified(
    AuthOtpVerified event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      // Simulate OTP verification
      await Future.delayed(const Duration(seconds: 1));
      
      final user = User(
        id: 'user-new-123',
        firstName: 'New',
        lastName: 'User',
        phone: event.phone,
        userType: 'RESIDENT',
      );
      
      emit(AuthAuthenticated(user: user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      // Clear stored token
      // await SecureStorage.clearToken();
      emit(AuthUnauthenticated());
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onAuthSocietySelected(
    AuthSocietySelected event,
    Emitter<AuthState> emit,
  ) async {
    if (state is AuthAuthenticated) {
      final currentUser = (state as AuthAuthenticated).user;
      final updatedUser = User(
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone,
        email: currentUser.email,
        profileImage: currentUser.profileImage,
        societyId: event.societyId,
        flatId: currentUser.flatId,
        flatNumber: currentUser.flatNumber,
        userType: currentUser.userType,
      );
      emit(AuthAuthenticated(user: updatedUser));
    }
  }
}
