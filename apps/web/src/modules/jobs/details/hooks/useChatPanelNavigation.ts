"use client";

import { useCallback, useState } from "react";

export function useChatPanelNavigation() {
  const [showList, setShowList] = useState(true);

  const navigateToChat = useCallback(() => {
    setShowList(false);
  }, []);

  const navigateToList = useCallback(() => {
    setShowList(true);
  }, []);

  return { showList, navigateToChat, navigateToList };
}
