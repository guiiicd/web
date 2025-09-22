export default defineEventHandler((event) => {
  event.node.res.statusCode = 200;
  event.node.res.end();
});
