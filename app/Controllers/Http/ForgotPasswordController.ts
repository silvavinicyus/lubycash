import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Hash from '@ioc:Adonis/Core/Hash';
import Env from '@ioc:Adonis/Core/Env';
import User from 'App/Models/User';
import Token from 'App/Models/Token';
import Mail from '@ioc:Adonis/Addons/Mail';

export default class ForgotPasswordController {
  public async store({ request, response }: HttpContextContract) {
    const { secureId } = request.params();

    const user = await User.findByOrFail('secure_id', secureId);

    const token = await Hash.make(`token-password+${user.email}`);

    await Token.create({
      token: token,
      user_id: user.id,
      type: 'forgot-password',
    });

    const forgtPasswordUrl = `${Env.get('FRONTEND_URL')}/reset?token=${token}`;

    const log = await Mail.send((message) => {
      message
        .from('recovery@lubycash.com')
        .to(user.email)
        .subject('Forgot Password')
        .htmlView('emails/forgotpassword', {
          user: user.email,
          url: forgtPasswordUrl,
        });
    });

    return response.created({ log });
  }
}
