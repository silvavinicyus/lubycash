import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Address from 'App/Models/Address';
import Permission from 'App/Models/Permission';
import Statement from 'App/Models/Statement';
import User from 'App/Models/User';
import UserPermission from 'App/Models/UserPermission';
import StoreUserValidator from 'App/Validators/Users/StoreUserValidator';
import axios from 'axios';
import { Kafka } from 'kafkajs';

export default class UsersController {
  public async store({ request, response }: HttpContextContract) {
    await request.validate(StoreUserValidator);

    const { fullName, email, password, phone, cpfNumber, averageSalary, city, state, zipCode } =
      request.body();

    const kafka = new Kafka({
      clientId: 'lubycash',
      brokers: ['kafka:29092'],
    });

    const message = {
      full_name: fullName,
      email,
      phone,
      cpf_number: cpfNumber,
      average_salary: averageSalary,
    };

    const producerNewUser = kafka.producer();

    await producerNewUser.connect();

    await producerNewUser.send({
      topic: 'createuser',
      messages: [{ value: JSON.stringify(message) }],
    });

    producerNewUser.disconnect();

    const consumerUserCreated = kafka.consumer({ groupId: 'user_created' });
    await consumerUserCreated.connect();
    await consumerUserCreated.subscribe({ topic: 'usercreated', fromBeginning: false });

    await consumerUserCreated.run({
      eachMessage: async ({ message }) => {
        const data = message.value!.toString();
        const dataJson = JSON.parse(data);

        if (!dataJson['error']) {
          const address = new Address();

          address.city = city;
          address.state = state;
          address.zipCode = zipCode;

          await address.save();

          const user = new User();

          user.email = email;
          user.password = password;
          user.addressId = address.id;

          await user.save();

          const userPermission = new UserPermission();
          const permission = await Permission.findByOrFail('type', 'client');

          userPermission.userId = user.id;
          userPermission.permissionId = permission.id;
          await userPermission.save();
        }
      },
    });

    return response.ok({
      message: 'Your request has been received, we will send you an email when we have a result!',
    });
  }

  public async index({ request, response }: HttpContextContract) {
    const HTTP = axios.create({
      baseURL: 'http://ms_client:3000',
      validateStatus: function (status) {
        return status >= 200 && status < 410;
      },
    });

    const { status, startingDate, endingDate } = request.qs();

    let users: User[];

    if (status) {
      users = await HTTP.get(`/users?status=${status}`);
    } else {
      users = await HTTP.get(`/users`);
    }

    if (startingDate && endingDate) {
      users = await HTTP.get(`/users/date?starting_date=${startingDate}&ending_date=${endingDate}`);
    }

    return response.ok(users['data']);
  }

  public async showStatement({ request }: HttpContextContract) {
    const { id } = request.params();

    const outcomings = await Statement.query().where('sender_id', id);

    const incomings = await Statement.query().where('receiver_id', id);

    const incomingBalance = incomings.reduce((currentValue, statement) => {
      return currentValue + statement.value;
    }, 0);

    const outcomingBalance = outcomings.reduce((currentValue, statement) => {
      return currentValue + statement.value;
    }, 0);

    const userStatement = {
      incomings,
      outcomings,
      incomingBalance,
      outcomingBalance: +`-${outcomingBalance}`,
      balance: incomingBalance - outcomingBalance,
    };

    return userStatement;
  }

  public async statementBetweenDates({ request }: HttpContextContract) {
    const { id } = request.params();

    const { startingDate, endingDate } = request.qs();

    const incomings = await Statement.query()
      .where('receiver_id', id)
      .whereBetween('created_at', [startingDate, endingDate]);

    const outcomings = await Statement.query()
      .where('sender_id', id)
      .whereBetween('created_at', [startingDate, endingDate]);

    const incomingBalance = incomings.reduce((currentValue, statement) => {
      return currentValue + statement.value;
    }, 0);

    const outcomingBalance = outcomings.reduce((currentValue, statement) => {
      return currentValue + statement.value;
    }, 0);

    const userStatement = {
      incomings,
      outcomings,
      incomingBalance,
      outcomingBalance: +`-${outcomingBalance}`,
      balance: incomingBalance - outcomingBalance,
    };

    return userStatement;
  }
}
