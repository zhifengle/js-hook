export function isWorker() {
  // ,isWebWorker = !isNode && ('undefined' !== typeof WorkerGlobalScope) && ("function" === typeof importScripts) && (navigator instanceof WorkerNavigator)
  return !self.document;
}
