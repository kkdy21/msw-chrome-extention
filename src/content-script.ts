console.log("MSW DevTools Controller: content-script loaded");

// 페이지의 커스텀 이벤트를 수신하고 백그라운드 스크립트에 알립니다.
window.addEventListener("mswStateChanged", () => {
  console.log("ContentScript: 'mswStateChanged' 이벤트 감지. 패널에 알림.");
  chrome.runtime.sendMessage({ type: "STATE_CHANGED_NOTIFICATION" });
});

// 백그라운드 스크립트로부터의 메시지(명령/요청)를 수신합니다.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("content-script onMessage request", request);
  console.log("content-script onMessage sender", sender);
  if (typeof window.mswControl === "undefined") {
    // mswControl이 아직 준비되지 않았으면 아무것도 할 수 없습니다.
    // 페이지가 완전히 로드되기 전에 패널이 열리면 발생할 수 있습니다.
    sendResponse({ error: "window에서 mswControl을 사용할 수 없습니다." });
    return true;
  }

  switch (request.type) {
    case "GET_STATE":
      console.log("ContentScript: 패널로부터 GET_STATE 요청 수신.");
      const handlers = window.mswControl.getHandlers();
      sendResponse({ type: "STATE_UPDATE", payload: handlers });
      break;

    case "TOGGLE_HANDLER":
      console.log("ContentScript: TOGGLE_HANDLER 명령 수신.", request.payload);
      const { id, enabled } = request.payload;
      if (enabled) {
        window.mswControl
          .enableHandler(id)
          .then(() => sendResponse({ success: true }));
      } else {
        window.mswControl
          .disableHandler(id)
          .then(() => sendResponse({ success: true }));
      }
      // 실제 상태 업데이트 알림은 'mswStateChanged' 이벤트로부터 올 것입니다.
      break;

    default:
      sendResponse({ error: "알 수 없는 요청 유형입니다." });
      break;
  }

  // 비동기 sendResponse를 위해 `return true`가 필수적입니다.
  return true;
});
