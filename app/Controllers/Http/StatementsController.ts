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
  public async store({ request, response }: HttpContextContract) {
    const { operation, value, senderId, receiverId } = request.body();

    const HTTP = axios.create({
      baseURL: 'http://ms_client:3000',
      validateStatus: function (status) {
        return status >= 200 && status < 410; // default
      },
    });

    const statement = new Statement();

    // sender
    const userSender = await User.findOrFail(senderId);
    const axiosResponseSender = await HTTP.get(`/users/email/${userSender.email}`);
    if (axiosResponseSender.status !== 200) {
      return response.badRequest({ error: 'This sender user does not exists' });
    }
    const userOnMsSender = axiosResponseSender['data'] as UserMs;

    if (userOnMsSender.status !== 'approved') {
      return response.badRequest({
        error: 'The user making this statement cannot do this operation',
      });
    }

    if (userOnMsSender.current_balance < value) {
      return response.badRequest({
        error: 'The user sending this statement doesnt have this balance!',
      });
    }

    // receiver
    const userReceiver = await User.findOrFail(receiverId);
    const axiosResponseReceiver = await HTTP.get(`/users/email/${userReceiver.email}`);
    if (axiosResponseReceiver.status !== 200) {
      return response.badRequest({ error: 'There is no client with this email' });
    }

    const userOnMsReceiver = axiosResponseReceiver['data'] as UserMs;

    console.log(userOnMsReceiver.email);

    if (userOnMsReceiver.status !== 'approved') {
      return response.badRequest({ error: 'This user cannot receive a statement' });
    }

    const resultAddToBalance = await HTTP.post(`/users/add/balance`, {
      value,
      email: userOnMsReceiver.email,
    });

    console.log(resultAddToBalance);

    if (resultAddToBalance.status !== 200) {
      return response.badRequest({ error: 'There was a failed while making the statement' });
    }

    statement.operation = operation;
    statement.value = value;
    statement.senderId = senderId;
    statement.receiverId = receiverId;
    await statement.save();

    return response.created(statement);
  }
}
