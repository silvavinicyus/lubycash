import HealthCheck from '@ioc:Adonis/Core/HealthCheck';
import Route from '@ioc:Adonis/Core/Route';

Route.get('/health', async ({ response }) => {
  const report = await HealthCheck.getReport();
  return report.healthy ? response.ok(report) : response.badRequest(report);
});
Route.resource('/users', 'UsersController').middleware({
  index: ['auth', 'isAdmin'],
});
Route.get('/users/date/statement', 'UsersController.statementBetweenDates').middleware(['auth']);
Route.get('/users/bank/statements', 'UsersController.showStatement').middleware(['auth']);
Route.resource('/admins', 'AdminsController').middleware({
  '*': ['auth', 'isAdmin'],
});
Route.resource('/statements', 'StatementsController').middleware({
  store: ['auth'],
});
Route.post('/authenticate', 'AuthController.login');
Route.post('/forgot/:secureId', 'ForgotPasswordController.store');
Route.post('/reset', 'ResetPasswordController.store');
