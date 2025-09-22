import { renderHook, act } from "@testing-library/react";
import {
  useMobileOptimizations,
  useMobilePerformance,
} from "../useMobileOptimizations";

// Mock DOM APIs that aren't available in Jest environment
const mockMatchMedia = (matches: boolean) => ({
  matches,
  addListener: jest.fn(),
  removeListener: jest.fn(),
});

// Mock getComputedStyle
const mockGetComputedStyle = (safeAreaValues: Record<string, string>) => {
  return {
    getPropertyValue: (property: string) => {
      const key = property.replace("env(", "").replace(")", "");
      return safeAreaValues[key] || "0";
    },
  };
};

describe("useMobileOptimizations", () => {
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  let originalDevicePixelRatio: number;
  let originalMatchMedia: typeof window.matchMedia;
  let originalGetComputedStyle: typeof window.getComputedStyle;

  beforeEach(() => {
    // Store original values
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    originalDevicePixelRatio = window.devicePixelRatio;
    originalMatchMedia = window.matchMedia;
    originalGetComputedStyle = window.getComputedStyle;

    // Set up default mocks
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(() => mockMatchMedia(false)),
    });

    Object.defineProperty(window, "getComputedStyle", {
      writable: true,
      value: jest.fn().mockImplementation(() => mockGetComputedStyle({})),
    });

    // Mock screen orientation
    Object.defineProperty(window, "screen", {
      writable: true,
      value: {
        orientation: { angle: 0 },
      },
    });

    // Mock visual viewport
    Object.defineProperty(window, "visualViewport", {
      writable: true,
      value: {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    });
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, "innerWidth", { value: originalInnerWidth });
    Object.defineProperty(window, "innerHeight", {
      value: originalInnerHeight,
    });
    Object.defineProperty(window, "devicePixelRatio", {
      value: originalDevicePixelRatio,
    });
    Object.defineProperty(window, "matchMedia", { value: originalMatchMedia });
    Object.defineProperty(window, "getComputedStyle", {
      value: originalGetComputedStyle,
    });
  });

  describe("Device Detection", () => {
    test("should correctly detect portrait orientation", () => {
      // Set portrait dimensions
      Object.defineProperty(window, "innerWidth", {
        value: 375,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: 667,
        configurable: true,
      });

      const { result } = renderHook(() => useMobileOptimizations());

      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
    });

    test("should correctly detect landscape orientation", () => {
      // Set landscape dimensions
      Object.defineProperty(window, "innerWidth", {
        value: 667,
        configurable: true,
      });
      Object.defineProperty(window, "innerHeight", {
        value: 375,
        configurable: true,
      });

      const { result } = renderHook(() => useMobileOptimizations());

      expect(result.current.isPortrait).toBe(false);
      expect(result.current.isLandscape).toBe(true);
    });

    test("should correctly categorize screen sizes", () => {
      // Test small screen (< 375px)
      Object.defineProperty(window, "innerWidth", {
        value: 320,
        configurable: true,
      });
      const { result: smallResult } = renderHook(() =>
        useMobileOptimizations(),
      );
      expect(smallResult.current.screenSize).toBe("small");

      // Test medium screen (375px - 768px)
      Object.defineProperty(window, "innerWidth", {
        value: 500,
        configurable: true,
      });
      const { result: mediumResult } = renderHook(() =>
        useMobileOptimizations(),
      );
      expect(mediumResult.current.screenSize).toBe("medium");

      // Test large screen (> 768px)
      Object.defineProperty(window, "innerWidth", {
        value: 1024,
        configurable: true,
      });
      const { result: largeResult } = renderHook(() =>
        useMobileOptimizations(),
      );
      expect(largeResult.current.screenSize).toBe("large");
    });

    test("should detect device with notch using safe area insets", () => {
      Object.defineProperty(window, "getComputedStyle", {
        value: () =>
          mockGetComputedStyle({
            "safe-area-inset-top": "44",
            "safe-area-inset-bottom": "34",
          }),
      });

      const { result } = renderHook(() => useMobileOptimizations());

      expect(result.current.hasNotch).toBe(true);
      expect(result.current.safeArea.top).toBe(44);
      expect(result.current.safeArea.bottom).toBe(34);
    });

    test("should detect standalone PWA mode", () => {
      Object.defineProperty(window, "matchMedia", {
        value: jest.fn().mockImplementation((query: string) => {
          if (query === "(display-mode: standalone)") {
            return mockMatchMedia(true);
          }
          return mockMatchMedia(false);
        }),
      });

      const { result } = renderHook(() => useMobileOptimizations());

      expect(result.current.isStandalone).toBe(true);
    });

    test("should capture device pixel ratio", () => {
      Object.defineProperty(window, "devicePixelRatio", {
        value: 3,
        configurable: true,
      });

      const { result } = renderHook(() => useMobileOptimizations());

      expect(result.current.devicePixelRatio).toBe(3);
    });
  });

  describe("Event Listeners", () => {
    test("should update state on window resize", () => {
      const { result } = renderHook(() => useMobileOptimizations());

      // Change window dimensions
      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 1024,
          configurable: true,
        });
        Object.defineProperty(window, "innerHeight", {
          value: 768,
          configurable: true,
        });
        window.dispatchEvent(new Event("resize"));
      });

      expect(result.current.screenSize).toBe("large");
      expect(result.current.isLandscape).toBe(true);
    });

    test("should update state on orientation change with delay", async () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useMobileOptimizations());

      act(() => {
        Object.defineProperty(window, "innerWidth", {
          value: 375,
          configurable: true,
        });
        Object.defineProperty(window, "innerHeight", {
          value: 667,
          configurable: true,
        });
        window.dispatchEvent(new Event("orientationchange"));
      });

      // Should not update immediately
      expect(result.current.isPortrait).toBe(false);

      // Fast forward timers
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(result.current.isPortrait).toBe(true);

      jest.useRealTimers();
    });

    test("should handle visual viewport resize if supported", () => {
      const mockAddEventListener = jest.fn();
      const mockRemoveEventListener = jest.fn();

      Object.defineProperty(window, "visualViewport", {
        value: {
          addEventListener: mockAddEventListener,
          removeEventListener: mockRemoveEventListener,
        },
      });

      const { unmount } = renderHook(() => useMobileOptimizations());

      expect(mockAddEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function),
      );
    });
  });

  describe("Edge Cases", () => {
    test("should handle missing screen orientation API", () => {
      Object.defineProperty(window, "screen", {
        value: undefined,
      });

      const { result } = renderHook(() => useMobileOptimizations());

      // Should still work without orientation API
      expect(result.current).toBeDefined();
      expect(typeof result.current.isPortrait).toBe("boolean");
    });

    test("should handle missing safe area values gracefully", () => {
      Object.defineProperty(window, "getComputedStyle", {
        value: () => mockGetComputedStyle({}),
      });

      const { result } = renderHook(() => useMobileOptimizations());

      expect(result.current.safeArea).toEqual({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      });
      expect(result.current.hasNotch).toBe(false);
    });

    test("should handle missing devicePixelRatio", () => {
      Object.defineProperty(window, "devicePixelRatio", { value: undefined });

      const { result } = renderHook(() => useMobileOptimizations());

      expect(result.current.devicePixelRatio).toBe(1);
    });
  });
});

describe("useMobilePerformance", () => {
  let originalNavigator: Navigator;

  beforeEach(() => {
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    global.navigator = originalNavigator;
  });

  describe("Performance Scoring", () => {
    test("should detect high performance device", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          ...originalNavigator,
          deviceMemory: 8, // 8GB RAM
          hardwareConcurrency: 8, // 8 CPU cores
          connection: { effectiveType: "4g" },
        },
        configurable: true,
      });

      const { result } = renderHook(() => useMobilePerformance());

      expect(result.current.isHighPerformance).toBe(true);
      expect(result.current.settings).toEqual({
        antialiasing: true,
        shadows: true,
        particleCount: 100,
        renderDistance: 15,
        frameTarget: 60,
      });
    });

    test("should detect low performance device", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          ...originalNavigator,
          deviceMemory: 1, // 1GB RAM
          hardwareConcurrency: 2, // 2 CPU cores
          connection: { effectiveType: "3g" },
        },
        configurable: true,
      });

      const { result } = renderHook(() => useMobilePerformance());

      expect(result.current.isHighPerformance).toBe(false);
      expect(result.current.settings).toEqual({
        antialiasing: false,
        shadows: false,
        particleCount: 50,
        renderDistance: 10,
        frameTarget: 30,
      });
    });

    test("should handle medium performance device", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          ...originalNavigator,
          deviceMemory: 4, // 4GB RAM
          hardwareConcurrency: 4, // 4 CPU cores
          connection: { effectiveType: "4g" },
        },
        configurable: true,
      });

      const { result } = renderHook(() => useMobilePerformance());

      // Score: 3 (memory) + 2 (cores) + 2 (connection) = 7 >= 6
      expect(result.current.isHighPerformance).toBe(true);
    });

    test("should handle missing device capabilities gracefully", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          ...originalNavigator,
          deviceMemory: undefined,
          hardwareConcurrency: undefined,
          connection: undefined,
        },
        configurable: true,
      });

      const { result } = renderHook(() => useMobilePerformance());

      // Should not crash and provide sensible defaults
      expect(result.current).toBeDefined();
      expect(typeof result.current.isHighPerformance).toBe("boolean");
      expect(result.current.settings).toBeDefined();
    });

    test("should handle partial device capabilities", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          ...originalNavigator,
          deviceMemory: 2, // 2GB RAM
          hardwareConcurrency: 4, // 4 CPU cores
          connection: null, // No connection info
        },
        configurable: true,
      });

      const { result } = renderHook(() => useMobilePerformance());

      // Score: 2 (memory) + 2 (cores) + 0 (no connection) = 4 < 6
      expect(result.current.isHighPerformance).toBe(false);
    });
  });

  describe("Performance Settings", () => {
    test("should provide correct settings for high performance", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          ...originalNavigator,
          deviceMemory: 6,
          hardwareConcurrency: 6,
          connection: { effectiveType: "4g" },
        },
        configurable: true,
      });

      const { result } = renderHook(() => useMobilePerformance());

      expect(result.current.settings.antialiasing).toBe(true);
      expect(result.current.settings.shadows).toBe(true);
      expect(result.current.settings.particleCount).toBe(100);
      expect(result.current.settings.renderDistance).toBe(15);
      expect(result.current.settings.frameTarget).toBe(60);
    });

    test("should provide correct settings for low performance", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          ...originalNavigator,
          deviceMemory: 1,
          hardwareConcurrency: 2,
          connection: { effectiveType: "2g" },
        },
        configurable: true,
      });

      const { result } = renderHook(() => useMobilePerformance());

      expect(result.current.settings.antialiasing).toBe(false);
      expect(result.current.settings.shadows).toBe(false);
      expect(result.current.settings.particleCount).toBe(50);
      expect(result.current.settings.renderDistance).toBe(10);
      expect(result.current.settings.frameTarget).toBe(30);
    });
  });
});
