import 'package:flutter_bloc/flutter_bloc.dart';

// Events
abstract class HomeEvent {}

class LoadDashboard extends HomeEvent {}

class LoadBills extends HomeEvent {}

class LoadComplaints extends HomeEvent {}

// States
abstract class HomeState {}

class HomeInitial extends HomeState {}

class HomeLoading extends HomeState {}

class HomeLoaded extends HomeState {
  final Map<String, dynamic> data;
  HomeLoaded({required this.data});
}

class HomeError extends HomeState {
  final String message;
  HomeError({required this.message});
}

// Bloc
class HomeBloc extends Bloc<HomeEvent, HomeState> {
  HomeBloc() : super(HomeInitial()) {
    on<LoadDashboard>(_onLoadDashboard);
    on<LoadBills>(_onLoadBills);
    on<LoadComplaints>(_onLoadComplaints);
  }

  Future<void> _onLoadDashboard(LoadDashboard event, Emitter<HomeState> emit) async {
    emit(HomeLoading());
    try {
      // Simulated data
      await Future.delayed(const Duration(seconds: 1));
      emit(HomeLoaded(data: {'bills': [], 'notices': []}));
    } catch (e) {
      emit(HomeError(message: e.toString()));
    }
  }

  Future<void> _onLoadBills(LoadBills event, Emitter<HomeState> emit) async {
    emit(HomeLoading());
    try {
      await Future.delayed(const Duration(seconds: 1));
      emit(HomeLoaded(data: {'bills': []}));
    } catch (e) {
      emit(HomeError(message: e.toString()));
    }
  }

  Future<void> _onLoadComplaints(LoadComplaints event, Emitter<HomeState> emit) async {
    emit(HomeLoading());
    try {
      await Future.delayed(const Duration(seconds: 1));
      emit(HomeLoaded(data: {'complaints': []}));
    } catch (e) {
      emit(HomeError(message: e.toString()));
    }
  }
}
