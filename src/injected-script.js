console.log("[Injected Script] 로드됨.");

// 1. content-script로부터 요청을 받아 mswControl 객체의 함수를 실행
window.addEventListener("message", async (event) => {
  // 신뢰할 수 있는 소스(자기 자신)의 메시지만 처리
  if (event.source !== window || !event.data || !event.data.type) return;

  const { type, payload } = event.data;

  // A. 핸들러 목록 가져오기 요청
  if (type === "GET_MSW_HANDLERS_REQUEST") {
    console.log("[Injected Script] GET_MSW_HANDLERS_REQUEST 수신");
    if (window.mswControl?.getHandlers) {
      const handlers = window.mswControl.getHandlers();
      window.postMessage(
        { type: "GET_MSW_HANDLERS_RESPONSE", payload: handlers },
        "*"
      );
    } else {
      window.postMessage(
        {
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
    console.log("[Injected Script] TOGGLE_HANDLER 수신", id, enabled);
    if (enabled) {
      window.mswControl.enableHandler(id);
    } else {
      window.mswControl.disableHandler(id);
    }
    window.postMessage(
      { type: "TOGGLE_HANDLER_RESPONSE", payload: { id, enabled } },
      "*"
    );
  }
});

// 2. MSW 상태 변경 이벤트를 감지하여 content-script로 전달
// (MSWController의 reinitialize 메서드는 'mswStateChanged' 이벤트를 발생시킴)
window.addEventListener("mswStateChanged", () => {
  console.log('[Injected Script] "mswStateChanged" 이벤트를 감지했습니다.');
  window.postMessage({ type: "MSW_STATE_CHANGED_EVENT" }, "*");
});
