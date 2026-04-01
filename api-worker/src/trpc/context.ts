import { createAuth } from '../auth';
import type { Env }   from '../index';

export interface Context {
  req:        Request;
  env:        Env;
  workerCtx:  ExecutionContext;
  session:    Awaited<ReturnType<ReturnType<typeof createAuth>['api']['getSession']>>;
}

export interface CreateContextOptions {
  req: Request;
  env: Env;
  ctx: ExecutionContext;
}

export async function createContext({ req, env, ctx }: CreateContextOptions): Promise<Context> {
  const session = await createAuth(env).api.getSession({ headers: req.headers });
  return { req, env, workerCtx: ctx, session };
}
