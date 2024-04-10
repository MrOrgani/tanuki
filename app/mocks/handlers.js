import { rest } from 'msw';
import { manyClients, singleClient, singleClient2 } from 'mockData/clients';
import { accountManager2, manyAccountManagers, manyEmployees } from 'mockData/employees';
import { manyFeedbacks, singleFeedback } from 'mockData/feedbacks';
import { manyAccounts } from 'mockData/accounts';
import { managersAggregation } from 'mockData/managersAggregation';

export const handlers = [
  rest.post('/api/clients', (req, res, ctx) => {
    return res(ctx.status(201));
  }),
  rest.get('/api/clients', (req, res, ctx) => {
    const query = req.url.searchParams.get('query');
    const accountId = req.url.searchParams.get('account');

    if (query === 'Umbrella' || accountId === manyAccounts[0].id) {
      return res(ctx.status(200), ctx.json([singleClient]));
    }
    if (accountId === manyAccounts[1].id) {
      return res(ctx.status(200), ctx.json([singleClient2]));
    }
    return res(ctx.status(200), ctx.json(manyClients));
  }),

  rest.get('/api/employees', (req, res, ctx) => {
    if (req.url.searchParams.get('type') === 'ACMA') {
      return res(ctx.status(200), ctx.json(manyAccountManagers));
    }
    return res(ctx.status(200), ctx.json(manyEmployees));
  }),
  rest.get('/api/accounts', (req, res, ctx) => {
    if (
      req.url.searchParams.get('query') === manyAccounts[1].name.slice(0, 8) ||
      req.url.searchParams.get('acma') === accountManager2.id
    ) {
      return res(ctx.status(200), ctx.json([manyAccounts[1]]));
    }

    return res(ctx.status(200), ctx.json(manyAccounts));
  }),

  rest.post('/api/feedbacks', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(singleFeedback));
  }),

  rest.put('/api/feedbacks', (req, res, ctx) => {
    return res(ctx.status(204));
  }),
  rest.delete('/api/feedbacks/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  rest.get('/api/feedbacks', (req, res, ctx) => {
    if (
      req.url.searchParams.get('q') === manyFeedbacks[0].employee.name.split(' ')[0] ||
      req.url.searchParams.getAll('startup').length === 1 ||
      req.url.searchParams.getAll('manager').length === 1
    ) {
      return res(ctx.status(200), ctx.json({ feedbacks: [manyFeedbacks[0]], totalCount: 1 }));
    }

    if (
      req.url.searchParams.get('sort')[0] === '-' ||
      req.url.searchParams.get('sort') === 'date'
    ) {
      return res(
        ctx.status(200),
        ctx.json({ feedbacks: [manyFeedbacks[1], singleFeedback], totalCount: 2 })
      );
    }

    return res(ctx.status(200), ctx.json({ feedbacks: manyFeedbacks, totalCount: 2 }));
  }),
  rest.get('/api/employees/managers/aggregation', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(managersAggregation));
  }),
];
