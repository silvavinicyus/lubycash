import HealthCheck from '@ioc:Adonis/Core/HealthCheck';
import Route from '@ioc:Adonis/Core/Route';

Route.get('/health', async ({ response }) => {
  const report = await HealthCheck.getReport();
  return report.healthy ? response.ok(report) : response.badRequest(report);
});
Route.resource('/users', 'UsersController').middleware({
  index: ['auth', 'isAdmin'],
});
Route.get('/users/date/statements/:id', 'UsersController.statementBetweenDates').middleware([
  'auth',
  'isAdmin',
]);
Route.get('/users/bank/statements/:id', 'UsersController.showStatement').middleware([
  'auth',
  'isAdmin',
]);
Route.get('/users/date/by', 'UsersController.usersBetweenDates').middleware(['auth', 'isAdmin']);

Route.resource('/admins', 'AdminsController').middleware({
  '*': ['auth', 'isAdmin'],
});
Route.resource('/statements', 'StatementsController').middleware({
  store: ['auth'],
});
Route.post('/authenticate', 'AuthController.login');
Route.post('/forgot/:secureId', 'ForgotPasswordController.store');
Route.post('/reset', 'ResetPasswordController.store');
