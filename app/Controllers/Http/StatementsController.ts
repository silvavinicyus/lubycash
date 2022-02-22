import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Statement from 'App/Models/Statement';
import User from 'App/Models/User';
import axios from 'axios';

interface UserMs {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  cpf_number: string;
  current_balance: number;
  average_salary: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export default class StatementsController {
  public async store({ request, response, auth }: HttpContextContract) {
    const { value, cpfNumber } = request.body();

    const HTTP = axios.create({
      baseURL: 'http://ms_client:3000',
      validateStatus: function (status) {
        return status >= 200 && status < 410;
      },
    });

    const statement = new Statement();

    const userSender = await User.findOrFail(auth.user?.id);
    const axiosResponseSender = await HTTP.get(`/users/field?email=${userSender.email}`);
    if (axiosResponseSender.status !== 200) {
      return response.badRequest({ error: 'This sender user does not exists' });
    }
    const userOnMsSender = axiosResponseSender['data'] as UserMs;

    if (userOnMsSender.status !== 'approved') {
      return response.badRequest({
        error: 'The user making this statement cannot do this operation',
        user: userOnMsSender,
      });
    }

    if (userOnMsSender.current_balance < value) {
      return response.badRequest({
        error: 'The user sending this statement doesnt have this balance!',
      });
    }

    const axiosResponseReceiver = await HTTP.get(`/users/field?cpf=${cpfNumber}`);
    if (axiosResponseReceiver.status !== 200) {
      return response.badRequest({
        error: 'There is no client with this email',
        status: axiosResponseReceiver.status,
      });
    }

    const userOnMsReceiver = axiosResponseReceiver['data'] as UserMs;

    const userReceiver = await User.findByOrFail('email', userOnMsReceiver.email);

    if (userOnMsReceiver.status !== 'approved') {
      return response.badRequest({ error: 'This user cannot receive a statement' });
    }

    const resultAddToBalance = await HTTP.post(`/users/add/balance`, {
      value,
      email: userOnMsReceiver.email,
    });

    if (resultAddToBalance.status !== 200) {
      return response.badRequest({ error: 'There was a failure while making the statement' });
    }

    const resultRemoveFromBalance = await HTTP.post('/users/remove/balance', {
      value,
      email: userOnMsSender.email,
    });

    if (resultRemoveFromBalance.status !== 200) {
      return response.badRequest({ error: 'There was a failure while making the statement' });
    }

    statement.operation = 'pix';
    statement.value = value;
    statement.senderId = userSender.id;
    statement.receiverId = userReceiver.id;
    await statement.save();

    return response.created(statement);
  }
}
