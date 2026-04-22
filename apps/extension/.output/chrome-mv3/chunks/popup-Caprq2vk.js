(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function print(method, ...args) {
  if (typeof args[0] === "string") {
    const message = args.shift();
    method(`[wxt] ${message}`, ...args);
  } else {
    method("[wxt]", ...args);
  }
}
var logger = {
  debug: (...args) => print(console.debug, ...args),
  log: (...args) => print(console.log, ...args),
  warn: (...args) => print(console.warn, ...args),
  error: (...args) => print(console.error, ...args)
};
var ws;
function getDevServerWebSocket() {
  if (ws == null) {
    const serverUrl = `${"ws:"}//${"localhost"}:${3002}`;
    logger.debug("Connecting to dev server @", serverUrl);
    ws = new WebSocket(serverUrl, "vite-hmr");
    ws.addWxtEventListener = ws.addEventListener.bind(ws);
    ws.sendCustom = (event, payload) => ws == null ? void 0 : ws.send(JSON.stringify({ type: "custom", event, payload }));
    ws.addEventListener("open", () => {
      logger.debug("Connected to dev server");
    });
    ws.addEventListener("close", () => {
      logger.debug("Disconnected from dev server");
    });
    ws.addEventListener("error", (event) => {
      logger.error("Failed to connect to dev server", event);
    });
    ws.addEventListener("message", (e) => {
      try {
        const message = JSON.parse(e.data);
        if (message.type === "custom") {
          ws == null ? void 0 : ws.dispatchEvent(
            new CustomEvent(message.event, { detail: message.data })
          );
        }
      } catch (err) {
        logger.error("Failed to handle message", err);
      }
    });
  }
  return ws;
}
{
  try {
    const ws2 = getDevServerWebSocket();
    ws2.addWxtEventListener("wxt:reload-page", (event) => {
      if (event.detail === location.pathname.substring(1)) location.reload();
    });
  } catch (err) {
    logger.error("Failed to setup web socket connection with dev server", err);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAtQ2FwcnEydmsuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4xOC4xNV9AdHlwZXMrbm9kZUAyMC5fODJiOGYwOWFhZGFmYmNiMjZkYzBhYThjZDhmYzJjMDAvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3ZpcnR1YWwvcmVsb2FkLWh0bWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gc3JjL3NhbmRib3gvdXRpbHMvbG9nZ2VyLnRzXG5mdW5jdGlvbiBwcmludChtZXRob2QsIC4uLmFyZ3MpIHtcbiAgaWYgKGltcG9ydC5tZXRhLmVudi5NT0RFID09PSBcInByb2R1Y3Rpb25cIikgcmV0dXJuO1xuICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09IFwic3RyaW5nXCIpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gYXJncy5zaGlmdCgpO1xuICAgIG1ldGhvZChgW3d4dF0gJHttZXNzYWdlfWAsIC4uLmFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIG1ldGhvZChcIlt3eHRdXCIsIC4uLmFyZ3MpO1xuICB9XG59XG52YXIgbG9nZ2VyID0ge1xuICBkZWJ1ZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZGVidWcsIC4uLmFyZ3MpLFxuICBsb2c6ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLmxvZywgLi4uYXJncyksXG4gIHdhcm46ICguLi5hcmdzKSA9PiBwcmludChjb25zb2xlLndhcm4sIC4uLmFyZ3MpLFxuICBlcnJvcjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUuZXJyb3IsIC4uLmFyZ3MpXG59O1xuXG4vLyBzcmMvc2FuZGJveC9kZXYtc2VydmVyLXdlYnNvY2tldC50c1xudmFyIHdzO1xuZnVuY3Rpb24gZ2V0RGV2U2VydmVyV2ViU29ja2V0KCkge1xuICBpZiAoaW1wb3J0Lm1ldGEuZW52LkNPTU1BTkQgIT09IFwic2VydmVcIilcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgIFwiTXVzdCBiZSBydW5uaW5nIFdYVCBkZXYgY29tbWFuZCB0byBjb25uZWN0IHRvIGNhbGwgZ2V0RGV2U2VydmVyV2ViU29ja2V0KClcIlxuICAgICk7XG4gIGlmICh3cyA9PSBudWxsKSB7XG4gICAgY29uc3Qgc2VydmVyVXJsID0gYCR7X19ERVZfU0VSVkVSX1BST1RPQ09MX199Ly8ke19fREVWX1NFUlZFUl9IT1NUTkFNRV9ffToke19fREVWX1NFUlZFUl9QT1JUX199YDtcbiAgICBsb2dnZXIuZGVidWcoXCJDb25uZWN0aW5nIHRvIGRldiBzZXJ2ZXIgQFwiLCBzZXJ2ZXJVcmwpO1xuICAgIHdzID0gbmV3IFdlYlNvY2tldChzZXJ2ZXJVcmwsIFwidml0ZS1obXJcIik7XG4gICAgd3MuYWRkV3h0RXZlbnRMaXN0ZW5lciA9IHdzLmFkZEV2ZW50TGlzdGVuZXIuYmluZCh3cyk7XG4gICAgd3Muc2VuZEN1c3RvbSA9IChldmVudCwgcGF5bG9hZCkgPT4gd3M/LnNlbmQoSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiBcImN1c3RvbVwiLCBldmVudCwgcGF5bG9hZCB9KSk7XG4gICAgd3MuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgKCkgPT4ge1xuICAgICAgbG9nZ2VyLmRlYnVnKFwiQ29ubmVjdGVkIHRvIGRldiBzZXJ2ZXJcIik7XG4gICAgfSk7XG4gICAgd3MuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsICgpID0+IHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhcIkRpc2Nvbm5lY3RlZCBmcm9tIGRldiBzZXJ2ZXJcIik7XG4gICAgfSk7XG4gICAgd3MuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIChldmVudCkgPT4ge1xuICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGNvbm5lY3QgdG8gZGV2IHNlcnZlclwiLCBldmVudCk7XG4gICAgfSk7XG4gICAgd3MuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgKGUpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGUuZGF0YSk7XG4gICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwiY3VzdG9tXCIpIHtcbiAgICAgICAgICB3cz8uZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChtZXNzYWdlLmV2ZW50LCB7IGRldGFpbDogbWVzc2FnZS5kYXRhIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBoYW5kbGUgbWVzc2FnZVwiLCBlcnIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiB3cztcbn1cblxuLy8gc3JjL3ZpcnR1YWwvcmVsb2FkLWh0bWwudHNcbmlmIChpbXBvcnQubWV0YS5lbnYuQ09NTUFORCA9PT0gXCJzZXJ2ZVwiKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgd3MyID0gZ2V0RGV2U2VydmVyV2ViU29ja2V0KCk7XG4gICAgd3MyLmFkZFd4dEV2ZW50TGlzdGVuZXIoXCJ3eHQ6cmVsb2FkLXBhZ2VcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuZGV0YWlsID09PSBsb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMSkpIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gc2V0dXAgd2ViIHNvY2tldCBjb25uZWN0aW9uIHdpdGggZGV2IHNlcnZlclwiLCBlcnIpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLFNBQVMsTUFBTSxXQUFXLE1BQU07QUFFOUIsTUFBSSxPQUFPLEtBQUssQ0FBQyxNQUFNLFVBQVU7QUFDL0IsVUFBTSxVQUFVLEtBQUssTUFBQTtBQUNyQixXQUFPLFNBQVMsT0FBTyxJQUFJLEdBQUcsSUFBSTtBQUFBLEVBQ3BDLE9BQU87QUFDTCxXQUFPLFNBQVMsR0FBRyxJQUFJO0FBQUEsRUFDekI7QUFDRjtBQUNBLElBQUksU0FBUztBQUFBLEVBQ1gsT0FBTyxJQUFJLFNBQVMsTUFBTSxRQUFRLE9BQU8sR0FBRyxJQUFJO0FBQUEsRUFDaEQsS0FBSyxJQUFJLFNBQVMsTUFBTSxRQUFRLEtBQUssR0FBRyxJQUFJO0FBQUEsRUFDNUMsTUFBTSxJQUFJLFNBQVMsTUFBTSxRQUFRLE1BQU0sR0FBRyxJQUFJO0FBQUEsRUFDOUMsT0FBTyxJQUFJLFNBQVMsTUFBTSxRQUFRLE9BQU8sR0FBRyxJQUFJO0FBQ2xEO0FBR0EsSUFBSTtBQUNKLFNBQVMsd0JBQXdCO0FBSy9CLE1BQUksTUFBTSxNQUFNO0FBQ2QsVUFBTSxZQUFZLEdBQUcsS0FBdUIsS0FBSyxXQUF1QixJQUFJLElBQW1CO0FBQy9GLFdBQU8sTUFBTSw4QkFBOEIsU0FBUztBQUNwRCxTQUFLLElBQUksVUFBVSxXQUFXLFVBQVU7QUFDeEMsT0FBRyxzQkFBc0IsR0FBRyxpQkFBaUIsS0FBSyxFQUFFO0FBQ3BELE9BQUcsYUFBYSxDQUFDLE9BQU8sWUFBWSx5QkFBSSxLQUFLLEtBQUssVUFBVSxFQUFFLE1BQU0sVUFBVSxPQUFPLFFBQUEsQ0FBUztBQUM5RixPQUFHLGlCQUFpQixRQUFRLE1BQU07QUFDaEMsYUFBTyxNQUFNLHlCQUF5QjtBQUFBLElBQ3hDLENBQUM7QUFDRCxPQUFHLGlCQUFpQixTQUFTLE1BQU07QUFDakMsYUFBTyxNQUFNLDhCQUE4QjtBQUFBLElBQzdDLENBQUM7QUFDRCxPQUFHLGlCQUFpQixTQUFTLENBQUMsVUFBVTtBQUN0QyxhQUFPLE1BQU0sbUNBQW1DLEtBQUs7QUFBQSxJQUN2RCxDQUFDO0FBQ0QsT0FBRyxpQkFBaUIsV0FBVyxDQUFDLE1BQU07QUFDcEMsVUFBSTtBQUNGLGNBQU0sVUFBVSxLQUFLLE1BQU0sRUFBRSxJQUFJO0FBQ2pDLFlBQUksUUFBUSxTQUFTLFVBQVU7QUFDN0IsbUNBQUk7QUFBQSxZQUNGLElBQUksWUFBWSxRQUFRLE9BQU8sRUFBRSxRQUFRLFFBQVEsTUFBTTtBQUFBO0FBQUEsUUFFM0Q7QUFBQSxNQUNGLFNBQVMsS0FBSztBQUNaLGVBQU8sTUFBTSw0QkFBNEIsR0FBRztBQUFBLE1BQzlDO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNBLFNBQU87QUFDVDtBQUd5QztBQUN2QyxNQUFJO0FBQ0YsVUFBTSxNQUFNLHNCQUFBO0FBQ1osUUFBSSxvQkFBb0IsbUJBQW1CLENBQUMsVUFBVTtBQUNwRCxVQUFJLE1BQU0sV0FBVyxTQUFTLFNBQVMsVUFBVSxDQUFDLFlBQVksT0FBQTtBQUFBLElBQ2hFLENBQUM7QUFBQSxFQUNILFNBQVMsS0FBSztBQUNaLFdBQU8sTUFBTSx5REFBeUQsR0FBRztBQUFBLEVBQzNFO0FBQ0Y7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzBdfQ==
