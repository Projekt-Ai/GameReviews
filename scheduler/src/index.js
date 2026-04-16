export default {
  async scheduled(_event, env, _ctx) {
    const res = await fetch(env.PAGES_DEPLOY_HOOK, { method: 'POST' });
    console.log('Deploy triggered:', res.status);
  }
};
