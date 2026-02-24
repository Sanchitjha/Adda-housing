/**
 * Adda Housing App
 * Root Application Widget
 */

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';

class AddaHousingApp extends StatelessWidget {
  const AddaHousingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        return MaterialApp(
          title: 'Adda Housing',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.light,
          initialRoute: _getInitialRoute(state),
          onGenerateRoute: AppRouter.generateRoute,
        );
      },
    );
  }

  String _getInitialRoute(AuthState state) {
    if (state is AuthAuthenticated) {
      if (state.user.societyId == null) {
        return AppRoutes.societySelection;
      }
      return AppRoutes.home;
    }
    return AppRoutes.login;
  }
}
