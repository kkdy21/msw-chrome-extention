const source = "msw-devtools-injected-script";

// 1. content-script로부터 요청을 받아 mswControl 객체의 함수를 실행
window.addEventListener("message", async (event) => {
  // 신뢰할 수 있는 소스(자기 자신)의 메시지만 처리
  if (
    event.source !== window ||
    !event.data ||
    !event.data.type ||
    event.data.source !== "msw-devtools-content-script"
  )
    return;

  const { type, payload } = event.data;

  // A. 핸들러 목록 가져오기 요청
  if (type === "GET_MSW_HANDLERS_REQUEST") {
    if (window.mswControl?.getHandlers) {
      const handlers = window.mswControl.getHandlers();
      window.postMessage(
        { source, type: "GET_MSW_HANDLERS_RESPONSE", payload: handlers },
        "*"
      );
    } else {
      window.postMessage(
        {
          source,
          type: "GET_MSW_HANDLERS_RESPONSE",
          payload: null,
          error: "MSW_NOT_FOUND",
        },
        "*"
      );
    }
    return;
  }

  if (type === "TOGGLE_HANDLER_REQUEST") {
    const { id, enabled } = payload;
    if (enabled) {
      window.mswControl.enableHandler(id);
    } else {
      window.mswControl.disableHandler(id);
    }
    window.postMessage(
      { source, type: "TOGGLE_HANDLER_RESPONSE", payload: { id, enabled } },
      "*"
    );
  }
});

// 2. MSW 상태 변경 이벤트를 감지하여 content-script로 전달
// (MSWController의 reinitialize 메서드는 'mswStateChanged' 이벤트를 발생시킴)
window.addEventListener("mswStateChanged", () => {
  window.postMessage({ source, type: "MSW_STATE_CHANGED_EVENT" }, "*");
});
