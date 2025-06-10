const source = "msw-devtools-content-script";

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
      window.postMessage({ source, type: "GET_MSW_HANDLERS_REQUEST" }, "*");
      break;
    case "TOGGLE_HANDLER":
      window.postMessage(
        { source, type: "TOGGLE_HANDLER_REQUEST", payload: message.payload },
        "*"
      );
      break;
  }
  return true;
});

// 4. injected-script로부터 응답을 받으면 DevTools로 전달
window.addEventListener("message", (event) => {
  // 우리가 보낸 요청에 대한 응답인지 확인
  if (
    event.source !== window ||
    event.data.source !== "msw-devtools-injected-script"
  ) {
    return;
  }

  const { type, payload } = event.data;

  switch (type) {
    case "GET_MSW_HANDLERS_RESPONSE":
      // 받은 핸들러 정보를 background script나 DevTools로 전달합니다.
      chrome.runtime.sendMessage({
        type: "STATE_UPDATE",
        payload: event.data.payload,
      });
      break;
    case "TOGGLE_HANDLER_RESPONSE":
      // 실제 상태 업데이트 알림은 'mswStateChanged' 이벤트로부터 올 것이므로 따로 응답 필요 없음
      break;
    case "MSW_STATE_CHANGED_EVENT":
      chrome.runtime.sendMessage({
        type: "STATE_CHANGED_NOTIFICATION",
      });
      break;
  }
});
