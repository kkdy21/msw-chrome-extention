import { MockHandlerInfo } from "@/types/types";
import { useState, useEffect, useMemo, useRef } from "react";
// 올바른 타입 경로를 위해 상대 경로 사용

type GroupedHandlers = Record<string, MockHandlerInfo[]>;

function App() {
  const [handlers, setHandlers] = useState<MockHandlerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const portRef = useRef<chrome.runtime.Port | null>(null);

  useEffect(() => {
    // 백그라운드 스크립트와 연결 설정
    const port = chrome.runtime.connect({ name: "devtools-panel" });
    portRef.current = port;

    // 탭 ID를 전송하여 연결 초기화
    port.postMessage({
      name: "init",
      tabId: chrome.devtools.inspectedWindow.tabId,
    });

    // 백그라운드 스크립트로부터 메시지 수신
    port.onMessage.addListener((message) => {
      console.log("패널이 메시지를 수신했습니다:", message);
      if (message.type === "INIT_SUCCESS") {
        // 연결 준비 완료, 초기 상태 요청
        port.postMessage({
          type: "GET_STATE",
          tabId: chrome.devtools.inspectedWindow.tabId,
        });
      } else if (message.type === "STATE_UPDATE") {
        setHandlers(message.payload);
        setLoading(false);
        setError(null);
      } else if (message.type === "STATE_CHANGED_NOTIFICATION") {
        // SSoT가 변경되었습니다. 아직 UI를 업데이트하지 마세요.
        // 대신 새로운 상태를 요청합니다.
        port.postMessage({
          type: "GET_STATE",
          tabId: chrome.devtools.inspectedWindow.tabId,
        });
      }
    });

    return () => {
      port.disconnect();
      portRef.current = null;
    };
  }, []);

  const groupedHandlers = useMemo<GroupedHandlers>(() => {
    return handlers.reduce((acc, handler) => {
      const group = handler.groupName || "Uncategorized";
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(handler);
      return acc;
    }, {} as GroupedHandlers);
  }, [handlers]);

  const handleToggle = (id: string, currentEnabled: boolean) => {
    if (portRef.current) {
      // 콘텐츠 스크립트에 '명령'을 보냅니다. 로컬 상태는 업데이트하지 않습니다.
      portRef.current.postMessage({
        type: "TOGGLE_HANDLER",
        payload: { id, enabled: !currentEnabled },
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    }
  };

  if (loading) return <div>MSW 핸들러 로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  console.log("groupedHandlers", groupedHandlers);

  return (
    <div className="container">
      <h1>MSW Controls</h1>
      {Object.entries(groupedHandlers).map(([groupName, handlerList]) => (
        <details key={groupName} open>
          <summary>{groupName}</summary>
          <ul>
            {handlerList.map((handler) => (
              <li key={handler.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={handler.enabled}
                    onChange={() => handleToggle(handler.id, handler.enabled)}
                  />
                  <span className={handler.enabled ? "enabled" : "disabled"}>
                    {handler.description}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

export default App;
