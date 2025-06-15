import { MockHandlerInfo } from "@/types/types";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import "./App.css";

type GroupedHandlers = Record<string, MockHandlerInfo[]>;

function App() {
  const [handlers, setHandlers] = useState<MockHandlerInfo[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const portRef = useRef<chrome.runtime.Port | null>(null);

  const inititialize = useCallback(() => {
    console.log("패널 초기화 및 백그라운드 연결을 시작합니다...");

    portRef.current?.disconnect();

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
      } else if (message.type === "MSW_NOT_FOUND_NOTIFICATION") {
        setError("MSW Not Found");
        setLoading(false);
      }
    });
  }, []);

  const groupedHandlers = useMemo<GroupedHandlers>(() => {
    if (!handlers) {
      return {};
    }
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

  const handleToggleAll = (currentEnabled: boolean) => {
    if (portRef.current && handlers) {
      portRef.current?.postMessage({
        type: "TOGGLE_ALL_HANDLER",
        payload: { enabled: currentEnabled },
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    }
  };

  const handleToggleGroup = (groupName: string, currentEnabled: boolean) => {
    if (portRef.current && groupedHandlers[groupName]) {
      portRef.current?.postMessage({
        type: "TOGGLE_GROUP_HANDLER",
        payload: {
          groupName,
          enabled: currentEnabled,
        },
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    }
  };

  const isGroupAllEnabled = (groupName: string) => {
    return (
      groupedHandlers[groupName]?.every((handler) => handler.enabled) ?? false
    );
  };

  const isGroupAllDisabled = (groupName: string) => {
    return (
      groupedHandlers[groupName]?.every((handler) => !handler.enabled) ?? false
    );
  };

  const isAllEnabled = useMemo(() => {
    return handlers?.every((handler) => handler.enabled) ?? false;
  }, [handlers]);

  const isAllDisabled = useMemo(() => {
    return handlers?.every((handler) => !handler.enabled) ?? false;
  }, [handlers]);

  useEffect(() => {
    // 백그라운드 스크립트와 연결 설정
    inititialize();

    const handleNavigated = (url: string) => {
      console.log(
        `페이지가 다음 주소로 이동했습니다. ${url} 연결을 재초기화합니다.`
      );
      inititialize();
    };

    chrome.devtools.network.onNavigated.addListener(handleNavigated);

    return () => {
      chrome.devtools.network.onNavigated.removeListener(handleNavigated);
      if (portRef.current) {
        portRef.current.disconnect();
        portRef.current = null;
      }
    };
  }, [inititialize]);

  if (loading) return <div>MSW 핸들러 로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1>MSW Controls</h1>
      <div className="global-controls">
        <button onClick={() => handleToggleAll(true)} disabled={isAllEnabled}>
          전체 활성화
        </button>
        <button onClick={() => handleToggleAll(false)} disabled={isAllDisabled}>
          전체 비활성화
        </button>
      </div>
      {Object.entries(groupedHandlers).map(([groupName, handlerList]) => (
        <details key={groupName} open>
          <summary className="group-box">
            <div className="group-header">
              <input
                type="checkbox"
                checked={isGroupAllEnabled(groupName)}
                onChange={(e) => handleToggleGroup(groupName, e.target.checked)}
              />
              <span>{groupName}</span>
            </div>
          </summary>
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

/*
FIXME 
1. group id 로 enable불가 문제
*/
