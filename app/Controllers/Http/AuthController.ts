import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';

export default class AuthController {
  public async login({ auth, request, response }: HttpContextContract) {
    const { email, password } = request.body();

    try {
      const token = await auth.use('api').attempt(email, password, {
        expiresIn: '24hours',
      });

      const user = await User.query()
        .where('email', email)
        .preload('userPermissions', (permission) => {
          permission.preload('permission');
        });

      return response.json({
        user,
        token,
      });
    } catch {
      return response.badRequest({ error: 'Invalid credentials' });
    }
  }
}
