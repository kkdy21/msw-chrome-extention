// console.log("MSW DevTools Controller: content-script loaded");

// // 페이지의 커스텀 이벤트를 수신하고 백그라운드 스크립트에 알립니다.
// window.addEventListener("mswStateChanged", () => {
//   console.log("ContentScript: 'mswStateChanged' 이벤트 감지. 패널에 알림.");
//   chrome.runtime.sendMessage({ type: "STATE_CHANGED_NOTIFICATION" });
// });

// // 백그라운드 스크립트로부터의 메시지(명령/요청)를 수신합니다.
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log("content-script onMessage request", request);
//   console.log("content-script onMessage sender", sender);
//   console.log("window.mswControl", window.mswControl);
//   if (typeof window.mswControl === "undefined") {
//     // mswControl이 아직 준비되지 않았으면 아무것도 할 수 없습니다.
//     // 페이지가 완전히 로드되기 전에 패널이 열리면 발생할 수 있습니다.
//     sendResponse({ error: "window에서 mswControl을 사용할 수 없습니다." });
//     return true;
//   }

//   switch (request.type) {
//     case "GET_STATE":
//       console.log("ContentScript: 패널로부터 GET_STATE 요청 수신.");
//       const handlers = window.mswControl.getHandlers();
//       sendResponse({ type: "STATE_UPDATE", payload: handlers });
//       break;

//     case "TOGGLE_HANDLER":
//       console.log("ContentScript: TOGGLE_HANDLER 명령 수신.", request.payload);
//       const { id, enabled } = request.payload;
//       if (enabled) {
//         window.mswControl
//           .enableHandler(id)
//           .then(() => sendResponse({ success: true }));
//       } else {
//         window.mswControl
//           .disableHandler(id)
//           .then(() => sendResponse({ success: true }));
//       }
//       // 실제 상태 업데이트 알림은 'mswStateChanged' 이벤트로부터 올 것입니다.
//       break;

//     default:
//       sendResponse({ error: "알 수 없는 요청 유형입니다." });
//       break;
//   }

//   // 비동기 sendResponse를 위해 `return true`가 필수적입니다.
//   return true;
// });

console.log("[Content Script] 로드됨.");

// 1. 웹 페이지에 injected-script.js를 주입하는 함수
function injectScript(filePath: string) {
  const script = document.createElement("script");
  script.setAttribute("type", "text/javascript");
  script.setAttribute("src", filePath);
  (document.head || document.documentElement).appendChild(script);
  script.onload = () => {
    script.remove(); // 스크립트 로드 후 DOM에서 제거해도 코드는 계속 실행됩니다.
  };
}

// 2. 주입 실행
injectScript(chrome.runtime.getURL("injected.js"));

// 3. DevTools로부터 메시지를 받으면, injected-script에 요청을 전달
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GET_STATE":
      console.log(
        "[Content Script] DevTools로부터 GET_STATE 요청을 받았습니다."
      );
      window.postMessage({ type: "GET_MSW_HANDLERS_REQUEST" }, "*");
      break;
    case "TOGGLE_HANDLER":
      console.log(
        "[Content Script] DevTools로부터 TOGGLE_HANDLER 요청을 받았습니다."
      );
      window.postMessage(
        { type: "TOGGLE_HANDLER_REQUEST", payload: message.payload },
        "*"
      );
      break;
    default:
      console.log(
        "[Content Script] 알 수 없는 메시지 타입입니다.",
        message.type
      );
      break;
  }
  return true;
});

// 4. injected-script로부터 응답을 받으면 DevTools로 전달
window.addEventListener("message", (event) => {
  // 우리가 보낸 요청에 대한 응답인지 확인
  if (event.source !== window) return;

  const { type, payload } = event.data;

  switch (type) {
    case "GET_MSW_HANDLERS_RESPONSE":
      console.log(
        "[Content Script] injected-script로부터 핸들러 응답을 받았습니다.",
        payload
      );
      // 받은 핸들러 정보를 background script나 DevTools로 전달합니다.
      chrome.runtime.sendMessage({
        type: "STATE_UPDATE",
        payload: event.data.payload,
      });
      break;
    case "TOGGLE_HANDLER_RESPONSE":
      console.log(
        "[Content Script] injected-script로부터 TOGGLE_HANDLER_RESPONSE 응답을 받았습니다.",
        payload
      );
      // 실제 상태 업데이트 알림은 'mswStateChanged' 이벤트로부터 올 것이므로 따로 응답 필요 없음
      break;
    case "MSW_STATE_CHANGED_EVENT":
      console.log(
        "[Content Script] injected-script로부터 MSW_STATE_CHANGED_EVENT 이벤트를 받았습니다."
      );
      chrome.runtime.sendMessage({
        type: "STATE_CHANGED_NOTIFICATION",
      });
      break;
    default:
      console.log("[Content Script] 알 수 없는 메시지 타입입니다.", type);
  }
});
